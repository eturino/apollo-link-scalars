# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.1.4](https://github.com/eturino/apollo-link-scalars/compare/v0.1.3...v0.1.4) (2019-12-05)

### [0.1.3](https://github.com/eturino/apollo-link-scalars/compare/v0.1.2...v0.1.3) (2019-12-04)


### Features

* `removeTypenameFromInputs` option to remove __typename from inputs ([d9a194f](https://github.com/eturino/apollo-link-scalars/commit/d9a194f11bcc1f26b2a6125e366fa812295ebd1d))

### [0.1.2](https://github.com/eturino/apollo-link-scalars/compare/v0.1.1...v0.1.2) (2019-12-04)


### Bug Fixes

* mutate the operation with serialized vars (avoid shallow copy with wrong prototype errors) ([ab9a107](https://github.com/eturino/apollo-link-scalars/commit/ab9a10797c28d84b48ab9fb416f103a0a7ca640c))

### [0.1.1](https://github.com/eturino/apollo-link-scalars/compare/v0.1.0...v0.1.1) (2019-12-02)


### Features

* exporting `isNone` and `mapIfArray` utils ([031a6d1](https://github.com/eturino/apollo-link-scalars/commit/031a6d1612d4ced48b932fc74490f4004e933eb1))

## 0.1.0 (2019-11-30)


### Features

* `validateEnums` + ensure non-nulls ([feaff53](https://github.com/eturino/apollo-link-scalars/commit/feaff53ffdd724b87363c8ea3aac43270646f23a)), closes [#2](https://github.com/eturino/apollo-link-scalars/issues/2) [#7](https://github.com/eturino/apollo-link-scalars/issues/7)
* can parse scalars as result of query root. Uses the scalar type in the schema or functions ([b4348eb](https://github.com/eturino/apollo-link-scalars/commit/b4348eb244def4821a9e9311fef268aa1c6e7a35))
* initial Fragment Unit helpers ([585a845](https://github.com/eturino/apollo-link-scalars/commit/585a84592eb4f6be12383ddbe764546a47f3d16f))
* serializer of nested + don't __typename ([0014120](https://github.com/eturino/apollo-link-scalars/commit/0014120b876d52251bdcb12a935a28d8e8fad27e)), closes [#18](https://github.com/eturino/apollo-link-scalars/issues/18) [#15](https://github.com/eturino/apollo-link-scalars/issues/15)
* serializer of schema input ([86ff601](https://github.com/eturino/apollo-link-scalars/commit/86ff6017bed8cb61eb30ac596c78878e1cf63d42)), closes [#14](https://github.com/eturino/apollo-link-scalars/issues/14)
* support arrays ([bc84fff](https://github.com/eturino/apollo-link-scalars/commit/bc84fff93671354920195851392ed0dbd82c0b0b)), closes [#5](https://github.com/eturino/apollo-link-scalars/issues/5)
* support for nested objects, including in arrays, and arrays inside of objects ([db16c4d](https://github.com/eturino/apollo-link-scalars/commit/db16c4df20969c38c5af0d0ef0c9bb87cabce67e)), closes [#3](https://github.com/eturino/apollo-link-scalars/issues/3)
* test interfaces and unions ([cd5f654](https://github.com/eturino/apollo-link-scalars/commit/cd5f654747a2783f6ee2dcf89ee695edd4091dbb)), closes [#4](https://github.com/eturino/apollo-link-scalars/issues/4)
