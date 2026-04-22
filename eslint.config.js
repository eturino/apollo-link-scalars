// Flat-config migration of the legacy `.eslintrc`. ESLint 9+ removed the
// legacy config loader, so this file is now the single source of truth.
//
// Goal: tighten the defaults by pulling in the type-checked presets from
// @typescript-eslint so we catch common footguns (floating promises,
// misused promises, unsafe assignments, etc.) while keeping the rules
// that made sense in the previous setup.
//
// `eslint-plugin-import` was dropped: its lint value for a TypeScript
// project (unresolved imports, invalid named/default imports, export
// conflicts) is fully covered by the TypeScript compiler, and its peer
// dep range kept us from moving to ESLint 10.

const js = require("@eslint/js");
const tseslint = require("typescript-eslint");
const prettier = require("eslint-config-prettier");

module.exports = [
  {
    ignores: ["build/**", "coverage/**", "node_modules/**"],
  },

  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      // Historically off - keep this PR focused on the lint upgrade.
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "off",

      // The strict-type-checked preset ships a family of `no-unsafe-*`
      // rules that flag every interaction with an `any`-typed value.
      // This library deliberately threads untyped GraphQL data through
      // its parser/serializer pipeline (the whole point of custom
      // scalars is to coerce dynamic shapes at runtime), so these rules
      // fire hundreds of times without surfacing real bugs. Turning
      // them off here; the valuable type-checked rules below stay on.
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-base-to-string": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
      "@typescript-eslint/no-redundant-type-constituents": "off",

      // OperationTypeNode is a string-backed enum; comparing to a
      // string literal is the idiomatic way to branch on it.
      "@typescript-eslint/no-unsafe-enum-comparison": "off",

      // We intentionally reference the v3/v4-deprecated aliases
      // (`Operation`, `FetchResult`, `NextLink`) because they are the
      // only symbols that exist on both majors. Turning this rule off
      // until we drop v3 support.
      "@typescript-eslint/no-deprecated": "off",

      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "no-return-await": "error",
      eqeqeq: ["error", "always"],

      // Force regular imports to stay for runtime code only; type-only
      // imports must use `import type ...` or inline `import { type X }`.
      // Keeps the generated JS lean and makes intent obvious at the
      // import site.
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
          disallowTypeAnnotations: true,
        },
      ],
      "@typescript-eslint/no-import-type-side-effects": "error",
    },
  },

  {
    // The test helper casts `apolloExecute` to bridge the v3/v4 signature
    // gap. The cast is required on v4 and "unnecessary" on v3; rather than
    // litter the file with version-specific disables, turn the rule off
    // just for this helper.
    files: ["src/__tests__/helpers/test-utils.ts"],
    rules: {
      "@typescript-eslint/no-unnecessary-type-assertion": "off",
    },
  },

  {
    files: ["src/__tests__/**/*.ts", "**/*.spec.ts"],
    rules: {
      // Tests touch private helpers, assert on `any`, and sometimes
      // intentionally produce "unsafe" call sites. Disable the
      // type-checked rules that fight back against that.
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/unbound-method": "off",
      "@typescript-eslint/no-require-imports": "off",
    },
  },

  // Last so it overrides formatting rules from earlier extends.
  prettier,
];
