import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./test-apps",
  testMatch: /.*\/e2e\/.*\.spec\.ts/,
  fullyParallel: true,
  retries: 2,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  projects: [
    {
      name: "apollo-v3-react",
      testMatch: /apollo-v3-react\/e2e\/.*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:5173" },
    },
    {
      name: "apollo-v4-react",
      testMatch: /apollo-v4-react\/e2e\/.*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:5174" },
    },
    {
      name: "apollo-v4-persisted-cache",
      testMatch: /apollo-v4-persisted-cache\/e2e\/.*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:5175" },
    },
    {
      name: "apollo-v4-next-ssr",
      testMatch: /apollo-v4-next-ssr\/e2e\/.*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:5176" },
    },
    {
      name: "apollo-v4-issue-1041",
      testMatch: /apollo-v4-issue-1041\/e2e\/.*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:5177" },
    },
    {
      name: "apollo-v4-issue-1565",
      testMatch: /apollo-v4-issue-1565\/e2e\/.*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:5179" },
    },
  ],
  webServer: [
    {
      command: "pnpm --filter ./test-apps/graphql-test-server dev",
      url: "http://127.0.0.1:5178/health",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      stdout: "pipe",
      stderr: "pipe",
    },
    {
      command: "pnpm --filter ./test-apps/apollo-v3-react dev",
      url: "http://localhost:5173",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      stdout: "pipe",
      stderr: "pipe",
    },
    {
      command: "pnpm --filter ./test-apps/apollo-v4-react dev",
      url: "http://localhost:5174",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      stdout: "pipe",
      stderr: "pipe",
    },
    {
      command: "pnpm --filter ./test-apps/apollo-v4-persisted-cache dev",
      url: "http://localhost:5175",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      stdout: "pipe",
      stderr: "pipe",
    },
    {
      command: "pnpm --filter ./test-apps/apollo-v4-next-ssr dev",
      url: "http://localhost:5176",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      stdout: "pipe",
      stderr: "pipe",
    },
    {
      command: "pnpm --filter ./test-apps/apollo-v4-issue-1041 dev",
      url: "http://localhost:5177",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      stdout: "pipe",
      stderr: "pipe",
    },
    // Issue #1565 reproduces only in a production bundle, so build first then
    // serve via `vite preview` to exercise the minified output.
    {
      command: "pnpm --filter ./test-apps/apollo-v4-issue-1565 exec sh -c 'vite build && vite preview --port 5179 --strictPort'",
      url: "http://localhost:5179",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      stdout: "pipe",
      stderr: "pipe",
    },
  ],
});
