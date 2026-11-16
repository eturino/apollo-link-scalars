# Dependency State

Last reviewed: 2026-11-14

State file for the weekly dependency pass: what is pinned, what is held and why.
Full per-pass detail lives in `git log -p DEPENDENCIES.md pnpm-lock.yaml`.

## House rules

- Package manager: pnpm, pinned in `mise.toml` and `package.json` `packageManager`. Node pinned in `mise.toml` and `package.json` `volta`. Keep all three in step.
- Runtime: Node 24. `@types/node` follows the Node major only loosely: it tracks the newest `@types/node` the gate allows, because the library itself has `engines.node >=20` and no Node API surface.
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
| `oxlint`, `oxlint-tsgolint`                                                                    | `^1.93.0`, `^7.0.2006` | lint, type-aware           |
| `prettier`                                                                                     | `^3.9.10`              | format                     |
| `knip`, `dpdm`                                                                                 | `^6.44.2`, `^4.3.0`    | dead code, import cycles   |
| `gh-pages` (typedoc: see House rules)                                                          | `^6.3.0`               | API docs site              |
| `commit-and-tag-version`, `@commitlint/*`, `cz-conventional-changelog`, `husky`, `lint-staged` |                        | release and commit tooling |
| `es-toolkit`, `rxjs`, `zen-observable-ts`                                                      |                        | used by tests              |
| `npm-run-all`, `open-cli`, `trash-cli`                                                         |                        | script helpers             |
| `@types/node`, `@types/react`                                                                  | `^26.6.6`, `^19.3.0`   | types                      |

## Major Upgrades Blocked

| Package | Current  | Latest  | Blocker                   | Since      | Re-checked | Last tried |
| ------- | -------- | ------- | ------------------------- | ---------- | ---------- | ---------- |
| `pnpm`  | 11.28.11 | 12.18.0 | Runtime major: its own PR. | 2026-11-14 | 2026-11-14 | -          |

## Open security advisories

| Dependency path                                        | Advisory                                                                 | Severity | Reason                             |
| ------------------------------------------------------ | ------------------------------------------------------------------------ | -------- | ---------------------------------- |
| `glob` 13.0.7 (dev tooling)                            | [GHSA-3g3m-2fjr-6pw4](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4) | moderate | fix only in glob 14 (a major)      |
| `minimatch` 10.2.6 (dev tooling, via typedoc and dpdm) | [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) | moderate | fix only in minimatch 11 (a major) |

Re-checked 2026-11-16. Neither package ships in the npm payload.

## Active supply-chain exceptions

None.

## Last upgrade pass (2026-11-14)

