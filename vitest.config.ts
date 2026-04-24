import { defineConfig } from "vitest/config";

// Only register the integration globalSetup (boots the local graphql
// test server) when RUN_INTEGRATION is set, so unit-only runs stay lean.
const integrationSetup = process.env.RUN_INTEGRATION
  ? ["./src/__tests__/integration/vitest.global-setup.ts"]
  : [];

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/__tests__/**/*.spec.ts"],
    globalSetup: integrationSetup,
    // graphql-js guards against duplicate module copies with an instanceof
    // check that throws on any mismatch. Without inlining it, Vite's
    // pre-bundler produces a second module instance (ESM copy) separate
    // from Node's CJS resolution used by @apollo/client and @graphql-tools.
    // Forcing graphql through Vite's transform keeps a single instance.
    server: {
      deps: {
        inline: ["graphql", /@graphql-tools\//],
      },
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "lcov"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/__tests__/**", "src/**/*.spec.ts"],
    },
  },
});
