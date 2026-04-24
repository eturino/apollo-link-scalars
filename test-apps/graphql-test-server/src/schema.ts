// GraphQL schema mirroring the rickandmortyapi.com surface that existing
// tests depend on (Character / Location / Episode + their queries) plus
// mutations and a subscription we add on top so the library's mutation
// and subscription paths can be exercised against a real server.
//
// Pagination follows R&M's shape: `{ info: { count, pages, next, prev },
// results: [...] }` and the `filter` input types keep a compatible
// surface.
//
// runId partitioning lives in context — every resolver reads from the
// StoreHandle attached to its GraphQL context.

import { makeExecutableSchema } from "@graphql-tools/schema";
import { GraphQLScalarType, Kind } from "graphql";
import type { CharacterRow, EpisodeRow, LocationRow, StoreHandle } from "./store.ts";

const DateTimeScalar = new GraphQLScalarType({
  name: "DateTime",
  serialize(value) {
    if (value instanceof Date) return value.toISOString();
    if (typeof value === "string") return value;
    throw new TypeError(`DateTime cannot represent value: ${String(value)}`);
  },
  parseValue(value) {
    if (typeof value === "string") return new Date(value);
    throw new TypeError(`DateTime cannot parse value: ${String(value)}`);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) return new Date(ast.value);
    throw new TypeError(`DateTime cannot parse literal: ${ast.kind}`);
  },
});

export interface ServerContext {
  handle: StoreHandle;
}

const typeDefs = /* GraphQL */ `
  scalar DateTime
  scalar Upload

  type Info {
    count: Int
    pages: Int
    next: Int
    prev: Int
  }

  type Character {
    id: ID
    name: String
    status: String
    species: String
    type: String
    gender: String
    origin: Location
    location: Location
    image: String
    episode: [Episode!]!
    created: DateTime
  }

  type Location {
    id: ID
    name: String
    type: String
    dimension: String
    residents: [Character!]!
    created: DateTime
  }

  type Episode {
    id: ID
    name: String
    air_date: String
    episode: String
    characters: [Character!]!
    created: DateTime
  }

  type Characters {
    info: Info
    results: [Character]
  }

  type Locations {
    info: Info
    results: [Location]
  }

  type Episodes {
    info: Info
    results: [Episode]
  }

  input FilterCharacter {
    name: String
    status: String
    species: String
    type: String
    gender: String
  }

  input FilterLocation {
    name: String
    type: String
    dimension: String
  }

  input FilterEpisode {
    name: String
    episode: String
  }

  type Query {
    character(id: ID!): Character
    characters(page: Int, filter: FilterCharacter): Characters
    charactersByIds(ids: [ID!]!): [Character]
    location(id: ID!): Location
    locations(page: Int, filter: FilterLocation): Locations
    locationsByIds(ids: [ID!]!): [Location]
    episode(id: ID!): Episode
    episodes(page: Int, filter: FilterEpisode): Episodes
    episodesByIds(ids: [ID!]!): [Episode]
  }

  input CreateCharacterInput {
    name: String!
    status: String
    species: String
    gender: String
    originId: ID
    locationId: ID
    episodeIds: [ID!]
    created: DateTime
  }

  input UpdateCharacterInput {
    name: String
    status: String
    species: String
    gender: String
    originId: ID
    locationId: ID
    episodeIds: [ID!]
    created: DateTime
  }

  type Mutation {
    createCharacter(input: CreateCharacterInput!): Character!
    updateCharacter(id: ID!, input: UpdateCharacterInput!): Character
    deleteCharacter(id: ID!): Boolean!
  }

  type Subscription {
    characterCreated: Character!
    characterUpdated: Character!
  }
`;

const PAGE_SIZE = 20;

