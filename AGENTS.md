# apollo-link-scalars — agent notes

## What this repo ships

Custom Apollo Link that parses and serializes custom GraphQL scalars on the client. Supports Apollo Client v3 and v4. Also exposes `reviveScalarsInCache` for rehydrating scalar values in a JSON-persisted Apollo cache.

Entry: `src/index.ts`. Main runtime type is `ScalarApolloLink` in `src/lib/link.ts`; helper is `withScalars(...)`.

## Repo layout (pnpm workspace)

- `src/` — library source (TypeScript)
- `build/main/` — CJS build output (ships as `main` in package.json)
- `build/module/` — ESM build output (ships as `module`)
- `test-apps/` — pnpm workspace packages that consume `apollo-link-scalars` via `workspace:*`
  - `graphql-test-server` — Apollo Server (express + graphql-ws) on port 5178. Mirrors the rickandmortyapi.com schema for reads and adds mutations + subscriptions on top. State partitioned by `X-Run-Id` header; missing header routes to a shared read-only seed. Used by the integration spec and all Vite-based test-apps.
  - `apollo-v3-react` — Vite + React, Apollo v3, port 5173. Hits the local test server for `character(id)`.
  - `apollo-v4-react` — Vite + React, Apollo v4, port 5174. Hits the local test server for `character(id)`.
  - `apollo-v4-persisted-cache` — Vite + React, Apollo v4 with cache persistence, port 5175. Hits the local test server for `character(id)`.
  - `apollo-v4-next-ssr` — Next.js 16, Apollo v4 SSR, port 5176.
  - `apollo-v4-issue-1041` — Vite + React, Apollo v4, port 5177. Isolated repro for issue #1041 (cache-first with custom-serialized variables). Hosts its own minimal `events(at: DateTime)` GraphQL schema via vite `configureServer` middleware.
  - `apollo-v4-issue-1565` — Vite + React, Apollo v4, port 5179. Isolated repro for issue #1565 (`withScalars` link no-ops in `vite build` output because graphql-js class names get minified). Runs against `vite build && vite preview` (NOT `vite dev`) since the bug only reproduces in the minified production bundle. Hosts its own `Date` scalar schema via vite `configureServer` AND `configurePreviewServer` middleware.
- `playwright.config.ts` (root) — boots the test server first, then the six app servers (five via `vite dev`, plus `apollo-v4-issue-1565` via `vite build && vite preview`)

## CRITICAL build gotcha — test apps consume `build/`, not `src/`

`workspace:*` resolves through package.json `main: "build/main/index.js"` / `module: "build/module/index.js"`. Vite, Next, and anything else in `test-apps/` ALWAYS see the compiled artifact.

Consequence: editing `src/` alone does not affect `test-apps/` tests until you run `pnpm run build`. Unit tests (`vitest run`) compile from `src/` directly and are unaffected.

Flow for RED/GREEN reproductions at the e2e layer:

