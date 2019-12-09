# `apollo-link-scalars`

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-4-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

[![npm version](https://badge.fury.io/js/apollo-link-scalars.svg)](https://badge.fury.io/js/apollo-link-scalars)
[![Build Status](https://travis-ci.org/eturino/apollo-link-scalars.svg?branch=master)](https://travis-ci.org/eturino/apollo-link-scalars)
[![codebeat badge](https://codebeat.co/badges/a90150b8-7456-4f39-af0e-773f6fbf4324)](https://codebeat.co/projects/github-com-eturino-apollo-link-scalars-master)
[![Maintainability](https://api.codeclimate.com/v1/badges/bfc3427f46454051044b/maintainability)](https://codeclimate.com/github/eturino/apollo-link-scalars/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/bfc3427f46454051044b/test_coverage)](https://codeclimate.com/github/eturino/apollo-link-scalars/test_coverage)

[TypeDoc generated docs in here](https://eturino.github.io/apollo-link-scalars)

[Github repo here](https://github.com/eturino/apollo-link-scalars)

Custom Apollo Link to allow to parse custom scalars from responses, as well as serialize custom scalars in inputs. It can also validate enums, and cleanup `__typename` from inputs. (see [Usage](#usage) and [Options](#options)).

## Disclaimer: Potential cache interaction

Parsing scalars at link level means that Apollo cache will receive them already parsed. Depending on what kind of parsing is performed, this may interact with the cache JSON serialization of, for example,`apollo-cache-persist`. While `apollo-cache-persist` has an option to turn that serialisation off, others may have similar issues.

In the [original Apollo Client Github issue thread about scalar parsing](https://github.com/apollographql/apollo-client/issues/585), [this situation](https://github.com/apollographql/apollo-client/issues/585#issuecomment-400792837) [was discussed](https://github.com/apollographql/apollo-client/issues/585#issuecomment-400777797).

At the time of this writing, Apollo Client still does not support this over 4 years after the original ticket was opened. A potential solution of parsing after the cache might have some other issues, like returning different instances for the cached data, which may not be ideal in some situations that rely on that (e.g. react re-render control). I think some users will benefit more from the automatic parsing and serializing than the cost of the potential cache interactions.

## Installation

`yarn add apollo-link-scalars` or `npm install apollo-link-scalars`.

## Usage

We need to pass a `GraphQLSchema`, and optionally we can also pass a map of custom serialization/parsing functions for specific types.

You can build the link by calling the `withScalars()` function, passing to it the `schema` and optionally a `typesMap`.

```typescript
import { withScalars } from "apollo-link-scalars";
import { ApolloLink } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { schema } from "./my-schema";

const link = ApolloLink.from([
  withScalars({ schema }),
  new HttpLink({ uri: "http://example.org/graphql" })
]);

// we can also pass a custom map of functions. These will have priority over the GraphQLTypes parsing and serializing functions from the Schema.
const typesMap = {
  CustomScalar: {
    serialize: (parsed: CustomScalar) => parsed.toString(),
    parseValue: (raw: string | number | null): CustomScalar | null => {
      return raw ? new CustomScalar(raw) : null;
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

```typescript
withScalars({
  schema,
  typesMap,
  validateEnums: true,
  removeTypenameFromInputs: true
});
```

### Example of loading a schema

```typescript
import gql from "graphql-tag";
import { GraphQLScalarType, Kind } from "graphql";
import { makeExecutableSchema } from "graphql-tools";

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
    }
  })
};

// GraphQL Schema, required to use the link
const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});
```

#### Synchronously creating a link instance with [`graphql-code-generator`](https://graphql-code-generator.com/) setup

> Warning: Be sure to watch your bundle size and know what you are doing.

Codegen config to generate introspection data:

`codegen.yml`

```yml
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

And finally push the new tags to github and publish the package to npm.

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

This will generate the docs and publish them in github pages.

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
    <td align="center"><a href="http://eturino.com"><img src="https://avatars3.githubusercontent.com/u/1095800?v=4" width="100px;" alt="Eduardo Turiño"/><br /><sub><b>Eduardo Turiño</b></sub></a><br /><a href="#ideas-eturino" title="Ideas, Planning, & Feedback">🤔</a> <a href="#infra-eturino" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/eturino/apollo-link-scalars/commits?author=eturino" title="Tests">⚠️</a> <a href="https://github.com/eturino/apollo-link-scalars/commits?author=eturino" title="Code">💻</a> <a href="https://github.com/eturino/apollo-link-scalars/commits?author=eturino" title="Documentation">📖</a></td>
    <td align="center"><a href="http://gsamokovarov.com"><img src="https://avatars0.githubusercontent.com/u/604618?v=4" width="100px;" alt="Genadi Samokovarov"/><br /><sub><b>Genadi Samokovarov</b></sub></a><br /><a href="https://github.com/eturino/apollo-link-scalars/issues?q=author%3Agsamokovarov" title="Bug reports">🐛</a> <a href="https://github.com/eturino/apollo-link-scalars/commits?author=gsamokovarov" title="Tests">⚠️</a> <a href="https://github.com/eturino/apollo-link-scalars/commits?author=gsamokovarov" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/brabeji"><img src="https://avatars3.githubusercontent.com/u/2237954?v=4" width="100px;" alt="Jiří Brabec"/><br /><sub><b>Jiří Brabec</b></sub></a><br /><a href="https://github.com/eturino/apollo-link-scalars/commits?author=brabeji" title="Documentation">📖</a></td>
    <td align="center"><a href="https://twitter.com/JakubPetriska"><img src="https://avatars3.githubusercontent.com/u/5531859?v=4" width="100px;" alt="Jakub Petriska"/><br /><sub><b>Jakub Petriska</b></sub></a><br /><a href="https://github.com/eturino/apollo-link-scalars/issues?q=author%3AJakubPetriska" title="Bug reports">🐛</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
