# Dependency State

Last reviewed: 2026-11-18

State file for the weekly dependency pass: what is pinned, what is held and why.
Full per-pass detail lives in `git log -p DEPENDENCIES.md pnpm-lock.yaml`.

## House rules

- Package manager: pnpm, pinned in `mise.toml` and `package.json` `packageManager`. Node pinned in `mise.toml` and `package.json` `volta`. Keep all three in step.
- Runtime: Node 26 (LTS) for the dev toolchain since 2026-11-16. The library still promises `engines.node >=20`. `@types/node` follows the Node major only loosely: it tracks the newest `@types/node` the gate allows, because the library itself has `engines.node >=20` and no Node API surface. CI's `node-20` job loads the built package on Node 20 with Apollo Client 3 and graphql 16 (`scripts/node20-smoke.cjs`): vitest, pnpm and graphql 17 need Node 22+.
- Gate: `pnpm-workspace.yaml` `minimumReleaseAge: 7200` (5 days).
- Green gate: `pnpm test` (`test:lib` + `test:apps`), then `pnpm test:integration`, `pnpm e2e` (all 7 Playwright projects), `pnpm test:matrix` and `pnpm test:ts6`. After the matrix or `test:ts6`, run `git checkout -- package.json pnpm-lock.yaml test-apps` and a frozen install: both leave the manifests pinned to what they swapped in.
- TypeScript: 7 is the default in every workspace package. `pnpm test:ts6` builds with 7, as npm ships it, then swaps every package to 6 and runs type-check, unit tests and the test apps' type-check and build. So the library compiles on 6, and TypeScript 6 consumers can use the `.d.ts` that 7 emits. CI runs it as the `typescript-6` job.
- Lint is `oxlint` with `oxlint-tsgolint` (type-aware, on its own TypeScript 7), one root install. Each test app has its own `.oxlintrc.json`, picked up as a nested config by `test:apps:lint`. typescript-eslint cannot run on TypeScript 7.
- typedoc lives in the `tools/typedoc` workspace package with its own `typescript` 6, locked in `pnpm-lock.yaml`: typedoc 0.28 does not support TypeScript 7. `doc:html` and `doc:json` call `tools/typedoc/node_modules/.bin/typedoc`. Keep that package's `typescript` on 6 in a pass, and fold typedoc back into the root once a release supports 7.
- Commit prefixes: commitlint enforces conventional types, so dependency commits use `chore(deps):`, not `deps:`.
- Dependabot opens security PRs only (`open-pull-requests-limit: 0` stops version PRs). Version upgrades run as a weekly pass recorded here, since three auto-merged Dependabot PRs left a broken `pnpm-lock.yaml` on master in 2026-11.
- Nothing deploys on push. A release is a manual tag: see `RELEASING.md`.
- Held majors by design (never bump these in a routine pass):
  - `@apollo/client` stays on 3.x in `test-apps/apollo-v3-react`. That app is the only v3 surface for the `3.x || 4.x` peer range.
  - `graphql` stays on 16.x in `test-apps/apollo-v3-react` (Apollo v3 peer-caps at `^16`) and `test-apps/graphql-test-server` (`@apollo/server` v5 peer-caps at `^16.11`).
  - A new upstream major of `@apollo/client` or `graphql` above the peer range is raised by the `upstream-major-watch` workflow as an issue. Widening the peer range is a maintainer decision, not a routine bump.

## Why these packages are here

### `@apollo/client`, `graphql` (root devDependencies)

The library's peers. The root pins the newest supported majors (Apollo 4, graphql 17). `pnpm test:matrix` swaps them to cover Apollo 3 + graphql 16 and Apollo 4 + graphql 16.

### `@graphql-tools/schema`

Builds executable schemas for unit tests (root) and for the test apps' local GraphQL endpoints (vite middleware, Next API, `graphql-test-server`).

### `@playwright/test`

E2E against the 7 test apps. A bump needs `pnpm exec playwright install chromium` locally.

### Smaller additions

| Package                                                                                        | Range                  | Why                        |
| ---------------------------------------------------------------------------------------------- | ---------------------- | -------------------------- |
| `@apollo/client` (root)                                                                        | `^4.3.7`               | peer, v4 surface           |
| `graphql` (root)                                                                               | `^17.1.0`              | peer, graphql 17 surface   |
| `@graphql-tools/schema`                                                                        | `^11.0.8`              | test schemas               |
| `@playwright/test`                                                                             | `^1.65.0`              | e2e                        |
| `vitest`, `@vitest/coverage-v8`                                                                | `^5.1.0`               | unit tests and coverage    |
| `typescript`                                                                                   | `^7.0.2`               | compiler, 6 via `test:ts6` |
| `oxlint`, `oxlint-tsgolint`                                                                    | `^1.93.0`, `^7.0.2007` | lint, type-aware           |
| `prettier`                                                                                     | `^3.10.1`              | format                     |
| `knip`, `dpdm`                                                                                 | `^6.44.2`, `^4.3.0`    | dead code, import cycles   |
| `gh-pages` (typedoc: see House rules)                                                          | `^6.3.0`               | API docs site              |
| `commit-and-tag-version`, `@commitlint/*`, `cz-conventional-changelog`, `husky`, `lint-staged` |                        | release and commit tooling |
| `es-toolkit`, `rxjs`, `zen-observable-ts`                                                      |                        | used by tests              |
| `npm-run-all`, `open-cli`, `trash-cli`                                                         |                        | script helpers             |
| `@types/node`, `@types/react`                                                                  | `^26.6.6`, `^19.3.0`   | types                      |

