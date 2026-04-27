// Boots the local graphql-test-server as a subprocess before the
// integration suite runs, tears it down on teardown. Running the server
// out-of-process keeps its `graphql` module resolution isolated from
// vitest's Vite pre-bundler, which otherwise surfaces a "duplicate
// graphql modules" guard when @apollo/server boots inside the test
// process.
//
// If something is already listening at TEST_SERVER_URL (e.g. playwright
// started the server for parallel test-app runs), this setup reuses it
// instead of double-booting the port.
//
// Process-tree gotcha: spawning via `pnpm exec tsx ...` produces a
// process tree like (pnpm) -> (node tsx) -> server. SIGTERM on the
// outer pnpm does not reliably reach the grandchild on Linux, and the
// grandchild keeps inherited stdio file descriptors open, which keeps
// the GitHub Actions step waiting forever after vitest itself has
// exited. We work around both by:
//   1. spawning tsx directly via the local node_modules/.bin path so
//      there's only one child process to kill, and
//   2. making the child its own process-group leader (detached: true)
//      so we can signal the entire group with process.kill(-pid, sig),
//      and
//   3. piping stdio through this process and tagging each line so the
//      grandchild does not inherit the runner's stdio descriptors.

import { spawn, type ChildProcess } from "node:child_process";
import path from "node:path";

const TEST_SERVER_URL = process.env.TEST_SERVER_URL ?? "http://127.0.0.1:5178/graphql";
const DEBUG = process.env.RUN_INTEGRATION_DEBUG === "1" || process.env.CI === "true";

let child: ChildProcess | undefined;

function log(message: string): void {
  if (!DEBUG) return;

  console.log(`[integration-setup] ${new Date().toISOString()} ${message}`);
}

async function isReachable(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query: "{ __typename }" }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function waitForServer(url: string, timeoutMs = 10_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await isReachable(url)) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`graphql-test-server did not become reachable at ${url} within ${timeoutMs}ms`);
}

function killGroup(pid: number, signal: NodeJS.Signals): void {
  try {
    process.kill(-pid, signal);
  } catch (err) {
    log(`process.kill(${-pid}, ${signal}) failed: ${(err as Error).message}`);
  }
}

export async function setup(): Promise<void> {
  if (await isReachable(TEST_SERVER_URL)) {
    log(`server already reachable at ${TEST_SERVER_URL}; skipping spawn`);
    return;
  }

  const parsed = new URL(TEST_SERVER_URL);
  // vitest is always invoked from the repo root, so process.cwd() anchors
  // the spawn location regardless of how this setup file was discovered.
  const serverCwd = path.resolve(process.cwd(), "test-apps/graphql-test-server");
  const tsxBin = path.resolve(serverCwd, "node_modules/.bin/tsx");

  log(`spawning tsx at ${tsxBin} cwd=${serverCwd} port=${parsed.port || "5178"}`);

  child = spawn(tsxBin, ["src/cli.ts"], {
    cwd: serverCwd,
    env: {
      ...process.env,
      PORT: parsed.port || "5178",
      HOST: parsed.hostname,
    },
    // Detached makes the child its own process-group leader so teardown
    // can signal the whole group via process.kill(-pid, sig).
    detached: true,
    // Pipe stdio so the grandchild does not inherit the runner's
    // descriptors; we forward output here instead.
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout?.on("data", (chunk: Buffer) => {
    if (DEBUG) process.stdout.write(`[graphql-test-server] ${chunk.toString()}`);
  });
  child.stderr?.on("data", (chunk: Buffer) => {
    if (DEBUG) process.stderr.write(`[graphql-test-server] ${chunk.toString()}`);
  });
  child.on("exit", (code, signal) => {
    log(`server child exited code=${code ?? "null"} signal=${signal ?? "null"}`);
  });

  log(`spawned pid=${child.pid}; waiting for ${TEST_SERVER_URL}`);
  await waitForServer(TEST_SERVER_URL);
  log(`server reachable at ${TEST_SERVER_URL}`);
}

export async function teardown(): Promise<void> {
  const target = child;
  if (target?.pid === undefined) {
    log(`teardown: nothing to kill (no child pid)`);
    return;
  }
  child = undefined;
  const pid = target.pid;
  log(`teardown: SIGTERM process group ${-pid}`);
  killGroup(pid, "SIGTERM");
  await new Promise<void>((resolve) => {
    const escalate = setTimeout(() => {
      log(`teardown: SIGTERM timeout, escalating to SIGKILL on group ${-pid}`);
      killGroup(pid, "SIGKILL");
      resolve();
    }, 5_000);
    target.once("exit", () => {
      log(`teardown: child exited cleanly`);
      clearTimeout(escalate);
      resolve();
    });
  });
}
