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
  ],
  webServer: [
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
  ],
});
