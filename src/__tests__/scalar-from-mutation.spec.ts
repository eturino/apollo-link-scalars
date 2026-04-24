import { ApolloLink, type DocumentNode, gql, type GraphQLRequest } from "@apollo/client/core";
import { execute, firstValue, observableOf } from "./helpers/test-utils";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { GraphQLScalarType, Kind } from "graphql";
import { withScalars } from "..";

describe("scalar returned from mutations", () => {
  const rawPublishedAt = "2024-01-02T03:04:05.000Z";
  const parsedPublishedAt = new Date(rawPublishedAt);

  const schema = makeExecutableSchema({
    typeDefs: gql`
      type Query {
        _empty: Boolean
      }

      type Mutation {
        publishAt: DateTime!
      }

      scalar DateTime
    `,
    resolvers: {
      DateTime: new GraphQLScalarType<Date | null, string | null>({
        name: "DateTime",
        serialize: (parsed) => (parsed instanceof Date ? parsed.toISOString() : null),
        parseValue: (raw) => (typeof raw === "string" ? new Date(raw) : raw instanceof Date ? raw : null),
        parseLiteral(ast) {
          return ast.kind === Kind.STRING ? new Date(ast.value) : null;
        },
      }),
    },
  });

  const mutationDocument: DocumentNode = gql`
    mutation PublishDateTime {
      publishAt
      aliased: publishAt
    }
  `;

  const request: GraphQLRequest = {
    query: mutationDocument,
    variables: {},
  };

  it("parses scalar fields on mutation results", async () => {
    const response = {
      data: {
        publishAt: rawPublishedAt,
        aliased: rawPublishedAt,
      },
    };

    const link = ApolloLink.from([
      withScalars({ schema }),
      new ApolloLink(() => {
        return observableOf(response);
      }),
    ]);

    await expect(firstValue(execute(link, request))).resolves.toEqual({
      data: {
        publishAt: parsedPublishedAt,
        aliased: parsedPublishedAt,
      },
    });
  });
});
