import { ApolloLink, type DocumentNode, gql, type GraphQLRequest } from "@apollo/client/core";
import { execute, firstValue, observableOf } from "./helpers/test-utils";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { graphql, GraphQLError } from "graphql";
import { withScalars } from "..";

describe("enum returned directly from first level queries", () => {
  const typeDefs = gql`
    type Query {
      first: MyEnum
      second: MyEnum!
      third: MyEnum
    }

    enum MyEnum {
      a
      b
      c
    }
  `;

  const resolvers = {
    Query: {
      first: () => "a",
      second: () => "b",
      third: () => null,
    },
  };

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  const querySource = `
  query MyQuery {
    first
    second
    third
    otherFirst: first
    otherSecond: second
    otherThird: third
  }
`;

  const queryDocument: DocumentNode = gql`
    ${querySource}
  `;

  const request: GraphQLRequest = {
    query: queryDocument,
    variables: {},
  };

  const validResponse = {
    data: {
      first: "a",
      second: "b",
      third: null,
      otherFirst: "a",
      otherSecond: "b",
      otherThird: null,
    },
  };

  const invalidResponse = {
    data: {
      first: "a",
      second: "b",
      third: null,
      otherFirst: "invalid",
      otherSecond: "b",
      otherThird: null,
    },
  };

  it("ensure the response fixture is valid (ensure that in the response we have the RAW, the Server is converting from Date to STRING)", async () => {
    expect.assertions(1);
    const queryResponse = await graphql({ schema, source: querySource });
    expect(queryResponse).toEqual(validResponse);
  });

  describe("with valid enum values", () => {
    it("validateEnums false (or missing) => return response", async () => {
      const link = ApolloLink.from([
        withScalars({ schema, validateEnums: false }),
        new ApolloLink(() => {
          return observableOf(validResponse);
        }),
      ]);

      const value = await firstValue(execute(link, request));
      expect(value).toEqual(validResponse);
    });

    it("validateEnums false (or missing) => return response", async () => {
      const link = ApolloLink.from([
        withScalars({ schema, validateEnums: true }),
        new ApolloLink(() => {
          return observableOf(validResponse);
        }),
      ]);

      const value = await firstValue(execute(link, request));
      expect(value).toEqual(validResponse);
    });
  });

  describe("with invalid enum values", () => {
    it("validateEnums false (or missing) => return invalid response", async () => {
      const link = ApolloLink.from([
        withScalars({ schema, validateEnums: false }),
        new ApolloLink(() => {
          return observableOf(invalidResponse);
        }),
      ]);

      const value = await firstValue(execute(link, request));
      expect(value).toEqual(invalidResponse);
    });

    it("validateEnums true => return error", async () => {
      const link = ApolloLink.from([
        withScalars({ schema, validateEnums: true }),
        new ApolloLink(() => {
          return observableOf(invalidResponse);
        }),
      ]);

      const value = await firstValue(execute(link, request));
      expect(value).toEqual({
        errors: [new GraphQLError(`enum "MyEnum" with invalid value`)],
      });
    });
  });
});
