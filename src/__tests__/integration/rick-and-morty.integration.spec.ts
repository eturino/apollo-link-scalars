import { ApolloLink, HttpLink, gql } from "@apollo/client/core";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { withScalars } from "../..";
import { execute } from "../helpers/test-utils";

const runSuite = process.env.RUN_INTEGRATION ? describe : describe.skip;

runSuite("integration: rickandmortyapi.com with DateTime custom scalar", () => {
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
