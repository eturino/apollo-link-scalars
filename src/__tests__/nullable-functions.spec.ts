import { ApolloLink, DocumentNode, execute, gql, GraphQLRequest, Observable } from "@apollo/client/core";
import { getOperationName } from "@apollo/client/utilities";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { withScalars } from "..";
import { isNone } from "../lib/is-none";
import { NullFunctions } from "../types/null-functions";

describe("nullable-functions", () => {
  const typeDefs = gql`
    type Query {
      exampleNullableArray: [String!]
      exampleNullableNestedArray: [String]
      nonNullObject: ExampleObject!
      nullObject: ExampleObject
    }

    type ExampleObject {
      nullField: String
      nonNullField: String!
    }

    type MyInput {
      nullField: String
    }
  `;

  const schema = makeExecutableSchema({ typeDefs });

  const queryDocument: DocumentNode = gql`
    query MyQuery($input: MyInput!) {
      exampleNullableArray
      exampleNullableNestedArray
      nonNullObject {
        nullField
        nonNullField
      }
      nullObject {
        nullField
        nonNullField
      }
    }
  `;
  const queryOperationName = getOperationName(queryDocument);
  if (!queryOperationName) throw new Error("invalid query operation name");

  const responseWithNulls = {
    data: {
      exampleNullableArray: null,
      exampleNullableNestedArray: [null],
      nonNullObject: {
        nullField: null,
        nonNullField: "a",
      },
      nullObject: null,
    },
  };

  const responseWithoutNulls = {
    data: {
      exampleNullableArray: ["a"],
      exampleNullableNestedArray: [null, "b"],
      nonNullObject: {
        nullField: "c",
        nonNullField: "d",
      },
      nullObject: {
        nullField: "e",
        nonNullField: "f",
      },
    },
  };

  describe("with default null functions", () => {
    const request: GraphQLRequest = {
      query: queryDocument,
      variables: { input: { nullField: "a" } },
      operationName: queryOperationName,
    };
    it("parses nulls correctly", (done) => {
      const link = ApolloLink.from([
        withScalars({ schema }),
        new ApolloLink(() => {
          return Observable.of(responseWithNulls);
        }),
      ]);

      const observable = execute(link, request);
      observable.subscribe((result) => {
        expect(result).toEqual(responseWithNulls);
        done();
      });
    });

    it("parses non-nulls correctly", (done) => {
      const link = ApolloLink.from([
        withScalars({ schema }),
        new ApolloLink(() => {
          return Observable.of(responseWithoutNulls);
        }),
      ]);

      const observable = execute(link, request);
      observable.subscribe((result) => {
        expect(result).toEqual(responseWithoutNulls);
        done();
      });
    });
  });

  describe("with custom null functions", () => {
    type Maybe<T> = {
      typename: "just" | "nothing";
      value?: T;
    };

    const request: GraphQLRequest = {
      query: queryDocument,
      variables: { input: { nullField: { typename: "just", value: "a" } } },
      operationName: queryOperationName,
    };

    const nullFunctions: NullFunctions = {
      parseValue(raw: any): Maybe<any> {
        if (isNone(raw)) {
          return {
            typename: "nothing",
          };
        } else {
          return {
            typename: "just",
            value: raw,
          };
        }
      },
      serialize(input: any) {
        if (input.typename === "just") {
          return input.value;
        } else {
          return null;
        }
      },
    };
    it("parses nulls correctly", (done) => {
      const link = ApolloLink.from([
        withScalars({ schema, nullFunctions }),
        new ApolloLink(() => {
          return Observable.of(responseWithNulls);
        }),
      ]);

      const observable = execute(link, request);
      observable.subscribe((result) => {
        expect(result).toEqual({
          data: {
            exampleNullableArray: { typename: "nothing" },
            exampleNullableNestedArray: { typename: "just", value: [{ typename: "nothing" }] },
            nonNullObject: {
              nullField: { typename: "nothing" },
              nonNullField: "a",
            },
            nullObject: { typename: "nothing" },
          },
        });
        done();
      });
    });

    it("parses non-nulls correctly", (done) => {
      const link = ApolloLink.from([
        withScalars({ schema, nullFunctions }),
        new ApolloLink(() => {
          return Observable.of(responseWithoutNulls);
        }),
      ]);

      const observable = execute(link, request);
      observable.subscribe((result) => {
        expect(result).toEqual({
          data: {
            exampleNullableArray: { typename: "just", value: ["a"] },
            exampleNullableNestedArray: {
              typename: "just",
              value: [{ typename: "nothing" }, { typename: "just", value: "b" }],
            },
            nonNullObject: {
              nullField: { typename: "just", value: "c" },
              nonNullField: "d",
            },
            nullObject: {
              typename: "just",
              value: {
                nullField: { typename: "just", value: "e" },
                nonNullField: "f",
              },
            },
          },
        });
        done();
      });
    });
  });
});
