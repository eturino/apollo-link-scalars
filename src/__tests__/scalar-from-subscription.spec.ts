import { ApolloLink, type DocumentNode, gql, type GraphQLRequest, Observable } from "@apollo/client/core";
import type { FetchResult } from "@apollo/client/core";
import { execute } from "./helpers/test-utils";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { GraphQLScalarType, Kind } from "graphql";
import { withScalars } from "..";

describe("scalar returned from subscriptions", () => {
  const schema = makeExecutableSchema({
    typeDefs: gql`
      type Query {
        _empty: Boolean
      }

      type Subscription {
        tickAt: DateTime!
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

  const subscriptionDocument: DocumentNode = gql`
    subscription DateTimeTicks {
      tickAt
      aliased: tickAt
    }
  `;

  const request: GraphQLRequest = {
    query: subscriptionDocument,
    variables: {},
  };

  it("parses scalar fields on every subscription payload", async () => {
    const raws = ["2024-01-02T03:04:05.000Z", "2024-05-06T07:08:09.000Z"];
    const expected = raws.map((raw) => ({
      data: {
        tickAt: new Date(raw),
        aliased: new Date(raw),
      },
    }));

    const link = ApolloLink.from([
      withScalars({ schema }),
      new ApolloLink(() => {
        return new Observable<FetchResult>((observer) => {
          for (const raw of raws) {
            observer.next({
              data: {
                tickAt: raw,
                aliased: raw,
              },
            });
          }
          observer.complete();
        });
      }),
    ]);

    const values = await new Promise<FetchResult[]>((resolve, reject) => {
      const seen: FetchResult[] = [];
      execute(link, request).subscribe({
        next: (value) => seen.push(value),
        error: reject,
        complete: () => {
          resolve(seen);
        },
      });
    });

    expect(values).toEqual(expected);
  });
});
