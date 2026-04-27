# `apollo-link-scalars`

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-12-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

[![npm version](https://badge.fury.io/js/apollo-link-scalars.svg)](https://badge.fury.io/js/apollo-link-scalars)
[![Build Status](https://travis-ci.org/eturino/apollo-link-scalars.svg?branch=master)](https://travis-ci.org/eturino/apollo-link-scalars)
[![codebeat badge](https://codebeat.co/badges/a90150b8-7456-4f39-af0e-773f6fbf4324)](https://codebeat.co/projects/github-com-eturino-apollo-link-scalars-master)
[![Maintainability](https://api.codeclimate.com/v1/badges/bfc3427f46454051044b/maintainability)](https://codeclimate.com/github/eturino/apollo-link-scalars/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/bfc3427f46454051044b/test_coverage)](https://codeclimate.com/github/eturino/apollo-link-scalars/test_coverage)

[TypeDoc generated docs in here](https://eturino.github.io/apollo-link-scalars)

[Github repo here](https://github.com/eturino/apollo-link-scalars)

Custom Apollo Link to parse custom scalars from GraphQL responses and serialize them back in variables. It also validates enums, can strip `__typename` from inputs, and now includes a cache rehydration helper for JSON-persisted Apollo caches. See [Usage](#usage), [Options](#options), and [Rehydrating a persisted cache (`reviveScalarsInCache`)](#rehydrating-a-persisted-cache-revivescalarsincache).

## Library Versions

### Apollo Client v2 -> `apollo-link-scalars` `v0.x`

The deprecated [Apollo Client v2](https://www.apollographql.com/docs/react/migrating/apollo-client-3-migration/) is used in the [`0.x` branch](https://github.com/eturino/apollo-link-scalars/tree/v0.x).

Of the 0.x family, the versions 0.1.x and 0.2.x are deprecated and a [migration to 0.3.x is recommended](#breaking-change-removing-makeexecutableschema)

### Apollo Client v3 and v4 -> `apollo-link-scalars` `v5+`

`apollo-link-scalars` `v5+` supports both [Apollo Client v3](https://www.apollographql.com/docs/react/migrating/apollo-client-3-migration/) and Apollo Client v4.

The 1.x family is considered deprecated and a [migration to 2.x or greater is recommended](#breaking-change-removing-makeexecutableschema)

#### What's new in `v5`

- `@apollo/client` v4 support alongside the existing v3 support. The `peerDependencies` range is now `3.x || 4.x`.
- New `reviveScalarsInCache` helper for re-applying custom `parseValue` to a JSON-restored Apollo cache. See [Rehydrating a persisted cache (`reviveScalarsInCache`)](#rehydrating-a-persisted-cache-revivescalarsincache).
- No source-level breaking changes for code already using `withScalars` on `4.x`. Upgrading from `4.0.3` to `5.x` is a drop-in bump.

### Breaking Change: removing `makeExecutableSchema`

The versions that included `makeExecutableSchema` from `graphql-tools` are deprecated. This are the versions:

- 0.1.x and 0.2.x => please migrate to 0.3.x (apollo client v2 line, deprecated)
- 1.x => please migrate to 2.x (apollo client v3 line)

If you are not using `makeExecutableSchema` from this library, the upgrade will be transparent.

If you are using `makeExecutableSchema`, you just need to replace it from the version of graphql-tools compatible with the version of Apollo Client that you are using. Please have a look at the [Example of loading a schema](#example-of-loading-a-schema)

## Disclaimer: Potential cache interaction

Parsing scalars at link level means that Apollo cache will receive them already parsed. Depending on what kind of parsing is performed, this may interact with the cache JSON serialization of, for example,`apollo-cache-persist`. While `apollo-cache-persist` has an option to turn that serialisation off, others may have similar issues.

In the [original Apollo Client Github issue thread about scalar parsing](https://github.com/apollographql/apollo-client/issues/585), [this situation](https://github.com/apollographql/apollo-client/issues/585#issuecomment-400792837) [was discussed](https://github.com/apollographql/apollo-client/issues/585#issuecomment-400777797).

Apollo Client still does not support this natively. The original 2016 ticket was closed in 2018 as a housekeeping redirect to [`apollographql/apollo-feature-requests#368`](https://github.com/apollographql/apollo-feature-requests/issues/368), which has been open ever since. A potential solution of parsing after the cache might have some other issues, like returning different instances for the cached data, which may not be ideal in some situations that rely on that (e.g. react re-render control). I think some users will benefit more from the automatic parsing and serializing than the cost of the potential cache interactions.

**UPDATE**: [@woltob](https://github.com/woltob) surfaced the JSON-backed persistence case in [issue #760](https://github.com/eturino/apollo-link-scalars/issues/760). The [`reviveScalarsInCache`](#rehydrating-a-persisted-cache-revivescalarsincache) helper documented below is available in `apollo-link-scalars` `v5+`.

## Installation

Install the library together with `graphql`, plus the Apollo Client version your app already uses.

```sh
pnpm add apollo-link-scalars graphql @apollo/client
```

Use `apollo-link-scalars` `v5+` if you are on `@apollo/client` v3 or v4.

## What It Does

- Parses custom scalar fields in GraphQL responses by walking the query result with your schema.
- Serializes custom scalar input values before they are sent over the network.
- Lets `typesMap` overrides win over schema scalar implementations when you need app-specific behavior.
- Optionally validates enum values and removes `__typename` from inputs.
- Rehydrates parsed scalar values back into a JSON-restored Apollo cache with `reviveScalarsInCache` in `v5+`.

## Working Examples

This repository includes small React/Vite apps that demonstrate the main supported scenarios:

- [Apollo Client v3 example](./test-apps/apollo-v3-react) shows `withScalars` with Apollo Client v3.
- [Apollo Client v4 example](./test-apps/apollo-v4-react) shows `withScalars` with Apollo Client v4.
- [Persisted cache rehydration example](./test-apps/apollo-v4-persisted-cache) shows `reviveScalarsInCache` restoring parsed scalar values after JSON-backed cache persistence.
- [Next.js SSR hydration example](./test-apps/apollo-v4-next-ssr) shows the Next.js `getServerSideProps` JSON boundary from [issue #401](https://github.com/eturino/apollo-link-scalars/issues/401), plus the `reviveScalarsInCache` fix on the client restore path.

## Usage

At runtime you provide:

- a `GraphQLSchema`
- optionally, a `typesMap` with custom `parseValue` / `serialize` functions
- optionally, behavior flags such as enum validation, `__typename` stripping, and `nullFunctions`

Build the link with `withScalars()` and place it before your HTTP link.

### Basic Setup

```typescript
import { withScalars } from "apollo-link-scalars";
import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from "@apollo/client/core";
import { schema } from "./my-schema";

const httpLink = new HttpLink({ uri: "http://example.org/graphql" });

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: ApolloLink.from([withScalars({ schema }), httpLink]),
});
```

### Overriding Scalar Behavior With `typesMap`

You can override specific scalar parsing or serialization rules with `typesMap`. These functions take priority over any scalar implementation already present in the schema.

```typescript
import { withScalars } from "apollo-link-scalars";
import { ApolloLink, HttpLink } from "@apollo/client/core";
import { isString } from "es-toolkit";
import { schema } from "./my-schema";

const typesMap = {
  CustomScalar: {
    serialize: (parsed: unknown): string | null => (parsed instanceof CustomScalar ? parsed.toString() : null),
    parseValue: (raw: unknown): CustomScalar | null => {
      if (!raw) return null; // if for some reason we want to treat empty string as null, for example
      if (isString(raw)) {
        return new CustomScalar(raw);
      }

      throw new Error("invalid value to parse");
    },
  },
};

const link = ApolloLink.from([withScalars({ schema, typesMap }), new HttpLink({ uri: "http://example.org/graphql" })]);
```

### Options

`withScalars()` accepts these extra options:

- **`removeTypenameFromInputs`** (`Boolean`, default `false`): when enabled, it will remove from the inputs the `__typename` if it is found. This could be useful if we are using data received from a query as an input on another query.
- **`validateEnums`** (`Boolean`, default `false`): when enabled, it will validate the enums on parsing, throwing an error if it sees a value that is not one of the enum values.
- **`nullFunctions`** (`NullFunctions`, optional): by passing a set of transforms on how to box and unbox null types, you can automatically construct e.g. Maybe monads from null values. See [Changing the behaviour of nullable types](#changing-the-behaviour-of-nullable-types).

```typescript
withScalars({
  schema,
  typesMap,
  validateEnums: true,
  removeTypenameFromInputs: true,
});
```

### End-To-End Example

This is the usual shape in an application:

```typescript
import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from "@apollo/client";
import { withScalars } from "apollo-link-scalars";
import { schema, typesMap } from "./graphql/scalars";

const cache = new InMemoryCache();
const httpLink = new HttpLink({ uri: "/graphql" });

export const client = new ApolloClient({
  cache,
  link: ApolloLink.from([withScalars({ schema, typesMap, validateEnums: true }), httpLink]),
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

By passing the `nullFunctions` parameter to `withScalars`, you can change the way nullable types are handled. The default implementation leaves them as-is, i.e. `null => null` and `value => value`. If instead you want to transform nulls into a Maybe monad, you can supply functions corresponding to the following type. The examples below are based on the Maybe monad from [Seidr](https://github.com/hojberg/seidr), but any implementation will do.

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

### Rehydrating a persisted cache (`reviveScalarsInCache`)

`withScalars` runs inside the Apollo link chain, so it only parses operations flowing through the network. If you persist the Apollo cache with a JSON-backed store — [`apollo3-cache-persist`](https://github.com/apollographql/apollo-cache-persist), `AsyncStorage`, Redux-Persist, a custom adapter — the cache entries come back from storage as the shape JSON can hold: a custom `DateTime` becomes an ISO string, a custom `Money` becomes whatever `serialize` emitted, etc. The link never runs on rehydration, so the consumer never sees the parsed types. This is [issue #760](https://github.com/eturino/apollo-link-scalars/issues/760).

`reviveScalarsInCache` is a pure, schema-driven helper that fixes this. Call it on the extracted cache snapshot to re-apply the custom `parseValue` functions to every scalar field declared in the schema, then hand the result back to `cache.restore`.

```typescript
import { reviveScalarsInCache, withScalars } from "apollo-link-scalars";
import { LocalStorageWrapper, persistCache } from "apollo3-cache-persist";

const cache = new InMemoryCache();

await persistCache({ cache, storage: new LocalStorageWrapper(window.localStorage) });

// `persistCache` has just repopulated the cache from storage. Revive the
// snapshot so downstream cache reads see parsed scalars again.
cache.restore(reviveScalarsInCache(cache.extract(), { schema, typesMap }));

const client = new ApolloClient({
  cache,
  link: ApolloLink.from([withScalars({ schema, typesMap }), httpLink]),
});
```

Works with any JSON-backed store, including ones that hand you the raw payload directly:

```typescript
const raw = JSON.parse(await AsyncStorage.getItem("apollo-cache"));
cache.restore(reviveScalarsInCache(raw, { schema, typesMap }));
```

Use the same `schema`, `typesMap`, and `nullFunctions` you already use in `withScalars` so network responses and cache rehydration produce the same shapes.

Options:

- **`schema`** (required) — the same `GraphQLSchema` you pass to `withScalars`.
- **`typesMap`** (required) — the same map you pass to `withScalars`. Entries here win over any `parseValue` defined on the schema scalar. Leaf types defined only on the schema are still applied (same merge behavior as `withScalars`).
- **`nullFunctions`** (optional) — pass the same transform you pass to `withScalars` if you're boxing nullable values into a Maybe monad; nullable fields are wrapped through it on rehydration, matching what the link produces on the network path. Defaults to identity.

Caveats:

- Mutates the passed snapshot in place and returns the same reference. Pass a fresh object such as `cache.extract()` or a `JSON.parse(...)` result, not a live structure shared with the rest of the app.
- Requires `__typename` on embedded non-normalized objects (Apollo's default — `new InMemoryCache()` adds it). Caches built with `addTypename: false` skip embedded object revival because there is no typename to look up in the schema. Top-level normalized entities still work because their `__typename` is part of the cache key Apollo writes regardless.
- Interfaces, unions, and enum-scalar validation are out of scope in this first pass. Scalar fields nested under an interface- or union-typed field are not revived because the helper does not resolve the runtime `__typename` on the value itself the way the parser does.
- Idempotence is caller-contingent. If you run the helper twice on the same snapshot, every scalar's `parseValue` runs twice. Safe only when `parseValue` detects its own output and short-circuits — e.g. `(v) => typeof v === "string" ? new Date(v) : v` leaves `Date` instances alone on a second pass. A naive `(v) => Number(v) * 100` will silently corrupt a second call (`150 -> 15000`).

## Acknowledgements

The link code is heavily based on [`apollo-link-response-resolver`](https://github.com/with-heart/apollo-link-response-resolver) by [will-heart](https://github.com/with-heart).

While the approach in `apollo-link-response-resolver` is to apply resolvers based on the types taken from `__typename`, this follows the query and the schema to parse based on scalar types. Note that [`apollo-link-response-resolver` is archived now](https://github.com/with-heart/apollo-link-response-resolver/issues/18)

I started working on this after following the Apollo feature request https://github.com/apollographql/apollo-feature-requests/issues/2.

## Development, Commits, versioning and publishing

<details><summary>See documentation for development</summary>
<p>

For the current release checklist, CI publishing setup, and npm trusted publishing workflow, see [RELEASING.md](./RELEASING.md).

### Commits and CHANGELOG

Commits should follow the [Conventional Commits](https://www.conventionalcommits.org/) format. The repository enforces this with `commitlint`, and [`commit-and-tag-version`](https://github.com/absolute-version/commit-and-tag-version) uses those commit messages to determine the version bump and generate [`CHANGELOG.md`](CHANGELOG.md).

If you want help composing a compliant commit message, use [`commitizen`](https://github.com/commitizen/cz-cli):

```sh
# one-off interactive commit message helper
pnpm dlx git-cz
```

This project uses [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for release commits, tags, and changelog generation.

```sh
# bump package.json version, update CHANGELOG.md, git tag the release
pnpm version
```

You may find a tool like [**`wip`**](https://github.com/bitjson/wip) helpful for managing work in progress before you're ready to create a meaningful commit.

### Release Process

The canonical release process now lives in [RELEASING.md](./RELEASING.md). In short:

- verify locally with `pnpm test:full` and `pnpm e2e:run`
- run `pnpm version` to create the release commit, changelog update, and tag
- push with `git push --follow-tags origin <release-branch>`
- let GitHub Actions publish the package to npm via trusted publishing

### First Release / Special Cases

See [RELEASING.md](./RELEASING.md#first-release--special-cases) for `--first-release`, `--prerelease`, and `--sign` flags.

### Publish the Docs

```sh
pnpm doc:html && pnpm doc:publish
```

This will generate the docs and publish them in Github pages.

### One-Step Release Prep

There is a single command for preparing a release candidate locally:

```sh
# Prepare a standard release
pnpm prepare-release

# Push to git
git push --follow-tags origin <release-branch>
```

</p>
</details>

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="http://eturino.com"><img src="https://avatars3.githubusercontent.com/u/1095800?v=4?s=100" width="100px;" alt="Eduardo Turiño"/><br /><sub><b>Eduardo Turiño</b></sub></a><br /><a href="#ideas-eturino" title="Ideas, Planning, & Feedback">🤔</a> <a href="#infra-eturino" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/eturino/apollo-link-scalars/commits?author=eturino" title="Tests">⚠️</a> <a href="https://github.com/eturino/apollo-link-scalars/commits?author=eturino" title="Code">💻</a> <a href="https://github.com/eturino/apollo-link-scalars/commits?author=eturino" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://gsamokovarov.com"><img src="https://avatars0.githubusercontent.com/u/604618?v=4?s=100" width="100px;" alt="Genadi Samokovarov"/><br /><sub><b>Genadi Samokovarov</b></sub></a><br /><a href="https://github.com/eturino/apollo-link-scalars/issues?q=author%3Agsamokovarov" title="Bug reports">🐛</a> <a href="https://github.com/eturino/apollo-link-scalars/commits?author=gsamokovarov" title="Tests">⚠️</a> <a href="https://github.com/eturino/apollo-link-scalars/commits?author=gsamokovarov" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/brabeji"><img src="https://avatars3.githubusercontent.com/u/2237954?v=4?s=100" width="100px;" alt="Jiří Brabec"/><br /><sub><b>Jiří Brabec</b></sub></a><br /><a href="https://github.com/eturino/apollo-link-scalars/commits?author=brabeji" title="Documentation">📖</a> <a href="https://github.com/eturino/apollo-link-scalars/issues?q=author%3Abrabeji" title="Bug reports">🐛</a> <a href="https://github.com/eturino/apollo-link-scalars/commits?author=brabeji" title="Tests">⚠️</a> <a href="https://github.com/eturino/apollo-link-scalars/commits?author=brabeji" title="Code">💻</a> <a href="#ideas-brabeji" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://twitter.com/JakubPetriska"><img src="https://avatars3.githubusercontent.com/u/5531859?v=4?s=100" width="100px;" alt="Jakub Petriska"/><br /><sub><b>Jakub Petriska</b></sub></a><br /><a href="https://github.com/eturino/apollo-link-scalars/issues?q=author%3AJakubPetriska" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/dobrinov"><img src="https://avatars2.githubusercontent.com/u/996877?v=4?s=100" width="100px;" alt="Deyan Dobrinov"/><br /><sub><b>Deyan Dobrinov</b></sub></a><br /><a href="https://github.com/eturino/apollo-link-scalars/issues?q=author%3Adobrinov" title="Bug reports">🐛</a> <a href="#ideas-dobrinov" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/nagirrab"><img src="https://avatars.githubusercontent.com/u/1761890?v=4?s=100" width="100px;" alt="Hugh Barrigan"/><br /><sub><b>Hugh Barrigan</b></sub></a><br /><a href="https://github.com/eturino/apollo-link-scalars/commits?author=nagirrab" title="Tests">⚠️</a> <a href="https://github.com/eturino/apollo-link-scalars/commits?author=nagirrab" title="Code">💻</a> <a href="#ideas-nagirrab" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/UselessPickles"><img src="https://avatars.githubusercontent.com/u/22800095?v=4?s=100" width="100px;" alt="Jeff Lau"/><br /><sub><b>Jeff Lau</b></sub></a><br /><a href="https://github.com/eturino/apollo-link-scalars/commits?author=UselessPickles" title="Documentation">📖</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="http://floriancargoet.com"><img src="https://avatars.githubusercontent.com/u/110431?v=4?s=100" width="100px;" alt="Florian Cargoët"/><br /><sub><b>Florian Cargoët</b></sub></a><br /><a href="https://github.com/eturino/apollo-link-scalars/issues?q=author%3Afloriancargoet" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://jaffparker.dev"><img src="https://avatars.githubusercontent.com/u/10477757?v=4?s=100" width="100px;" alt="Jaff Parker"/><br /><sub><b>Jaff Parker</b></sub></a><br /><a href="https://github.com/eturino/apollo-link-scalars/issues?q=author%3AJaffParker" title="Bug reports">🐛</a> <a href="#infra-JaffParker" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/frec-kenneth"><img src="https://avatars.githubusercontent.com/u/98547003?v=4?s=100" width="100px;" alt="Kenneth"/><br /><sub><b>Kenneth</b></sub></a><br /><a href="https://github.com/eturino/apollo-link-scalars/commits?author=frec-kenneth" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://jstassen.com"><img src="https://avatars.githubusercontent.com/u/220755?v=4?s=100" width="100px;" alt="Sir.Nathan (Jonathan Stassen)"/><br /><sub><b>Sir.Nathan (Jonathan Stassen)</b></sub></a><br /><a href="#infra-TheBox193" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#platform-TheBox193" title="Packaging/porting to new platform">📦</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/burner"><img src="https://avatars.githubusercontent.com/u/13327?v=4?s=100" width="100px;" alt="Robert Schadek"/><br /><sub><b>Robert Schadek</b></sub></a><br /><a href="#infra-burner" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/eturino/apollo-link-scalars/commits?author=burner" title="Code">💻</a> <a href="#platform-burner" title="Packaging/porting to new platform">📦</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
