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

import { spawn, type ChildProcess } from "node:child_process";
import path from "node:path";

const TEST_SERVER_URL = process.env.TEST_SERVER_URL ?? "http://127.0.0.1:5178/graphql";

let child: ChildProcess | undefined;

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

export async function setup(): Promise<void> {
  if (await isReachable(TEST_SERVER_URL)) return;

  const parsed = new URL(TEST_SERVER_URL);
  // vitest is always invoked from the repo root, so process.cwd() anchors
  // the spawn location regardless of how this setup file was discovered.
  const serverCwd = path.resolve(process.cwd(), "test-apps/graphql-test-server");

  child = spawn("pnpm", ["exec", "tsx", "src/cli.ts"], {
    cwd: serverCwd,
    env: {
      ...process.env,
      PORT: parsed.port || "5178",
      HOST: parsed.hostname,
    },
    stdio: ["ignore", "inherit", "inherit"],
  });

  await waitForServer(TEST_SERVER_URL);
}

export async function teardown(): Promise<void> {
  const target = child;
  if (!target) return;
  child = undefined;
  target.kill("SIGTERM");
  await new Promise<void>((resolve) => {
    target.once("exit", () => {
      resolve();
    });
    setTimeout(() => {
      target.kill("SIGKILL");
      resolve();
    }, 5_000);
  });
}
