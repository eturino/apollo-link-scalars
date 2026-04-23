import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/__tests__/**/*.spec.ts"],
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
