import { ApolloClient, ApolloLink, HttpLink, InMemoryCache, gql } from "@apollo/client";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { withScalars } from "apollo-link-scalars";

const typeDefs = gql`
  scalar DateTime

  type Event {
    id: ID!
    label: String!
    at: DateTime
  }

  type Query {
    events(at: DateTime): [Event!]!
  }
`;

const schema = makeExecutableSchema({ typeDefs });

const toIsoWithOffset = (value: Date) => value.toISOString().replace("Z", "+00:00");

const typesMap = {
  DateTime: {
    serialize: (v: unknown) => (v instanceof Date ? toIsoWithOffset(v) : v),
    parseValue: (v: unknown) => (typeof v === "string" ? new Date(v) : v),
  },
};

let networkHits = 0;

export function getNetworkHits() {
  return networkHits;
}

export function resetNetworkHits() {
  networkHits = 0;
}

const httpLink = new HttpLink({
  uri: "/graphql",
  fetch: async (input, init) => {
    networkHits += 1;
    return fetch(input, init);
  },
});

export const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: ApolloLink.from([withScalars({ schema, typesMap }), httpLink]),
});