function paginate<T>(items: T[], page: number) {
  const safePage = Math.max(1, page);
  const start = (safePage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const slice = items.slice(start, end);
  const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  return {
    info: {
      count: items.length,
      pages,
      next: safePage < pages ? safePage + 1 : null,
      prev: safePage > 1 ? safePage - 1 : null,
    },
    results: slice,
  };
}

function matchCharacter(row: CharacterRow, filter?: Record<string, string | null | undefined>): boolean {
  if (!filter) return true;
  for (const key of Object.keys(filter) as (keyof CharacterRow)[]) {
    const needle = filter[key as string];
    if (!needle) continue;
    const hay = String(row[key] ?? "").toLowerCase();
    if (!hay.includes(needle.toLowerCase())) return false;
  }
  return true;
}

function matchLocation(row: LocationRow, filter?: Record<string, string | null | undefined>): boolean {
  if (!filter) return true;
  for (const key of Object.keys(filter) as (keyof LocationRow)[]) {
    const needle = filter[key as string];
    if (!needle) continue;
    const hay = String(row[key] ?? "").toLowerCase();
    if (!hay.includes(needle.toLowerCase())) return false;
  }
  return true;
}

function matchEpisode(row: EpisodeRow, filter?: Record<string, string | null | undefined>): boolean {
  if (!filter) return true;
  for (const key of Object.keys(filter) as (keyof EpisodeRow)[]) {
    const needle = filter[key as string];
    if (!needle) continue;
    const hay = String(row[key] ?? "").toLowerCase();
    if (!hay.includes(needle.toLowerCase())) return false;
  }
  return true;
}

function assertWritable(handle: StoreHandle): void {
  if (handle.readonly) {
    throw new Error(
      "Mutations require an X-Run-Id header so state can be partitioned; " +
        "the shared read-only store does not accept writes."
    );
  }
}

function allocateId(handle: StoreHandle, kind: keyof StoreHandle["store"]["nextIds"]): string {
  const id = String(handle.store.nextIds[kind]);
  handle.store.nextIds[kind] += 1;
  return id;
}

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers: {
    DateTime: DateTimeScalar,

    Query: {
      character: (_root, { id }: { id: string }, { handle }) =>
        handle.store.characters.get(id) ?? null,
      characters: (_root, args: { page?: number; filter?: Record<string, string> }, { handle }) => {
        const rows = [...handle.store.characters.values()].filter((c) =>
          matchCharacter(c, args.filter)
        );
        return paginate(rows, args.page ?? 1);
      },
      charactersByIds: (_root, { ids }: { ids: string[] }, { handle }) =>
        ids.map((id) => handle.store.characters.get(id) ?? null),
      location: (_root, { id }: { id: string }, { handle }) =>
        handle.store.locations.get(id) ?? null,
      locations: (_root, args: { page?: number; filter?: Record<string, string> }, { handle }) => {
        const rows = [...handle.store.locations.values()].filter((l) =>
          matchLocation(l, args.filter)
        );
        return paginate(rows, args.page ?? 1);
      },
      locationsByIds: (_root, { ids }: { ids: string[] }, { handle }) =>
        ids.map((id) => handle.store.locations.get(id) ?? null),
      episode: (_root, { id }: { id: string }, { handle }) =>
        handle.store.episodes.get(id) ?? null,
      episodes: (_root, args: { page?: number; filter?: Record<string, string> }, { handle }) => {
        const rows = [...handle.store.episodes.values()].filter((e) =>
          matchEpisode(e, args.filter)
        );
        return paginate(rows, args.page ?? 1);
      },
      episodesByIds: (_root, { ids }: { ids: string[] }, { handle }) =>
        ids.map((id) => handle.store.episodes.get(id) ?? null),
    },

    Character: {
      origin: (row: CharacterRow, _args, { handle }) =>
        row.originId ? handle.store.locations.get(row.originId) ?? null : null,
      location: (row: CharacterRow, _args, { handle }) =>
        row.locationId ? handle.store.locations.get(row.locationId) ?? null : null,
      episode: (row: CharacterRow, _args, { handle }) =>
        row.episodeIds
          .map((id) => handle.store.episodes.get(id))
          .filter((e): e is EpisodeRow => Boolean(e)),
    },

    Location: {
      residents: (row: LocationRow, _args, { handle }) =>
        row.residentIds
          .map((id) => handle.store.characters.get(id))
          .filter((c): c is CharacterRow => Boolean(c)),
    },

    Episode: {
      characters: (row: EpisodeRow, _args, { handle }) =>
        row.characterIds
          .map((id) => handle.store.characters.get(id))
          .filter((c): c is CharacterRow => Boolean(c)),
    },

    Mutation: {
      createCharacter: (_root, { input }: { input: Record<string, unknown> }, { handle }) => {
        assertWritable(handle);
        const id = allocateId(handle, "character");
        const row: CharacterRow = {
          id,
          name: String(input.name ?? ""),
          status: String(input.status ?? "unknown"),
          species: String(input.species ?? "unknown"),
          type: "",
          gender: String(input.gender ?? "unknown"),
          image: "",
          created: (input.created as string | undefined) ?? new Date().toISOString(),
          originId: (input.originId as string | null | undefined) ?? null,
          locationId: (input.locationId as string | null | undefined) ?? null,
          episodeIds: [...((input.episodeIds as string[] | undefined) ?? [])],
        };
        handle.store.characters.set(id, row);
        handle.events.emit("character:created", row);
        return row;
      },

      updateCharacter: (
        _root,
        { id, input }: { id: string; input: Record<string, unknown> },
        { handle }
      ) => {
        assertWritable(handle);
        const existing = handle.store.characters.get(id);
        if (!existing) return null;
        const next: CharacterRow = {
          ...existing,
          ...(input.name !== undefined ? { name: String(input.name) } : {}),
          ...(input.status !== undefined ? { status: String(input.status) } : {}),
          ...(input.species !== undefined ? { species: String(input.species) } : {}),
          ...(input.gender !== undefined ? { gender: String(input.gender) } : {}),
          ...(input.originId !== undefined
            ? { originId: input.originId as string | null }
            : {}),
          ...(input.locationId !== undefined
            ? { locationId: input.locationId as string | null }
            : {}),
          ...(input.episodeIds !== undefined
            ? { episodeIds: [...((input.episodeIds as string[]) ?? [])] }
            : {}),
          ...(input.created !== undefined ? { created: String(input.created) } : {}),
        };
        handle.store.characters.set(id, next);
        handle.events.emit("character:updated", next);
        return next;
      },

      deleteCharacter: (_root, { id }: { id: string }, { handle }) => {
        assertWritable(handle);
        return handle.store.characters.delete(id);
      },
    },

    Subscription: {
      characterCreated: {
        subscribe: async function* (_root, _args, { handle }: ServerContext) {
          yield* pushStream<CharacterRow>(handle.events, "character:created");
        },
        resolve: (payload: CharacterRow) => payload,
      },
      characterUpdated: {
        subscribe: async function* (_root, _args, { handle }: ServerContext) {
          yield* pushStream<CharacterRow>(handle.events, "character:updated");
        },
        resolve: (payload: CharacterRow) => payload,
      },
    },
  },
});

async function* pushStream<T>(
  emitter: import("node:events").EventEmitter,
  event: string
): AsyncGenerator<T> {
  const queue: T[] = [];
  let pendingResolve: ((value: T) => void) | null = null;

  const listener = (payload: T): void => {
    if (pendingResolve) {
      const resolve = pendingResolve;
      pendingResolve = null;
      resolve(payload);
    } else {
      queue.push(payload);
    }
  };
  emitter.on(event, listener);

  try {
    while (true) {
      if (queue.length > 0) {
        yield queue.shift()!;
        continue;
      }
      const next = await new Promise<T>((resolve) => {
        pendingResolve = resolve;
      });
      yield next;
    }
  } finally {
    emitter.off(event, listener);
  }
}
