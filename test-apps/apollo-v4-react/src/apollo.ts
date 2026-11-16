import { ApolloClient, ApolloLink, HttpLink, InMemoryCache, gql } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { withScalars } from "apollo-link-scalars";
import { OperationTypeNode } from "graphql";
import { createClient } from "graphql-ws";

const typeDefs = gql`
  scalar DateTime

  type Character {
    id: ID
    name: String
    created: DateTime
  }

  input CreateCharacterInput {
    name: String!
    created: DateTime
  }

  type Query {
    character(id: ID!): Character
  }

  type Mutation {
    createCharacter(input: CreateCharacterInput!): Character!
  }

  type Subscription {
    characterCreated: Character!
  }
`;

const schema = makeExecutableSchema({ typeDefs });

const typesMap = {
  DateTime: {
    // Offset suffix instead of Date#toJSON's "Z", so the e2e can tell from the
    // request body alone that the link's serializer ran.
    serialize: (v: unknown) => (v instanceof Date ? v.toISOString().replace("Z", "+00:00") : v),
    parseValue: (v: unknown) => (typeof v === "string" ? new Date(v) : v),
  },
};

// The test server rejects writes without a run id and scopes subscriptions to it.
const runId = crypto.randomUUID();

const httpLink = new HttpLink({ uri: "http://localhost:5178/graphql", headers: { "x-run-id": runId } });

const wsLink = new GraphQLWsLink(createClient({ url: "ws://localhost:5178/graphql", connectionParams: { runId } }));

export const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: ApolloLink.from([
    withScalars({ schema, typesMap }),
    ApolloLink.split(({ operationType }) => operationType === OperationTypeNode.SUBSCRIPTION, wsLink, httpLink),
  ]),
});
