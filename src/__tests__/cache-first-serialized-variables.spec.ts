import { ApolloClient, ApolloLink, InMemoryCache, gql, Observable } from "@apollo/client/core";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { withScalars } from "..";

describe("cache-first queries with custom serialized variables", () => {
  interface Event {
    id: string;
    at: Date;
  }

  interface EventsQueryData {
    events: Event[];
  }

  interface EventsQueryVariables {
    at: Date | null;
  }

  const query = gql`
    query Events($at: Date) {
      events(at: $at) {
        id
        at
      }
    }
  `;

  const schema = makeExecutableSchema({
    typeDefs: gql`
      scalar Date

      type Event {
        id: ID!
        at: Date
      }

      type Query {
        events(at: Date): [Event!]!
      }
    `,
  });

  const toIsoWithOffset = (value: Date) => value.toISOString().replace("Z", "+00:00");

  const typesMap = {
    Date: {
      serialize: (value: unknown) => (value instanceof Date ? toIsoWithOffset(value) : value),
      parseValue: (value: unknown) => (typeof value === "string" ? new Date(value) : value),
    },
  };

  it("reuses cached results when variables return to a previously fetched value", async () => {
    let networkCalls = 0;
    const seenVariables: unknown[] = [];

    const client = new ApolloClient({
      cache: new InMemoryCache(),
      link: ApolloLink.from([
        withScalars({ schema, typesMap }),
        new ApolloLink((operation) => {
          networkCalls += 1;
          seenVariables.push(operation.variables.at);

          return new Observable((observer) => {
            observer.next({
              data: {
                events: [
                  {
                    id: `hit-${networkCalls}`,
                    at: "2023-08-19T00:00:00.000Z",
                  },
                ],
              },
            });
            observer.complete();
          });
        }),
      ]),
    });

    const firstAt = new Date("2023-08-19T00:00:00.000Z");
    const firstResult = await client.query<EventsQueryData, EventsQueryVariables>({
      query,
      variables: { at: firstAt },
      fetchPolicy: "cache-first",
    });

    const secondResult = await client.query<EventsQueryData, EventsQueryVariables>({
      query,
      variables: { at: null },
      fetchPolicy: "cache-first",
    });

    const thirdAt = new Date("2023-08-19T00:00:00.000Z");
    const thirdResult = await client.query<EventsQueryData, EventsQueryVariables>({
      query,
      variables: { at: thirdAt },
      fetchPolicy: "cache-first",
    });

    expect(networkCalls).toBe(2);
    expect(seenVariables).toEqual([toIsoWithOffset(firstAt), null]);
    expect(firstAt).toBeInstanceOf(Date);
    expect(thirdAt).toBeInstanceOf(Date);
    // `data?.` is required under v4 (FetchResult.data is nullable) but flagged
    // as unnecessary by the v3 matrix row.

    expect(firstResult.data?.events[0]?.id).toBe("hit-1");
    expect(secondResult.data?.events[0]?.id).toBe("hit-2");
    expect(thirdResult.data?.events[0]?.id).toBe("hit-1");
    expect(thirdResult.data?.events[0]?.at).toBeInstanceOf(Date);
  });
});
