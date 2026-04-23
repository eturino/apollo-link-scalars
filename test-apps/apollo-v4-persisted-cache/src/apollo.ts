import { ApolloClient, ApolloLink, HttpLink, InMemoryCache, gql } from "@apollo/client";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { withScalars } from "apollo-link-scalars";
import { LocalStorageWrapper, persistCache } from "apollo3-cache-persist";

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

const schema = makeExecutableSchema({ typeDefs });

const typesMap = {
  DateTime: {
    serialize: (v: unknown) => (v instanceof Date ? v.toISOString() : v),
    parseValue: (v: unknown) => (typeof v === "string" ? new Date(v) : v),
  },
};

export const GET_CHARACTER = gql`
  query GetCharacter($id: ID!) {
    character(id: $id) {
      id
      name
      created
    }
  }
`;

// Module-level counter so the UI (and Playwright) can tell whether a query
// hit the network or was served entirely from cache.
export const networkCounter = { count: 0 };

const trackingLink = new ApolloLink((operation, forward) => {
  networkCounter.count += 1;
  return forward(operation);
});

const httpLink = new HttpLink({ uri: "https://rickandmortyapi.com/graphql" });

export async function bootstrap(): Promise<ApolloClient> {
  const cache = new InMemoryCache();
  await persistCache({
    cache,
    storage: new LocalStorageWrapper(window.localStorage),
    // debounce: 0 makes persistence writes synchronous w/ cache writes so
    // Playwright doesn't have to wait out the library's default debounce.
    debounce: 0,
  });
  return new ApolloClient({
    cache,
    link: ApolloLink.from([withScalars({ schema, typesMap }), trackingLink, httpLink]),
  });
}
