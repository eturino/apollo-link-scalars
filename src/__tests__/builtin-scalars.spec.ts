import { ApolloLink, type DocumentNode, gql, type GraphQLRequest } from "@apollo/client/core";
import { execute, firstValue, observableOf } from "./helpers/test-utils";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { withScalars } from "..";

describe("builtin scalars behave like usual", () => {
  const typeDefs = gql`
    type Query {
      day: String
    }
  `;

  const schema = makeExecutableSchema({ typeDefs });

  const queryDocument: DocumentNode = gql`
    query MyQuery {
      day
    }
  `;

  const request: GraphQLRequest = {
    query: queryDocument,
    variables: {},
  };

  const response = {
    data: {
      day: null,
    },
  };

  it("parses null values for nullable leaf types", async () => {
    const link = ApolloLink.from([
      withScalars({ schema }),
      new ApolloLink(() => {
        return observableOf(response);
      }),
    ]);

    const result = await firstValue(execute(link, request));
    expect(result).toEqual({ data: { day: null } });
  });
});