## Major Upgrades Blocked

None.

## Open security advisories

| Dependency path                                                                                        | Advisory                                                                 | Severity | Reason                                                                        |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ | -------- | ----------------------------------------------------------------------------- |
| `picomatch` 4.0.7 (dev tooling, via `fast-glob`/`micromatch` under `trash-cli`, `gh-pages` and others) | [GHSA-fc5q-39xc-vjpf](https://github.com/advisories/GHSA-fc5q-39xc-vjpf) | high     | no patched version (vulnerable `<=4.0.7`, latest is 4.0.7)                    |
| `glob` 13.0.7 (dev tooling, via dpdm)                                                                  | [GHSA-3g3m-2fjr-6pw4](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4) | moderate | fix only in glob 14 (a major); newest dpdm 4.3.0 requires `^13`               |
| `minimatch` 10.2.6 (dev tooling, via typedoc and dpdm)                                                 | [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) | moderate | fix only in minimatch 11 (a major); newest typedoc 0.28.20 requires `^10.2.5` |

Re-checked 2026-11-18. None of these packages ships in the npm payload.

## Active supply-chain exceptions

None.

## Last upgrade pass (2026-11-18)

Base `5219a0b` (master), gate 5 days, PR: none yet.

**Upgraded**

| Package           | From     | To       | Notes                            |
| ----------------- | -------- | -------- | -------------------------------- |
| `prettier`        | 3.9.10   | 3.10.1   |                                  |
| `oxlint-tsgolint` | 7.0.2006 | 7.0.2007 |                                  |
| pnpm              | 12.19.0  | 12.20.0  | `mise.toml` and `packageManager` |

**Majors landed:** none.

**GitHub Actions pins:** `jdx/mise-action` v5.2.7 -> v5.2.8 (Windows-only install fix).

**Skipped this round**

| Package           | Wanted  | Reason                                |
| ----------------- | ------- | ------------------------------------- |
| pnpm              | 12.21.0 | published 2026-11-13, inside the gate |
| `jdx/mise-action` | v5.2.9  | published 2026-11-16, inside the gate |

**Nested refresh:** skipped. `pnpm update` re-resolved `@graphql-tools/utils` under `@apollo/server` from 12.1.0 down to 10.10.0, which brings in [GHSA-7mx3-vvmw-hjmv](https://github.com/advisories/GHSA-7mx3-vvmw-hjmv) (high, fixed only in 12.0.1+). The lockfile keeps 12.1.0. **Security:** no advisory fixable in range: 3 open (above).

**Still outdated after this pass**

- pnpm 12.21.0: inside the gate.
- `@apollo/client` 4.x in `apollo-v3-react`: held by design (House rules).
- `graphql` 17.x in `apollo-v3-react` and `graphql-test-server`: held by design (House rules).

**Tested:** `pnpm test` (110 unit tests passed, 1 skipped; lint, type-check and build across 8 test apps), `pnpm test:integration` (1 passed), `pnpm e2e` (10 passed across 7 projects), `pnpm test:matrix` (3 rows, each 110 unit + 1 integration passed), `pnpm test:ts6` (passed). `pnpm audit`: 1 high, 2 moderate, all open with reasons above.

## Upgrade history

- **2026-11-18**: minor+patches, pnpm 12.20.0, `jdx/mise-action` v5.2.8, `picomatch` high advisory recorded (no fix exists)
- **2026-11-16**: pnpm 11.28.11 -> 12.19.0 in `mise.toml` and `packageManager`. pnpm 12 rejects the pnpm 11 setting `confirmModulesPurge` (dropped) and pins its own binary in `pnpm-lock.yaml`. Tested: `pnpm test`, `test:integration`, `e2e`, `test:matrix` and `test:ts6` on pnpm 12.
- **2026-11-16**: Node 24.22.2 -> 26.13.1 in `mise.toml` and `volta`, no code change. Tested: `pnpm test`, `test:integration`, `e2e`, `test:matrix` and `test:ts6` on Node 26.
- **2026-11-15**: `typescript` 7 in every package, ESLint replaced by oxlint, typedoc moved to `tools/typedoc` on TypeScript 6, `test:ts6` added. Tested: `pnpm test`, `test:integration` (1), `e2e` (10), `test:matrix` (3 rows) on 7, `test:ts6` on 6.0.3.
- **2026-11-14**: lockfile repair + minor+patches + `vitest` v5 + `@graphql-tools/schema` v11 + action pins, dependabot version PRs stopped
