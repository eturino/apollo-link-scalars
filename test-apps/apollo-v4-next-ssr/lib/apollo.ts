import { ApolloClient, ApolloLink, type NormalizedCacheObject, InMemoryCache, gql } from "@apollo/client";
import type { TypedDocumentNode } from "@apollo/client";
import { SchemaLink } from "@apollo/client/link/schema";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { reviveScalarsInCache, withScalars } from "apollo-link-scalars";

const rawCreatedAt = "2024-01-02T03:04:05.000Z";

const typeDefs = gql`
  scalar DateTime

  type Character {
    id: ID
    name: String
    created: DateTime
  }

  type Query {
    character(id: ID!): Character
  }
`;

const schema = makeExecutableSchema({
  typeDefs,
  resolvers: {
    Query: {
      character: (_root: unknown, { id }: { id: string }) => ({
        id,
        name: "Rick Sanchez",
        created: new Date(rawCreatedAt),
      }),
    },
  },
});

const typesMap = {
  DateTime: {
    serialize: (value: unknown) => (value instanceof Date ? value.toISOString() : value),
    parseValue: (value: unknown) => (typeof value === "string" ? new Date(value) : value),
  },
};

interface GetCharacterData {
  character: {
    id: string;
    name: string;
    created: Date | string;
  };
}

interface GetCharacterVars {
  id: string;
}

export const GET_CHARACTER: TypedDocumentNode<GetCharacterData, GetCharacterVars> = gql`
  query GetCharacter($id: ID!) {
    character(id: $id) {
      id
      name
      created
    }
  }
`;

export const networkCounter = { count: 0 };

function cloneState<T>(value: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value)) as T;
}

export function createApolloClient({
  initialState,
  applyFix = false,
}: {
  initialState?: NormalizedCacheObject;
  applyFix?: boolean;
} = {}): ApolloClient {
  const cache = new InMemoryCache();

  if (initialState) {
    const snapshot = cloneState(initialState);
    const restoredState = applyFix
      ? (reviveScalarsInCache(snapshot as unknown as Record<string, unknown>, {
          schema,
          typesMap,
        }) as unknown as NormalizedCacheObject)
      : snapshot;
    cache.restore(
      restoredState,
    );
  }

  const trackingLink = new ApolloLink((operation, forward) => {
    networkCounter.count += 1;
    return forward(operation);
  });

  return new ApolloClient({
    ssrMode: typeof window === "undefined",
    cache,
    link: ApolloLink.from([withScalars({ schema, typesMap }), trackingLink, new SchemaLink({ schema })]),
  });
}

export async function seedApolloState(): Promise<NormalizedCacheObject> {
  const client = createApolloClient();
  await client.query({
    query: GET_CHARACTER,
    variables: { id: "1" },
  });
  return client.extract() as NormalizedCacheObject;
}
