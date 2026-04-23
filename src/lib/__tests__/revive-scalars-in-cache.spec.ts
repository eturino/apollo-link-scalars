import { buildSchema, type GraphQLScalarType } from "graphql";
import { reviveScalarsInCache } from "../revive-scalars-in-cache";

// A schema covering the shapes we need to walk over the extracted cache:
// - top-level scalars on entities (DateTime)
// - scalar lists
// - fields with arguments (ROOT_QUERY entries encode args into the cache
//   key and we have to strip them to look up the schema field)
// - embedded non-normalized objects with __typename
const schema = buildSchema(`
  scalar DateTime
  scalar Money

  type Author {
    id: ID!
    name: String!
    joined: DateTime
  }

  type Post {
    id: ID!
    title: String!
    createdAt: DateTime
    tags: [String!]
    prices: [Money!]
    requiredPrices: [Money!]!
    meta: Meta
    author: Author
  }

  type Meta {
    lastEditedAt: DateTime
  }

  type Query {
    post(id: ID!): Post
    now(scale: String): DateTime
  }
`);

const typesMap = {
  DateTime: {
    serialize: (v: unknown) => (v instanceof Date ? v.toISOString() : v),
    parseValue: (v: unknown) => (typeof v === "string" ? new Date(v) : v),
  },
  Money: {
    serialize: (v: unknown) => String(v),
    parseValue: (v: unknown) => (typeof v === "string" ? Number(v) * 100 : v),
  },
};