1. Edit `src/lib/...`
2. `pnpm run build`
3. Kill lingering Vite/Next dev servers: `lsof -ti:5173,5174,5175,5176,5177 | xargs -r kill -9` (Playwright's `reuseExistingServer: !CI` means stale servers stick across runs; Vite caches transformed deps even after rebuild)
4. `pnpm exec playwright test --project=apollo-v4-issue-1041` (or the relevant project)

For unit repros, `npx vitest run path/to/spec.ts` is enough — no build needed.

## Test runner

Unit: **vitest** (not jest). `pnpm test:unit` → `vitest run --coverage`. Specs live in `src/**/*.spec.ts`.

Integration: `pnpm test:integration` (gated by `RUN_INTEGRATION=1`, specs in `src/__tests__/integration`).

E2E: Playwright root config. `pnpm e2e` = build then `playwright test`. Single worker, 2 retries, Chromium.

Full matrix: `pnpm test:matrix` runs against Apollo v3 and v4 sequentially by swapping the installed `@apollo/client` version.

## Common scripts

- `pnpm run build` — clean then `tsc` for main + module outputs in parallel
- `pnpm test:lib` — build + eslint + prettier check + unit + dep cycle check (dpdm) + dead code (knip) + type-check
- `pnpm test:apps` — type-check + lint + build across all test-apps
- `pnpm test:full` — `test` + `test:integration`
- `pnpm exec playwright test --project=<name>` — targeted e2e. Projects: `apollo-v3-react`, `apollo-v4-react`, `apollo-v4-persisted-cache`, `apollo-v4-next-ssr`, `apollo-v4-issue-1041`, `apollo-v4-issue-1565`.

## Issue #1041 — cache-first with custom-serialized variables

**Bug:** `ScalarApolloLink.cleanVariables` mutated `operation.variables` in place, replacing Date-like instances with their custom-serialized string. Apollo internally uses that same variables object for cache-key identity and for cache writes, so a roundtrip `A → B → A` (fresh Date each time) would:
- Write cache keyed on the custom serialized string (e.g. `"2023-08-19T00:00:00.000+00:00"`)
- Miss on the third read because fresh Date stringifies via `toJSON` to ISO-Z (`"2023-08-19T00:00:00.000Z"`)
- Fire a redundant network request despite `fetchPolicy: "cache-first"`

**Fix:** shallow-clone `operation.variables` at the top of `cleanVariables` so the link serializes a detached copy, leaving Apollo's identity-bearing reference untouched.

**Tests covering the regression:**
- Unit: `src/__tests__/cache-first-serialized-variables.spec.ts` — reproduces deterministically with vitest.
- E2E: `test-apps/apollo-v4-issue-1041/e2e/issue-1041.spec.ts` — requires a rebuilt `build/` to go RED on the unfixed source (see the build gotcha above).

The `apollo-v4-issue-1041` app is a dedicated, minimal repro: its `vite.config.ts` hosts a `/graphql` endpoint via `configureServer` middleware with a `events(at: DateTime): [Event!]!` query; `src/App.tsx` exposes `Load A` / `Load B` / `Reset` buttons that exercise `useQuery` + `fetchPolicy: "cache-first"` + a custom `DateTime` serializer that produces an offset-suffixed ISO string (asymmetric vs. `Date.prototype.toJSON`).

## Issue #1565 — `withScalars` link no-ops in vite production builds

**Bug:** `src/lib/graphql-type-guards.ts` identified graphql-js types via `value.constructor.name === "GraphQLScalarType"` (introduced in #1056 to support cross-realm schemas). esbuild/terser mangle class names in production bundles — `GraphQLScalarType` becomes `Dn`, `GraphQLObjectType` becomes `On`, etc. — so every guard returned `false`, the `functionsMap` ended up empty, and the link silently passed responses through unparsed. Dev mode (no minification) worked.

**Fix:** read `value[Symbol.toStringTag]` first (graphql-js v16 defines a getter on each type class returning the unminifiable string literal `"GraphQLScalarType"` etc.), and only fall back to `constructor.name` when no tag is present. Tag values are string literals, so they survive minification AND cross-realm.

**Tests covering the regression:**
- Unit: `src/lib/__tests__/graphql-type-guards.spec.ts` — covers real graphql-js instances, simulated minified instances (constructor renamed to `"a"` but `Symbol.toStringTag` preserved), and the constructor-name fallback.
- E2E: `test-apps/apollo-v4-issue-1565/e2e/issue-1565.spec.ts` — runs against `vite build && vite preview` (NOT `vite dev`). The playwright project's `webServer` entry triggers the build per run; without this, the bug is invisible.

The `apollo-v4-issue-1565` app mirrors the user's repro from https://github.com/floriancargoet/apollo-link-scalars-bug-repro: it builds an introspection JSON in-process, round-trips it through `buildClientSchema`, and uses a `Date` scalar against a `film(filmID: ID): Film` query served by a vite middleware that mounts on BOTH `configureServer` (for `vite dev`) and `configurePreviewServer` (for `vite preview`).

## Local graphql-test-server (port 5178)

`test-apps/graphql-test-server` is a small Apollo Server instance (express + graphql-ws on top of `@apollo/server` v5) that replaces the former dependency on `rickandmortyapi.com`.

Key points:
- Schema mirrors R&M reads (`Character`, `Location`, `Episode`, plus the `characters` / `locations` / `episodes` paginated queries) and adds `createCharacter` / `updateCharacter` / `deleteCharacter` mutations and `characterCreated` / `characterUpdated` subscriptions for exercising the link against writes and streaming.
- State is partitioned by the `X-Run-Id` request header. Missing header routes to a shared read-only seed that mirrors a handful of real-API rows (Rick Sanchez at id=1, Morty at id=2, Summer at id=3, plus two locations and two episodes). Mutations against the shared store throw, so tests that need writes MUST send a runId.
- The server exposes `GET /health` for liveness probes (playwright's webServer check). GraphQL lives at `/graphql`; WS subscriptions on the same path.
- Booting: `pnpm --filter ./test-apps/graphql-test-server dev` or `pnpm --filter ./test-apps/graphql-test-server start`. Both run the CLI via tsx so there's no build step.
- The integration suite's vitest globalSetup (`src/__tests__/integration/vitest.global-setup.ts`) spawns the server as a subprocess (not in-process — in-process hits a duplicate-graphql-module guard) and reuses anything already listening at `TEST_SERVER_URL` (default `http://127.0.0.1:5178/graphql`).
- Playwright's `webServer` list boots the test server before the Vite/Next app servers. With `reuseExistingServer: !CI`, a locally-running instance is reused across runs.

## Release flow gotchas

The release path is `RELEASING.md`'s "Standard Release Flow" plus a few non-obvious points worth knowing before running it:

- **Use `pnpm run version`, not `pnpm version`.** pnpm has a built-in `version` command that intercepts and prints engine versions instead of running the package script. The package script (`commit-and-tag-version`) only fires when invoked as `pnpm run version` (or via `npm run version`).
- **`commit-and-tag-version` regenerates the CHANGELOG.md preamble each run** from a built-in template. Edits to lines 1-3 of CHANGELOG.md (the `# Changelog` header + the "All notable changes ..." sentence) get reset on every release. The URL slot inside the preamble is data; the surrounding wording is template. Anywhere below the preamble (including the version entry you're producing) survives normally.
- **Pre-push hook runs `pnpm test`** (test:lib + test:apps) on every `git push`. The release `git push --follow-tags` therefore re-runs the full local test matrix before contacting the remote. That's slow (~1 min) but catches anything CI would catch.
- **Manual prose summary in CHANGELOG requires amend-then-retag** (or `--skip.tag`). `commit-and-tag-version` creates the `chore(release): X.Y.Z` commit and the tag in one shot. To prepend a prose summary to the new entry, run with `--skip.tag`, edit CHANGELOG.md, `git commit --amend`, then tag manually. The amend-then-retag variant (delete tag, retag the amended commit) also works. The publish workflow's awk extractor uses everything between `## [X.Y.Z]` and the next `## [` heading as the GitHub Release body, so prose, sub-headings, and bullets all carry through.
- **npm package payload is allowlist-driven.** `package.json` `files` only ships `build`, `src/index.ts`, `src/lib/*.ts`, four named files in `src/types/`, and `CHANGELOG.md` (plus npm's auto-included LICENSE / README / package.json). `tsconfig.build.json` excludes `src/**/__tests__/**` and `src/**/*.spec.ts` from the compiled output so the build directory is clean. Verify with `npm pack --dry-run` ~ should be ~89 files / ~233KB unpacked. If the count balloons, something snuck past the `files` glob.
- **`.npmignore` does not fully compose with directory entries in `files`.** Listing `src/lib` in `files` ships everything under it, including `__tests__/`, even when `.npmignore` has `**/__tests__/**`. Use single-segment globs (`src/lib/*.ts`) for paths whose subtrees you want to leak-proof.
- **Publish workflow OIDC needs `id-token: write`** in `publish.yml` permissions and a public repo for npm trusted publishing to work without a token. The `if: github.repository == 'eturino/apollo-link-scalars'` guard keeps forks from triggering it. Provenance is auto-attached.
- **The publish workflow does not regenerate the typedoc Github Pages site.** Run `pnpm doc:html && pnpm doc:publish` locally before tagging if you want the `eturino.github.io/apollo-link-scalars` site refreshed. Typedoc currently emits 7 non-blocking warnings (orphan referenced types + README links to test-apps directories) — they're informational, not errors.

## Known unrelated noise

- `test-apps/apollo-v4-next-ssr/next-env.d.ts` is auto-regenerated by Next.js on dev; showing up as modified in `git status` is normal and can be ignored.
