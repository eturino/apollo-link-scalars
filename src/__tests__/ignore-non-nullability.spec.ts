import { gql, ApolloLink, DocumentNode, execute, GraphQLRequest, Observable } from "@apollo/client";
import { getOperationName } from "@apollo/client/utilities";
import { graphql } from "graphql";
import { makeExecutableSchema } from "graphql-tools";
import { withScalars } from "..";

const typeDefs = gql`
  type Query {
    item: Item!
  }

  type Item {
    title: String
    subItem: Item!
  }
`;

const resolvers = {
  Query: {
    item: () => ({}),
  },
};

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const querySource = `
  query MyQuery($skip: Boolean!) {
    item1: item @skip(if: $skip) {
		title
	}
    item2: item {
		title
		subItem @skip(if: $skip) {
			title
		}
	}
  }
`;

const queryDocument: DocumentNode = gql`
  ${querySource}
`;
const queryOperationName = getOperationName(queryDocument);
if (!queryOperationName) throw new Error("invalid query operation name");

const request: GraphQLRequest = {
  query: queryDocument,
  variables: { skip: true },
  operationName: queryOperationName,
};

const response = {
  data: {
    item2: {
      title: null,
    },
  },
};

describe("skip directive on non-nullable field", () => {
  it("ensure the response fixture is valid", async () => {
    expect.assertions(1);
    const queryResponse = await graphql(schema, querySource, {}, {}, { skip: true });
    expect(queryResponse).toEqual(response);
  });

  it("disregards field type non-nullability", (done) => {
    const link = ApolloLink.from([
      withScalars({ schema }),
      new ApolloLink(() => {
        return Observable.of(response);
      }),
    ]);
    const expectedResponse = {
      data: {
        item2: {
          title: null,
        },
      },
    };

    const observable = execute(link, request);
    observable.subscribe((value) => {
      expect(value).toEqual(expectedResponse);
      done();
    });
    expect.assertions(1);
  });
});
