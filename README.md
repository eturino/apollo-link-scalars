# `apollo-link-scalars`

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-10-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

[![npm version](https://badge.fury.io/js/apollo-link-scalars.svg)](https://badge.fury.io/js/apollo-link-scalars)
[![Build Status](https://travis-ci.org/eturino/apollo-link-scalars.svg?branch=master)](https://travis-ci.org/eturino/apollo-link-scalars)
[![codebeat badge](https://codebeat.co/badges/a90150b8-7456-4f39-af0e-773f6fbf4324)](https://codebeat.co/projects/github-com-eturino-apollo-link-scalars-master)
[![Maintainability](https://api.codeclimate.com/v1/badges/bfc3427f46454051044b/maintainability)](https://codeclimate.com/github/eturino/apollo-link-scalars/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/bfc3427f46454051044b/test_coverage)](https://codeclimate.com/github/eturino/apollo-link-scalars/test_coverage)

[TypeDoc generated docs in here](https://eturino.github.io/apollo-link-scalars)

[Github repo here](https://github.com/eturino/apollo-link-scalars)

Custom Apollo Link to allow to parse custom scalars from responses, as well as serialize custom scalars in inputs. It can also validate enums, and cleanup `__typename` from inputs. (see [Usage](#usage) and [Options](#options)).

## Library Versions

### Apollo Client v2 -> `apollo-link-scalars` `v0.x`

The deprecated [Apollo Client v2](https://www.apollographql.com/docs/react/migrating/apollo-client-3-migration/) is used in the [`0.x` branch](https://github.com/eturino/apollo-link-scalars/tree/v0.x).

Of the 0.x family, the versions 0.1.x and 0.2.x are deprecated and a [migration to 0.3.x is recommended](#breaking-change-removing-makeexecutableschema)

### Apollo Client v3 -> `apollo-link-scalars` `v2.x`

The current [Apollo Client v3](https://www.apollographql.com/docs/react/migrating/apollo-client-3-migration/) is used in the versions from 1.0

The 1.x family is considered deprecated and a [migration to 2.x is recommended](#breaking-change-removing-makeexecutableschema)

### Breaking Change: removing `makeExecutableSchema`

The versions that included `makeExecutableSchema` from `graphql-tools` are deprecated. This are the versions:

- 0.1.x and 0.2.x => please migrate to 0.3.x (apollo client v2 line, deprecated)
- 1.x => please migrate to 2.x (apollo client v3 line)

If you are not using `makeExecutableSchema` from this library, the upgrade will be transparent.

If you are using `makeExecutableSchema`, you just need to replace it from the version of graphql-tools compatible with the version of Apollo Client that you are using. Please have a look at the [Example of loading a schema](#example-of-loading-a-schema)

## Disclaimer: Potential cache interaction

Parsing scalars at link level means that Apollo cache will receive them already parsed. Depending on what kind of parsing is performed, this may interact with the cache JSON serialization of, for example,`apollo-cache-persist`. While `apollo-cache-persist` has an option to turn that serialisation off, others may have similar issues.

In the [original Apollo Client Github issue thread about scalar parsing](https://github.com/apollographql/apollo-client/issues/585), [this situation](https://github.com/apollographql/apollo-client/issues/585#issuecomment-400792837) [was discussed](https://github.com/apollographql/apollo-client/issues/585#issuecomment-400777797).

At the time of this writing, Apollo Client still does not support this over 4 years after the original ticket was opened. A potential solution of parsing after the cache might have some other issues, like returning different instances for the cached data, which may not be ideal in some situations that rely on that (e.g. react re-render control). I think some users will benefit more from the automatic parsing and serializing than the cost of the potential cache interactions.

**UPDATE**: [@woltob](https://github.com/woltob) has a proposal related to this: https://github.com/eturino/apollo-link-scalars/issues/760

## Installation

`yarn add apollo-link-scalars graphql` or `npm install apollo-link-scalars graphql`.

## Usage

We need to pass a `GraphQLSchema`, and optionally we can also pass a map of custom serialization/parsing functions for specific types.

You can build the link by calling the `withScalars()` function, passing to it the `schema` and optionally a `typesMap`.

```typescript
import { withScalars } from "apollo-link-scalars";
import { ApolloLink, HttpLink } from "@apollo/client/core";
import { schema } from "./my-schema";

const link = ApolloLink.from([
  withScalars({ schema }),
  new HttpLink({ uri: "http://example.org/graphql" })
]);

// we can also pass a custom map of functions. These will have priority over the GraphQLTypes parsing and serializing functions from the Schema.
const typesMap = {
  CustomScalar: {
    serialize: (parsed: unknown): string | null => (parsed instanceof CustomScalar ? parsed.toString() : null),
    parseValue: (raw: unknown): CustomScalar | null => {
      if (!raw) return null; // if for some reason we want to treat empty string as null, for example
      if (isString(raw)) {
        return new CustomScalar(raw);
      }

      throw new Error("invalid value to parse")
    }
  }
};

const link2 = ApolloLink.from([
  withScalars({ schema, typesMap }),
  new HttpLink({ uri: "http://example.org/graphql" })
]);
```

### Options

We can pass extra options to `withScalars()` to modify the behaviour

- **`removeTypenameFromInputs`** (`Boolean`, default `false`): when enabled, it will remove from the inputs the `__typename` if it is found. This could be useful if we are using data received from a query as an input on another query.
- **`validateEnums`** (`Boolean`, default `false`): when enabled, it will validate the enums on parsing, throwing an error if it sees a value that is not one of the enum values.
- **`nullFunction`** (`NullFunction`, default `null`): by passing a set of transforms on how to box and unbox null types, you can automatically construct e.g. Maybe monads from the null types. See below for an example.

```typescript
withScalars({
  schema,
  typesMap,
  validateEnums: true,
  removeTypenameFromInputs: true,
});
```

### Example of loading a schema

```typescript
import { gql } from "@apollo/client/core";
import { GraphQLScalarType, Kind } from "graphql";
import { makeExecutableSchema } from "@graphql-tools/schema";

// GraphQL Schema definition.
const typeDefs = gql`
  type Query {
    myList: [MyObject!]!
  }

  type MyObject {
    day: Date
    days: [Date]!
    nested: MyObject
  }

  "represents a Date with time"
  scalar Date
`;

const resolvers = {
  // example of scalar type, which will parse the string into a custom class CustomDate which receives a Date object
  Date: new GraphQLScalarType({
    name: "Date",
    serialize: (parsed: CustomDate | null) => parsed && parsed.toISOString(),
    parseValue: (raw: any) => raw && new CustomDate(new Date(raw)),
    parseLiteral(ast) {
      if (ast.kind === Kind.STRING || ast.kind === Kind.INT) {
        return new CustomDate(new Date(ast.value));
      }
      return null;
    },
  }),
};

// GraphQL Schema, required to use the link
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
```

#### Synchronously creating a link instance with [`graphql-code-generator`](https://graphql-code-generator.com/) setup

> Warning: Be sure to watch your bundle size and know what you are doing.

Codegen config to generate introspection data:

`codegen.yml`

```yaml
---
generates:
  src/__generated__/graphql.schema.json:
    plugins:
      - "introspection"
    config:
      minify: true
```

Synchronous code to create link instance in common scenario:

```typescript
import introspectionResult from "./__generated__/graphql.schema.json";
import { buildClientSchema, IntrospectionQuery } from "graphql";

const schema = buildClientSchema(introspectionResult)
// note: sometimes it seems to be needed to cast it as Introspection Query
// `const schema = buildClientSchema((introspectionResult as unknown) as IntrospectionQuery)`

const scalarsLink = withScalars({
  schema,
  typesMap: { … },
});
```

#### Changing the behaviour of nullable types

By passing the `nullFunctions` parameter to `withScalar`, you can change the way that nullable types are handled. The default implementation will leave them exactly as is, i.e. `null` => `null` and `value` => `value`. If instead, you e.g. wish to transform nulls into a Maybe monad, you can supply functions corresponding to the following type. The examples below are based on the Maybe monad from [Seidr](https://github.com/hojberg/seidr) but any implementation will do.

```typescript
type NullFunctions = {
  serialize(input: any): any | null;
  parseValue(raw: any | null): any;
};

const nullFunctions: NullFunctions = {
  parseValue(raw: any) {
    if (isNone(raw)) {
      return Nothing();
    } else {
      return Just(raw);
    }
  },
  serialize(input: any) {
    return input.caseOf({
      Just(value) {
        return value;
      },
      Nothing() {
        return null;
      },
    });
  },
};
```

The `nullFunctions` are executed after the normal parsing/serializing. The normal parsing/serializing functions are not called for `null` values.

Both in parsing and serializing, we have the following logic (in pseudocode):

```ts
if (isNone(value)) {
  return this.nullFunctions.serialize(value);
}

const serialized = serializeNonNullValue(value);
return this.nullFunctions.serialize(serialized);
```

```ts
if (isNone(value)) {
  return this.nullFunctions.parseValue(value);
}

const parsed = parseNonNullValue(value);
return this.nullFunctions.parseValue(parsed);
```

## Acknowledgements

The link code is heavily based on [`apollo-link-response-resolver`](https://github.com/with-heart/apollo-link-response-resolver) by [will-heart](https://github.com/with-heart).

While the approach in `apollo-link-response-resolver` is to apply resolvers based on the types taken from `__typename`, this follows the query and the schema to parse based on scalar types. Note that [`apollo-link-response-resolver` is archived now](https://github.com/with-heart/apollo-link-response-resolver/issues/18)

I started working on this after following the Apollo feature request https://github.com/apollographql/apollo-feature-requests/issues/2.

## Development, Commits, versioning and publishing

<details><summary>See documentation for development</summary>
<p>

See [The Typescript-Starter docs](https://github.com/bitjson/typescript-starter#bump-version-update-changelog-commit--tag-release).

### Commits and CHANGELOG

For commits, you should use [`commitizen`](https://github.com/commitizen/cz-cli)

```sh
yarn global add commitizen

#commit your changes:
git cz
```

As typescript-starter docs state:

This project is tooled for [conventional changelog](https://github.com/conventional-changelog/conventional-changelog) to make managing releases easier. See the [standard-version](https://github.com/conventional-changelog/standard-version) documentation for more information on the workflow, or [`CHANGELOG.md`](CHANGELOG.md) for an example.

```sh
# bump package.json version, update CHANGELOG.md, git tag the release
yarn run version
```

You may find a tool like [**`wip`**](https://github.com/bitjson/wip) helpful for managing work in progress before you're ready to create a meaningful commit.

### Creating the first version

Once you are ready to create the first version, run the following (note that `reset` is destructive and will remove all files not in the git repo from the directory).

```sh
# Reset the repo to the latest commit and build everything
yarn run reset && yarn run test && yarn run doc:html

# Then version it with standard-version options. e.g.:
# don't bump package.json version
yarn run version -- --first-release

# Other popular options include:

# PGP sign it:
# $ yarn run version -- --sign

# alpha release:
# $ yarn run version -- --prerelease alpha
```

And after that, remember to [publish the docs](#publish-the-docs).

And finally push the new tags to Github and publish the package to `npm`.

```sh
# Push to git
git push --follow-tags origin master

# Publish to NPM (allowing public access, required if the package name is namespaced like `@somewhere/some-lib`)
yarn publish --access public
```

### Publish the Docs

```sh
yarn run doc:html && yarn run doc:publish
```

This will generate the docs and publish them in Github pages.

### Generate a version

There is a single yarn command for preparing a new release. See [One-step publish preparation script in TypeScript-Starter](https://github.com/bitjson/typescript-starter#one-step-publish-preparation-script)

```sh
# Prepare a standard release
yarn prepare-release

# Push to git
git push --follow-tags origin master

# Publish to NPM (allowing public access, required if the package name is namespaced like `@somewhere/some-lib`)
yarn publish --access public
```

</p>
</details>

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="http://eturino.com"><img src="https://avatars3.githubusercontent.com/u/1095800?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Eduardo Turiño</b></sub></a><br /><a href="#ideas-eturino" title="Ideas, Planning, & Feedback">🤔</a> <a href="#infra-eturino" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/eturino/apollo-link-scalars/commits?author=eturino" title="Tests">⚠️</a> <a href="https://github.com/eturino/apollo-link-scalars/commits?author=eturino" title="Code">💻</a> <a href="https://github.com/eturino/apollo-link-scalars/commits?author=eturino" title="Documentation">📖</a></td>
    <td align="center"><a href="http://gsamokovarov.com"><img src="https://avatars0.githubusercontent.com/u/604618?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Genadi Samokovarov</b></sub></a><br /><a href="https://github.com/eturino/apollo-link-scalars/issues?q=author%3Agsamokovarov" title="Bug reports">🐛</a> <a href="https://github.com/eturino/apollo-link-scalars/commits?author=gsamokovarov" title="Tests">⚠️</a> <a href="https://github.com/eturino/apollo-link-scalars/commits?author=gsamokovarov" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/brabeji"><img src="https://avatars3.githubusercontent.com/u/2237954?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jiří Brabec</b></sub></a><br /><a href="https://github.com/eturino/apollo-link-scalars/commits?author=brabeji" title="Documentation">📖</a> <a href="https://github.com/eturino/apollo-link-scalars/issues?q=author%3Abrabeji" title="Bug reports">🐛</a> <a href="https://github.com/eturino/apollo-link-scalars/commits?author=brabeji" title="Tests">⚠️</a> <a href="https://github.com/eturino/apollo-link-scalars/commits?author=brabeji" title="Code">💻</a> <a href="#ideas-brabeji" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://twitter.com/JakubPetriska"><img src="https://avatars3.githubusercontent.com/u/5531859?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jakub Petriska</b></sub></a><br /><a href="https://github.com/eturino/apollo-link-scalars/issues?q=author%3AJakubPetriska" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/dobrinov"><img src="https://avatars2.githubusercontent.com/u/996877?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Deyan Dobrinov</b></sub></a><br /><a href="https://github.com/eturino/apollo-link-scalars/issues?q=author%3Adobrinov" title="Bug reports">🐛</a> <a href="#ideas-dobrinov" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/nagirrab"><img src="https://avatars.githubusercontent.com/u/1761890?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Hugh Barrigan</b></sub></a><br /><a href="https://github.com/eturino/apollo-link-scalars/commits?author=nagirrab" title="Tests">⚠️</a> <a href="https://github.com/eturino/apollo-link-scalars/commits?author=nagirrab" title="Code">💻</a> <a href="#ideas-nagirrab" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/UselessPickles"><img src="https://avatars.githubusercontent.com/u/22800095?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jeff Lau</b></sub></a><br /><a href="https://github.com/eturino/apollo-link-scalars/commits?author=UselessPickles" title="Documentation">📖</a></td>
  </tr>
  <tr>
    <td align="center"><a href="http://floriancargoet.com"><img src="https://avatars.githubusercontent.com/u/110431?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Florian Cargoët</b></sub></a><br /><a href="https://github.com/eturino/apollo-link-scalars/issues?q=author%3Afloriancargoet" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://jaffparker.dev"><img src="https://avatars.githubusercontent.com/u/10477757?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jaff Parker</b></sub></a><br /><a href="https://github.com/eturino/apollo-link-scalars/issues?q=author%3AJaffParker" title="Bug reports">🐛</a> <a href="#infra-JaffParker" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
    <td align="center"><a href="https://github.com/frec-kenneth"><img src="https://avatars.githubusercontent.com/u/98547003?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Kenneth</b></sub></a><br /><a href="https://github.com/eturino/apollo-link-scalars/commits?author=frec-kenneth" title="Documentation">📖</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
