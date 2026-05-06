import { ApolloClient, ApolloLink, HttpLink, InMemoryCache, gql } from "@apollo/client";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { withScalars } from "apollo-link-scalars";

const typeDefs = gql`
  scalar BigInt

  type Item {
    id: ID!
    label: String!
    amount: BigInt!
  }

  type Query {
    items(amount: BigInt): [Item!]!
  }

  type Mutation {
    recordItem(amount: BigInt!): Item!
  }
`;

const schema = makeExecutableSchema({ typeDefs });

const typesMap = {
  BigInt: {
    serialize: (v: unknown) => (typeof v === "bigint" ? v.toString() : v),
    parseValue: (v: unknown) => (typeof v === "string" ? BigInt(v) : v),
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
  link: ApolloLink.from([
    withScalars({ schema, typesMap, ensureSerializableVariables: true }),
    httpLink,
  ]),
});
