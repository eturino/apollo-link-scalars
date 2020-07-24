import { gql, ApolloLink, DocumentNode, execute, GraphQLRequest, Observable } from "@apollo/client";
import { getOperationName } from "@apollo/client/utilities";
import { graphql } from "graphql";
import { makeExecutableSchema } from "graphql-tools";
import { withScalars } from "..";

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
const queryOperationName = getOperationName(queryDocument);
if (!queryOperationName) throw new Error("invalid query operation name");

const request: GraphQLRequest = {
  query: queryDocument,
  variables: {},
  operationName: queryOperationName,
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

describe("enum returned directly from first level queries", () => {
  it("ensure the response fixture is valid (ensure that in the response we have the RAW, the Server is converting from Date to STRING)", async () => {
    expect.assertions(1);
    const queryResponse = await graphql(schema, querySource);
    expect(queryResponse).toEqual(validResponse);
  });

  describe("with valid enum values", () => {
    it("validateEnums false (or missing) => return response", (done) => {
      const link = ApolloLink.from([
        withScalars({ schema, validateEnums: false }),
        new ApolloLink(() => {
          return Observable.of(validResponse);
        }),
      ]);

      const observable = execute(link, request);
      observable.subscribe((value) => {
        expect(value).toEqual(validResponse);
        done();
      });
      expect.assertions(1);
    });

    it("validateEnums false (or missing) => return response", (done) => {
      const link = ApolloLink.from([
        withScalars({ schema, validateEnums: true }),
        new ApolloLink(() => {
          return Observable.of(validResponse);
        }),
      ]);

      const observable = execute(link, request);
      observable.subscribe((value) => {
        expect(value).toEqual(validResponse);
        done();
      });
      expect.assertions(1);
    });
  });

  describe("with invalid enum values", () => {
    it("validateEnums false (or missing) => return invalid response", (done) => {
      const link = ApolloLink.from([
        withScalars({ schema, validateEnums: false }),
        new ApolloLink(() => {
          return Observable.of(invalidResponse);
        }),
      ]);

      const observable = execute(link, request);
      observable.subscribe((value) => {
        expect(value).toEqual(invalidResponse);
        done();
      });
      expect.assertions(1);
    });

    it("validateEnums true => return error", (done) => {
      const link = ApolloLink.from([
        withScalars({ schema, validateEnums: true }),
        new ApolloLink(() => {
          return Observable.of(invalidResponse);
        }),
      ]);

      const observable = execute(link, request);
      observable.subscribe((value) => {
        expect(value).toEqual({
          errors: [
            {
              message: `enum "MyEnum" with invalid value`,
            },
          ],
        });
        done();
      });
      expect.assertions(1);
    });
  });
});