describe("reviveScalarsInCache", () => {
  it("parses a scalar field on a normalized entity", () => {
    const extracted = {
      "Post:1": {
        __typename: "Post",
        id: "1",
        title: "hello",
        createdAt: "2017-11-04T18:48:46.250Z",
      },
    };
    const out = reviveScalarsInCache(extracted, { schema, typesMap });
    expect(out["Post:1"].createdAt).toBeInstanceOf(Date);
    expect((out["Post:1"].createdAt as unknown as Date).toISOString()).toBe("2017-11-04T18:48:46.250Z");
  });

  it("leaves scalar fields absent from typesMap alone", () => {
    const extracted = {
      "Post:1": { __typename: "Post", id: "1", title: "hello" },
    };
    const out = reviveScalarsInCache(extracted, { schema, typesMap });
    expect(out["Post:1"].title).toBe("hello");
  });

  it("leaves null scalar values alone", () => {
    const extracted = {
      "Post:1": { __typename: "Post", id: "1", title: "hello", createdAt: null },
    };
    const out = reviveScalarsInCache(extracted, { schema, typesMap });
    expect(out["Post:1"].createdAt).toBeNull();
  });

  it("parses each element of a scalar list", () => {
    const extracted = {
      "Post:1": {
        __typename: "Post",
        id: "1",
        title: "hello",
        prices: ["1.50", "2.99"],
      },
    };
    const out = reviveScalarsInCache(extracted, { schema, typesMap });
    expect(out["Post:1"].prices).toEqual([150, 299]);
  });

  it("does not touch scalar lists whose type is absent from typesMap", () => {
    const extracted = {
      "Post:1": { __typename: "Post", id: "1", title: "hello", tags: ["a", "b"] },
    };
    const out = reviveScalarsInCache(extracted, { schema, typesMap });
    expect(out["Post:1"].tags).toEqual(["a", "b"]);
  });

  it("strips arguments from cache field keys when looking up the schema", () => {
    const extracted = {
      ROOT_QUERY: {
        __typename: "Query",
        'post({"id":"1"})': { __ref: "Post:1" },
      },
      "Post:1": {
        __typename: "Post",
        id: "1",
        title: "hello",
        createdAt: "2017-11-04T18:48:46.250Z",
      },
    };
    const out = reviveScalarsInCache(extracted, { schema, typesMap });
    expect(out["Post:1"].createdAt).toBeInstanceOf(Date);
    expect(out.ROOT_QUERY['post({"id":"1"})']).toEqual({ __ref: "Post:1" });
  });

  it("recurses into embedded objects with __typename", () => {
    const extracted = {
      "Post:1": {
        __typename: "Post",
        id: "1",
        title: "hello",
        meta: { __typename: "Meta", lastEditedAt: "2020-01-02T00:00:00.000Z" },
      },
    };
    const out = reviveScalarsInCache(extracted, { schema, typesMap });
    expect(out["Post:1"].meta).toBeDefined();
    const meta = out["Post:1"].meta as unknown as { lastEditedAt: Date };
    expect(meta.lastEditedAt).toBeInstanceOf(Date);
  });

  it("leaves __ref objects untouched", () => {
    const extracted = {
      "Post:1": {
        __typename: "Post",
        id: "1",
        title: "hello",
        author: { __ref: "Author:42" },
      },
      "Author:42": {
        __typename: "Author",
        id: "42",
        name: "Ada",
        joined: "1815-12-10T00:00:00.000Z",
      },
    };
    const out = reviveScalarsInCache(extracted, { schema, typesMap });
    expect(out["Post:1"].author).toEqual({ __ref: "Author:42" });
    // The referenced entity is walked at the top level, not via the __ref hop.
    expect(out["Author:42"].joined).toBeInstanceOf(Date);
  });

  it("skips entries that are not entity objects", () => {
    const extracted = {
      "Post:1": { __typename: "Post", id: "1", title: "hello" },
      stringEntry: "wat" as unknown,
      nullEntry: null as unknown,
    };
    // Must not throw on non-object entries.
    const out = reviveScalarsInCache(extracted as Record<string, unknown>, { schema, typesMap });
    expect(out.stringEntry).toBe("wat");
    expect(out.nullEntry).toBeNull();
  });

  it("skips entities whose __typename is not in the schema", () => {
    const extracted = {
      "Ghost:1": { __typename: "Ghost", id: "1", createdAt: "2017-11-04T18:48:46.250Z" },
    };
    const out = reviveScalarsInCache(extracted, { schema, typesMap });
    // Unknown typename -> untouched, no crash.
    expect(out["Ghost:1"].createdAt).toBe("2017-11-04T18:48:46.250Z");
  });

  it("parses every element of a non-null list of non-null scalars", () => {
    const extracted = {
      "Post:1": {
        __typename: "Post",
        id: "1",
        title: "hello",
        requiredPrices: ["1.50", "2.99", "10.00"],
      },
    };
    const out = reviveScalarsInCache(extracted, { schema, typesMap });
    expect(out["Post:1"].requiredPrices).toEqual([150, 299, 1000]);
  });

  it("parses a scalar field with arguments stored under ROOT_QUERY", () => {
    const extracted = {
      ROOT_QUERY: {
        __typename: "Query",
        'now({"scale":"utc"})': "2021-06-15T12:00:00.000Z",
      },
    };
    const out = reviveScalarsInCache(extracted, { schema, typesMap });
    const value = out.ROOT_QUERY['now({"scale":"utc"})'];
    expect(value).toBeInstanceOf(Date);
    expect((value as unknown as Date).toISOString()).toBe("2021-06-15T12:00:00.000Z");
  });

  it("uses the schema scalar's parseValue when typesMap has no entry", () => {
    // Same shape `ScalarApolloLink` applies on the network path: scalar
    // types carrying a programmatic `parseValue` are honored even when
    // the caller's `typesMap` omits them.
    const localSchema = buildSchema(`
      scalar Timestamp
      type Event { id: ID! when: Timestamp }
      type Query { event(id: ID!): Event }
    `);
    const timestamp = localSchema.getType("Timestamp") as GraphQLScalarType;
    timestamp.parseValue = (value: unknown) => (typeof value === "string" ? new Date(value) : value);

    const extracted = {
      "Event:1": { __typename: "Event", id: "1", when: "2022-08-01T00:00:00.000Z" },
    };
    const out = reviveScalarsInCache(extracted, { schema: localSchema, typesMap: {} });
    expect(out["Event:1"].when).toBeInstanceOf(Date);
  });

  it("lets typesMap override the schema scalar's parseValue", () => {
    const localSchema = buildSchema(`
      scalar Timestamp
      type Event { id: ID! when: Timestamp }
      type Query { event(id: ID!): Event }
    `);
    const timestamp = localSchema.getType("Timestamp") as GraphQLScalarType;
    timestamp.parseValue = () => "from-schema";

    const extracted = {
      "Event:1": { __typename: "Event", id: "1", when: "2022-08-01T00:00:00.000Z" },
    };
    const out = reviveScalarsInCache(extracted, {
      schema: localSchema,
      typesMap: { Timestamp: { serialize: (v) => v, parseValue: () => "from-typesMap" } },
    });
    expect(out["Event:1"].when).toBe("from-typesMap");
  });

  it("wraps nullable field values through nullFunctions.parseValue but leaves non-null alone", () => {
    // Mirrors `parser.ts` behavior: `nullFunctions.parseValue` only runs on
    // nullable fields (see `parser.ts:77-80`). A caller using a Maybe monad
    // on the network path via `withScalars` can repeat the same
    // `nullFunctions` here and get the same shape after rehydration.
    const localSchema = buildSchema(`
      scalar DateTime
      type Post { id: ID! nullableWhen: DateTime requiredWhen: DateTime! }
      type Query { post(id: ID!): Post }
    `);
    const tsMap = {
      DateTime: {
        serialize: (v: unknown) => (v instanceof Date ? v.toISOString() : v),
        parseValue: (v: unknown) => (typeof v === "string" ? new Date(v) : v),
      },
    };
    const nullFunctions = {
      serialize: (v: unknown) => v,
      parseValue: (raw: unknown) =>
        raw === null || raw === undefined ? { kind: "None" as const } : { kind: "Some" as const, value: raw },
    };

    const extracted = {
      "Post:1": {
        __typename: "Post",
        id: "1",
        nullableWhen: "2021-01-01T00:00:00.000Z",
        requiredWhen: "2022-01-01T00:00:00.000Z",
      },
      "Post:2": {
        __typename: "Post",
        id: "2",
        nullableWhen: null,
        requiredWhen: "2022-01-01T00:00:00.000Z",
      },
    };

    const out = reviveScalarsInCache(extracted, { schema: localSchema, typesMap: tsMap, nullFunctions });

    // Nullable field with a value: scalar parsed first, then wrapped.
    expect(out["Post:1"].nullableWhen).toEqual({
      kind: "Some",
      value: expect.any(Date),
    });
    // Non-null field: no wrap.
    expect(out["Post:1"].requiredWhen).toBeInstanceOf(Date);
    // Nullable field with null: scalar skipped, null wrapped.
    expect(out["Post:2"].nullableWhen).toEqual({ kind: "None" });
  });

  it("is idempotent when parseValue returns the same shape", () => {
    const extracted = {
      "Post:1": {
        __typename: "Post",
        id: "1",
        title: "hello",
        createdAt: "2017-11-04T18:48:46.250Z",
      },
    };
    const once = reviveScalarsInCache(extracted, { schema, typesMap });
    // Second pass should be a no-op (parseValue keeps Date instances as-is).
    const twice = reviveScalarsInCache(once, { schema, typesMap });
    expect(twice["Post:1"].createdAt).toBeInstanceOf(Date);
    expect((twice["Post:1"].createdAt as unknown as Date).toISOString()).toBe("2017-11-04T18:48:46.250Z");
  });
});
