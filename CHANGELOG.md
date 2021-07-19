# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [2.1.4](https://github.com/eturino/apollo-link-scalars/compare/v2.1.3...v2.1.4) (2021-07-19)


### Bug Fixes

* **deps:** bump zen-observable-ts from 1.0.0 to 1.1.0 ([#367](https://github.com/eturino/apollo-link-scalars/issues/367)) ([457f558](https://github.com/eturino/apollo-link-scalars/commit/457f5583ec8ba576afd9969f7878fc9aac319ee9))
* fix: Scalars not parsed when fragment spreading causes a field to appear multiple times ([fe40256](https://github.com/eturino/apollo-link-scalars/commit/fe40256dffd1a22b53e1a82eb1174451b2f7d883)), closes [#370](https://github.com/eturino/apollo-link-scalars/issues/370)

### [2.1.3](https://github.com/eturino/apollo-link-scalars/compare/v2.1.2...v2.1.3) (2021-04-08)


### Bug Fixes

* **deps:** bump @apollo/client from 3.3.12 to 3.3.14 ([#295](https://github.com/eturino/apollo-link-scalars/issues/295)) ([1a3b5fe](https://github.com/eturino/apollo-link-scalars/commit/1a3b5fed102cd6a1d300c2bcaf0350cc150fa69c))

### [2.1.2](https://github.com/eturino/apollo-link-scalars/compare/v2.1.1...v2.1.2) (2021-03-20)


### Bug Fixes

* **deps:** bump @apollo/client from 3.3.7 to 3.3.8 ([#245](https://github.com/eturino/apollo-link-scalars/issues/245)) ([a753d2f](https://github.com/eturino/apollo-link-scalars/commit/a753d2f8999fbcc3b8c3e8b5172fdc0ef2a8b2bf))
* **deps:** bump @apollo/client from 3.3.8 to 3.3.11 ([#258](https://github.com/eturino/apollo-link-scalars/issues/258)) ([fd1a364](https://github.com/eturino/apollo-link-scalars/commit/fd1a3648e7c7b99ddffb86303ba81c2339ae229c))

### [2.1.1](https://github.com/eturino/apollo-link-scalars/compare/v2.1.0...v2.1.1) (2021-01-31)

## [2.1.0](https://github.com/eturino/apollo-link-scalars/compare/v2.0.3...v2.1.0) (2021-01-30)


### Features

* add nullable type transformations ([#236](https://github.com/eturino/apollo-link-scalars/issues/236)) ([c09f3a4](https://github.com/eturino/apollo-link-scalars/commit/c09f3a479a7f8e1d0e1512e8d0fcadbc0e287af2))
* export NullFunctions type ([666be3e](https://github.com/eturino/apollo-link-scalars/commit/666be3ebe579a3a8a75a5fa361f9dbfa0ba3c14a))


### Bug Fixes

* **deps:** [security] bump node-notifier from 8.0.0 to 8.0.1 ([#216](https://github.com/eturino/apollo-link-scalars/issues/216)) ([58dc337](https://github.com/eturino/apollo-link-scalars/commit/58dc3379ffba2964078288d54c4bd6a8b40613b4))
* **deps:** bump @apollo/client from 3.3.6 to 3.3.7 ([#230](https://github.com/eturino/apollo-link-scalars/issues/230)) ([ef84f45](https://github.com/eturino/apollo-link-scalars/commit/ef84f45a4da874e176843b56a65ccc722760d2cc))

### [2.0.3](https://github.com/eturino/apollo-link-scalars/compare/v2.0.2...v2.0.3) (2020-12-13)


### Bug Fixes

* **deps:** [security] bump highlight.js from 10.3.2 to 10.4.1 ([#209](https://github.com/eturino/apollo-link-scalars/issues/209)) ([c7586cb](https://github.com/eturino/apollo-link-scalars/commit/c7586cbd1ca01497016d2e01c2dc14ef9cfceeb6))
* **deps:** [security] bump ini from 1.3.5 to 1.3.7 ([#212](https://github.com/eturino/apollo-link-scalars/issues/212)) ([a978393](https://github.com/eturino/apollo-link-scalars/commit/a978393182c4f57cae30017aaf0587d5bc36a907))
* **deps:** update dependencies and dev-dependencies ([d306d90](https://github.com/eturino/apollo-link-scalars/commit/d306d909a6e00c357a78078fdc04e1fbad7bc285))

### [2.0.2](https://github.com/eturino/apollo-link-scalars/compare/v2.0.1...v2.0.2) (2020-10-30)


### Bug Fixes

* **deps:** bump @apollo/client from 3.2.0 to 3.2.1 ([#164](https://github.com/eturino/apollo-link-scalars/issues/164)) ([dc78062](https://github.com/eturino/apollo-link-scalars/commit/dc780626e68236b0388a7038dd1ebf38c9591c60))

### [2.0.1](https://github.com/eturino/apollo-link-scalars/compare/v2.0.0...v2.0.1) (2020-09-15)

## [2.0.0](https://github.com/eturino/apollo-link-scalars/compare/v1.0.1...v2.0.0) (2020-09-11)

### ⚠ BREAKING CHANGES

- **deps:** remove `makeExecutableSchema` from the exported functions, remove
  @graphql-tools/schema from the dependencies

### Bug Fixes

- **deps:** remove graphql-tools from dependencies and stop exporting `makeExecutableSchema` ([aa057ae](https://github.com/eturino/apollo-link-scalars/commit/aa057ae84ef6a4feb7c2dfd30f4b6ae85f92b578)), closes [#148](https://github.com/eturino/apollo-link-scalars/issues/148) [#148](https://github.com/eturino/apollo-link-scalars/issues/148)

### [1.0.1](https://github.com/eturino/apollo-link-scalars/compare/v1.0.0...v1.0.1) (2020-08-20)

### Bug Fixes

- fix removeTypenameFromInputs with apollo v3 ([9540d13](https://github.com/eturino/apollo-link-scalars/commit/9540d13f4caa38a3ca1a315d0dc16cf79e99f8e4))

## [1.0.0](https://github.com/eturino/apollo-link-scalars/compare/v0.2.0...v1.0.0) (2020-08-20)

### ⚠ BREAKING CHANGES

- **apollo client:** Changes the dependency on Apollo Client from v2 to v3
- This version of the library won't be compatible with projects using Apollo 2.

### Features

- **apollo client:** migrate to Apollo Client v3 ([66c74c7](https://github.com/eturino/apollo-link-scalars/commit/66c74c7029d4f0dccd6525c72e5da971d92f1161)), closes [#34](https://github.com/eturino/apollo-link-scalars/issues/34)

- upgrade "apollo-link" to provide Apollo clinet version 3 support ([8677b7e](https://github.com/eturino/apollo-link-scalars/commit/8677b7ef589748712171b50726dd6138424e300e))

## [0.3.0](https://github.com/eturino/apollo-link-scalars/compare/v0.2.1...v0.3.0) (2020-09-12)

### ⚠ BREAKING CHANGES

- **deps:** remove `makeExecutableSchema` from the exported functions, remove
  graphql-tools from the dependencies

### Bug Fixes

- **deps:** remove graphql-tools from dependencies and stop exporting `makeExecutableSchema` ([7d19f41](https://github.com/eturino/apollo-link-scalars/commit/7d19f4129677b1cd010f4a6f27df9431850e2520)), closes [#148](https://github.com/eturino/apollo-link-scalars/issues/148) [#148](https://github.com/eturino/apollo-link-scalars/issues/148)

### [0.2.1](https://github.com/eturino/apollo-link-scalars/compare/v0.2.0...v0.2.1) (2020-09-12)

### Bug Fixes

- **dependency:** fix exporting from devDependency -> move graphql-tools to dependency ([cb3e904](https://github.com/eturino/apollo-link-scalars/commit/cb3e904fcc878785b2cd6eff26410d35b0e9a32a)), closes [#148](https://github.com/eturino/apollo-link-scalars/issues/148)

## [0.2.0](https://github.com/eturino/apollo-link-scalars/compare/v0.1.10...v0.2.0) (2020-08-19)

### ⚠ BREAKING CHANGES

- **peer-dependencies:** graphql stops being a dependency and becomes a peer-dependency. It has to be added
  directly to your project

- **peer-dependencies:** move graphql to peer-dependency and allow versions 14 and 15 ([#133](https://github.com/eturino/apollo-link-scalars/issues/133)) ([12c602e](https://github.com/eturino/apollo-link-scalars/commit/12c602ecfdc6b2e1bb8c6704907cd297b1689777)), closes [#117](https://github.com/eturino/apollo-link-scalars/issues/117)

### [0.1.11](https://github.com/eturino/apollo-link-scalars/compare/v0.1.10...v0.1.11) (2020-09-12)

### Bug Fixes

- **dependency:** fix exporting from devDependency -> move graphql-tools to dependency ([d20dfa7](https://github.com/eturino/apollo-link-scalars/commit/d20dfa7f59e09cf4fdede9f1d6d2e5f4d987d6d7)), closes [#148](https://github.com/eturino/apollo-link-scalars/issues/148)

### [0.1.10](https://github.com/eturino/apollo-link-scalars/compare/v0.1.9...v0.1.10) (2020-08-19)

### [0.1.9](https://github.com/eturino/apollo-link-scalars/compare/v0.1.8...v0.1.9) (2020-08-19)

### Bug Fixes

- export "makeExecutableSchema" through apollo-link-scalars ([#115](https://github.com/eturino/apollo-link-scalars/issues/115)) ([4008797](https://github.com/eturino/apollo-link-scalars/commit/40087970daebfcc9ced7283972ba3bc0b1e42ef2))

### [0.1.8](https://github.com/eturino/apollo-link-scalars/compare/v0.1.7...v0.1.8) (2020-05-12)

### [0.1.7](https://github.com/eturino/apollo-link-scalars/compare/v0.1.6...v0.1.7) (2020-05-12)

### Bug Fixes

- target ES2017 instead of esnext for module, and ES2015 for main ([08a8246](https://github.com/eturino/apollo-link-scalars/commit/08a82460bd39fe59bdf6ae958f83cfb1b6ecd89b))

### [0.1.6](https://github.com/eturino/apollo-link-scalars/compare/v0.1.5...v0.1.6) (2019-12-31)

### Features

- Target es6 environment for better browser support. ([#31](https://github.com/eturino/apollo-link-scalars/issues/31)) ([d202bd7](https://github.com/eturino/apollo-link-scalars/commit/d202bd7909e66c152c4813985905b40dc3dbf051))

### [0.1.5](https://github.com/eturino/apollo-link-scalars/compare/v0.1.4...v0.1.5) (2019-12-22)

### Bug Fixes

- Avoid parsing issues with null/non-null fields: stop producing graphql errors on parsing when a null is encounter on a non-null value. That is not the responsibility of this link, and it clashes with usages of directives like `@skip` [#28](https://github.com/eturino/apollo-link-scalars/pull/28) [#29](https://github.com/eturino/apollo-link-scalars/issues/29)

### [0.1.4](https://github.com/eturino/apollo-link-scalars/compare/v0.1.3...v0.1.4) (2019-12-05)

### Bug Fixes

- Handle null values for optional types [#21](https://github.com/eturino/apollo-link-scalars/pull/21)

### [0.1.3](https://github.com/eturino/apollo-link-scalars/compare/v0.1.2...v0.1.3) (2019-12-04)

### Features

- `removeTypenameFromInputs` option to remove \_\_typename from inputs ([d9a194f](https://github.com/eturino/apollo-link-scalars/commit/d9a194f11bcc1f26b2a6125e366fa812295ebd1d))

### [0.1.2](https://github.com/eturino/apollo-link-scalars/compare/v0.1.1...v0.1.2) (2019-12-04)

### Bug Fixes

- mutate the operation with serialized vars (avoid shallow copy with wrong prototype errors) ([ab9a107](https://github.com/eturino/apollo-link-scalars/commit/ab9a10797c28d84b48ab9fb416f103a0a7ca640c))

### [0.1.1](https://github.com/eturino/apollo-link-scalars/compare/v0.1.0...v0.1.1) (2019-12-02)

### Features

- exporting `isNone` and `mapIfArray` utils ([031a6d1](https://github.com/eturino/apollo-link-scalars/commit/031a6d1612d4ced48b932fc74490f4004e933eb1))

## 0.1.0 (2019-11-30)

### Features

- `validateEnums` + ensure non-nulls ([feaff53](https://github.com/eturino/apollo-link-scalars/commit/feaff53ffdd724b87363c8ea3aac43270646f23a)), closes [#2](https://github.com/eturino/apollo-link-scalars/issues/2) [#7](https://github.com/eturino/apollo-link-scalars/issues/7)
- can parse scalars as result of query root. Uses the scalar type in the schema or functions ([b4348eb](https://github.com/eturino/apollo-link-scalars/commit/b4348eb244def4821a9e9311fef268aa1c6e7a35))
- initial Fragment Unit helpers ([585a845](https://github.com/eturino/apollo-link-scalars/commit/585a84592eb4f6be12383ddbe764546a47f3d16f))
- serializer of nested + don't \_\_typename ([0014120](https://github.com/eturino/apollo-link-scalars/commit/0014120b876d52251bdcb12a935a28d8e8fad27e)), closes [#18](https://github.com/eturino/apollo-link-scalars/issues/18) [#15](https://github.com/eturino/apollo-link-scalars/issues/15)
- serializer of schema input ([86ff601](https://github.com/eturino/apollo-link-scalars/commit/86ff6017bed8cb61eb30ac596c78878e1cf63d42)), closes [#14](https://github.com/eturino/apollo-link-scalars/issues/14)
- support arrays ([bc84fff](https://github.com/eturino/apollo-link-scalars/commit/bc84fff93671354920195851392ed0dbd82c0b0b)), closes [#5](https://github.com/eturino/apollo-link-scalars/issues/5)
- support for nested objects, including in arrays, and arrays inside of objects ([db16c4d](https://github.com/eturino/apollo-link-scalars/commit/db16c4df20969c38c5af0d0ef0c9bb87cabce67e)), closes [#3](https://github.com/eturino/apollo-link-scalars/issues/3)
- test interfaces and unions ([cd5f654](https://github.com/eturino/apollo-link-scalars/commit/cd5f654747a2783f6ee2dcf89ee695edd4091dbb)), closes [#4](https://github.com/eturino/apollo-link-scalars/issues/4)
