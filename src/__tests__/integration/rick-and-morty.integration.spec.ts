import { ApolloLink, HttpLink, gql } from "@apollo/client/core";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { withScalars } from "../..";
import { execute } from "../helpers/test-utils";

// The local graphql-test-server (test-apps/graphql-test-server) mirrors the
// rickandmortyapi.com schema for the surface we exercise here. Booting is
// handled by the vitest globalSetup that sits alongside this spec.

const runSuite = process.env.RUN_INTEGRATION ? describe : describe.skip;

const TEST_SERVER_URL = process.env.TEST_SERVER_URL ?? "http://127.0.0.1:5178/graphql";

runSuite("integration: local graphql-test-server with DateTime custom scalar", () => {
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

  const httpLink = new HttpLink({ uri: TEST_SERVER_URL });
  const link = ApolloLink.from([withScalars({ schema, typesMap }), httpLink]);

  const query = gql`
    query GetCharacter($id: ID!) {
      character(id: $id) {
        id
        name
        created
      }
    }
  `;

  it("parses `created` as a Date instance", { timeout: 30_000 }, async () => {
    const result = await new Promise<{
      errors?: readonly unknown[];
      data?: Record<string, unknown> | null;
    }>((resolve, reject) => {
      execute(link, { query, variables: { id: "1" } }).subscribe({
        next: (value) => {
          resolve(value);
        },
        error: reject,
      });
    });

    expect(result.errors).toBeUndefined();
    const character = (result.data as { character: { id: string; name: string; created: Date } }).character;
    expect(character.id).toBe("1");
    expect(character.name).toBe("Rick Sanchez");
    expect(character.created).toBeInstanceOf(Date);
    expect(Number.isFinite(character.created.getTime())).toBe(true);
  });
});
