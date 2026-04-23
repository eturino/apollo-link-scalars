import { ApolloClient, ApolloLink, HttpLink, InMemoryCache, gql } from "@apollo/client";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { withScalars } from "apollo-link-scalars";

// The library's shipped .d.ts references `@apollo/client/core` resolved
// against whichever apollo-client version is installed at the repo root
// (v4 at time of writing). In the v3 app this diverges from the locally
// installed v3 ApolloLink type even though runtime behavior is identical.
// CI's e2e matrix rebuilds the lib against each major to exercise the
// matching type surface; the cast keeps local dev (root = v4) building.
type V3ApolloLink = ApolloLink;

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

const httpLink = new HttpLink({ uri: "https://rickandmortyapi.com/graphql" });

export const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: ApolloLink.from([withScalars({ schema, typesMap }) as unknown as V3ApolloLink, httpLink]),
});
