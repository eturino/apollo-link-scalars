import { ApolloLink, DocumentNode, execute, gql, GraphQLRequest, Observable } from "@apollo/client/core";
import { getOperationName } from "@apollo/client/utilities";
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
  const queryOperationName = getOperationName(queryDocument);
  if (!queryOperationName) throw new Error("invalid query operation name");

  const request: GraphQLRequest = {
    query: queryDocument,
    variables: {},
    operationName: queryOperationName,
  };

  const response = {
    data: {
      day: null,
    },
  };

  it("parses null values for nullable leaf types", (done) => {
    const link = ApolloLink.from([
      withScalars({ schema }),
      new ApolloLink(() => {
        return Observable.of(response);
      }),
    ]);

    const observable = execute(link, request);
    observable.subscribe((result) => {
      expect(result).toEqual({ data: { day: null } });
      done();
    });
  });
});
