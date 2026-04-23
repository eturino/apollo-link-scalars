# Releasing

This repository uses `standard-version` for release commits, changelog generation, and git tags. Package publishing is intended to happen from GitHub Actions via npm trusted publishing.

## Prerequisites

- Start from a clean working tree.
- Release from the intended base branch tip after CI is green.
- Use Conventional Commits for merged changes so the generated changelog is useful.

## Standard Release Flow

```sh
pnpm install --frozen-lockfile
pnpm test:full

# optional: regenerate docs locally and inspect them
pnpm doc:html

# creates:
# - package.json version bump
# - CHANGELOG.md update
# - chore(release): x.y.z commit
# - vx.y.z git tag
pnpm version

# review the generated release commit and changelog
git show --stat

# publish commit + tag
git push --follow-tags origin <release-branch>
```

Pushing the release tag triggers [`.github/workflows/publish.yml`](./.github/workflows/publish.yml), which:

- installs dependencies with `pnpm install --frozen-lockfile`
- runs `pnpm test:full`
- runs `npm pack --dry-run`
- publishes the package to npm using trusted publishing (OIDC)

## One-Step Local Prep

If you want the repo's bundled prep flow:

```sh
pnpm prepare-release
git push --follow-tags origin <release-branch>
```

`pnpm prepare-release` runs:

```sh
pnpm reset
pnpm test
pnpm doc:html
pnpm version
pnpm doc:publish
```

Note that `pnpm reset` is destructive.

## First Release / Special Cases

Examples:

```sh
# first release without bumping the existing version first
pnpm version -- --first-release

# prerelease
pnpm version -- --prerelease alpha

# signed tag / commit
pnpm version -- --sign
```

## Notes

- `pnpm version` runs the package script, not the built-in npm versioning command.
- Review `CHANGELOG.md` before pushing tags.
- npm trusted publishing automatically generates provenance for public packages published from this public GitHub repository, so the workflow uses plain `npm publish`.
- Do not publish from a local machine unless you are intentionally bypassing the normal release path.