Base `a9fd40d` (master, CI red since 2026-11-12), gate 5 days, PR: [#1737](https://github.com/eturino/apollo-link-scalars/pull/1737).

Before the pass: removed a stale `.mise.toml` that shadowed `mise.toml` with pnpm 10.33.1, and restored `pnpm-lock.yaml` from `514982f` because dependabot merges #1732, #1733 and #1734 left duplicated keys (`ERR_PNPM_BROKEN_LOCKFILE`).

**Upgraded**

| Package                                              | From    | To       | Notes                                                                                    |
| ---------------------------------------------------- | ------- | -------- | ---------------------------------------------------------------------------------------- |
| `@apollo/client` (root, v4 apps)                     | 4.2.12  | 4.3.7    |                                                                                          |
| `graphql` (root, v4 apps)                            | 17.0.2  | 17.1.0   |                                                                                          |
| `graphql` (v3 app, test server)                      | 16.14.2 | 16.15.0  | held on 16 by design                                                                     |
| `@commitlint/cli`, `@commitlint/config-conventional` | 21.2.3  | 21.2.4   |                                                                                          |
| `@playwright/test`                                   | 1.64.1  | 1.65.0   |                                                                                          |
| `@types/node`                                        | 26.6.5  | 26.6.6   |                                                                                          |
| `@types/react`, `@types/react-dom`                   | 19.2.x  | 19.3.0   |                                                                                          |
| `react`, `react-dom`                                 | 19.2.8  | 19.3.1   |                                                                                          |
| `@vitejs/plugin-react`                               | 6.1.2   | 6.3.0    |                                                                                          |
| `vite`                                               | 8.3.4   | 8.3.7    |                                                                                          |
| `next`                                               | 16.4.2  | 16.4.5   |                                                                                          |
| `ws`                                                 | 8.22.0  | 8.22.2   |                                                                                          |
| `es-toolkit`                                         | 1.52.0  | 1.53.2   |                                                                                          |
| `eslint`                                             | 10.13.0 | 10.14.0  |                                                                                          |
| `globals`                                            | 17.13.0 | 17.14.0  |                                                                                          |
| `knip`                                               | 6.41.0  | 6.44.2   |                                                                                          |
| `typescript-eslint`                                  | 8.70.1  | 8.72.2   | new rule `no-unsafe-enum-assignment` turned off in test files (fires only on graphql 16) |
| Node                                                 | 24.16.0 | 24.22.2  | `mise.toml` and `volta`                                                                  |
| pnpm                                                 | 11.5.1  | 11.28.11 | `mise.toml` and `packageManager`                                                         |

**Majors landed**

- `vitest`, `@vitest/coverage-v8` v5: no code change.
- `@graphql-tools/schema` v11 (root and test apps): no code change.

**GitHub Actions pins:** checkout v6.0.2 -> v7.0.1, upload-artifact v4 -> v7.0.2, mise-action v4.0.1 -> v5.2.7, action-gh-release v3.0.0 -> v3.0.4. Dependabot version PRs and the CI `automerge` job stopped.

**Skipped this round**

| Package                 | Wanted  | Reason                                |
| ----------------------- | ------- | ------------------------------------- |
| `next`                  | 16.4.6  | published 2026-11-09, inside the gate |
| `vite`                  | 8.3.8   | inside the gate                       |
| `ws`                    | 8.23.0  | inside the gate                       |
| `@playwright/test`      | 1.65.1  | inside the gate                       |
| `eslint`                | 10.15.0 | inside the gate                       |
| `knip`                  | 6.45.1  | inside the gate                       |
| `@apollo/client`        | 4.3.8   | inside the gate                       |
| `@graphql-tools/schema` | 11.0.9  | inside the gate                       |
| Node                    | 24.22.3 | published 2026-11-10, inside the gate |
| `jdx/mise-action`       | v5.2.8  | published 2026-11-12, inside the gate |
| pnpm                    | 12.x    | runtime major, its own PR             |

**Nested refresh:** `pnpm update` inside the ranges. It also rewrote every caret specifier to the version already resolved (for example `prettier` `^3.9.10`, `dpdm` `^4.3.0`, `@apollo/server` and `express` in the test server), so the manifest diff is larger than the table above. **Security:** `pnpm audit --fix=update` left 2 moderate advisories open (above).

**Still outdated after this pass**

- `typescript` 7: landed on 2026-11-15 (Upgrade history).
- `@apollo/client` 4.x in `apollo-v3-react`: held by design (House rules).
- `graphql` 17.x in `apollo-v3-react` and `graphql-test-server`: held by design (House rules).

**Tested:** `pnpm test` (108 unit tests passed, 1 skipped; coverage 95.68% statements; lint, type-check and build across 8 test apps), `pnpm test:integration` (1 passed), `pnpm e2e` (10 passed across 7 projects), `pnpm test:matrix` (3 rows: Apollo 3 + graphql 16, Apollo 4 + graphql 16, Apollo 4 + graphql 17, each 108 unit + 1 integration passed).

## Upgrade history

- **2026-11-15**: `typescript` 7 in every package, ESLint replaced by oxlint, typedoc moved to `tools/typedoc` on TypeScript 6, `test:ts6` added. Tested: `pnpm test`, `test:integration` (1), `e2e` (10), `test:matrix` (3 rows) on 7, `test:ts6` on 6.0.3.
- **2026-11-14**: lockfile repair + minor+patches + `vitest` v5 + `@graphql-tools/schema` v11 + action pins, dependabot version PRs stopped
