import { ApolloClient, ApolloLink, HttpLink, InMemoryCache, gql } from "@apollo/client";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { withScalars } from "apollo-link-scalars";

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

const httpLink = new HttpLink({ uri: "http://localhost:5178/graphql" });

export const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: ApolloLink.from([withScalars({ schema, typesMap }), httpLink]),
});
