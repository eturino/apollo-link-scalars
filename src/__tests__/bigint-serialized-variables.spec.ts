import { ApolloClient, ApolloLink, InMemoryCache, gql, Observable } from "@apollo/client/core";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { withScalars } from "..";

describe("cache-first queries with BigInt-typed variables (ensureSerializableVariables)", () => {
  interface Item {
    id: string;
    amount: bigint;
  }

  interface ItemsQueryData {
    items: Item[];
  }

  interface ItemsQueryVariables {
    amount: bigint | null;
  }

  const query = gql`
    query Items($amount: BigInt) {
      items(amount: $amount) {
        id
        amount
      }
    }
  `;

  const schema = makeExecutableSchema({
    typeDefs: gql`
      scalar BigInt

      type Item {
        id: ID!
        amount: BigInt
      }

      type Query {
        items(amount: BigInt): [Item!]!
      }
    `,
  });

  const typesMap = {
    BigInt: {
      serialize: (value: unknown) => (typeof value === "bigint" ? value.toString() : value),
      parseValue: (value: unknown) => (typeof value === "string" ? BigInt(value) : value),
    },
  };

  const buildClient = (ensureSerializableVariables: boolean) => {
    let networkCalls = 0;
    const seenVariables: unknown[] = [];

    const client = new ApolloClient({
      cache: new InMemoryCache(),
      link: ApolloLink.from([
        withScalars({ schema, typesMap, ensureSerializableVariables }),
        new ApolloLink((operation) => {
          networkCalls += 1;
          seenVariables.push(operation.variables.amount);

          return new Observable((observer) => {
            observer.next({
              data: {
                items: [
                  {
                    id: `hit-${networkCalls}`,
                    amount: typeof operation.variables.amount === "string" ? operation.variables.amount : "0",
                  },
                ],
              },
            });
            observer.complete();
          });
        }),
      ]),
    });

    return {
      client,
      getCalls: () => networkCalls,
      getSeen: () => seenVariables,
    };
  };

  it("flag on: reuses cached results when a BigInt variable returns to a previously fetched value", async () => {
    const { client, getCalls, getSeen } = buildClient(true);

    const firstAmount = BigInt("12345678901234567890");
    const firstResult = await client.query<ItemsQueryData, ItemsQueryVariables>({
      query,
      variables: { amount: firstAmount },
      fetchPolicy: "cache-first",
    });

    const secondResult = await client.query<ItemsQueryData, ItemsQueryVariables>({
      query,
      variables: { amount: null },
      fetchPolicy: "cache-first",
    });

    const thirdAmount = BigInt("12345678901234567890");
    const thirdResult = await client.query<ItemsQueryData, ItemsQueryVariables>({
      query,
      variables: { amount: thirdAmount },
      fetchPolicy: "cache-first",
    });

    expect(getCalls()).toBe(2);
    expect(getSeen()).toEqual(["12345678901234567890", null]);
    expect(firstResult.data?.items[0]?.id).toBe("hit-1");
    expect(secondResult.data?.items[0]?.id).toBe("hit-2");
    expect(thirdResult.data?.items[0]?.id).toBe("hit-1");
    expect(thirdResult.data?.items[0]?.amount).toBe(BigInt("12345678901234567890"));
  });

  it("flag on: nested BigInt inside an input-object variable is serialized so Apollo can stringify the original", async () => {
    const nestedSchema = makeExecutableSchema({
      typeDefs: gql`
        scalar BigInt

        input ItemFilter {
          minAmount: BigInt
        }

        type Item {
          id: ID!
          amount: BigInt
        }

        type Query {
          items(filter: ItemFilter): [Item!]!
        }
      `,
    });

    const nestedQuery = gql`
      query Items($filter: ItemFilter) {
        items(filter: $filter) {
          id
          amount
        }
      }
    `;

    let networkCalls = 0;
    const seenVariables: unknown[] = [];

    const client = new ApolloClient({
      cache: new InMemoryCache(),
      link: ApolloLink.from([
        withScalars({ schema: nestedSchema, typesMap, ensureSerializableVariables: true }),
        new ApolloLink((operation) => {
          networkCalls += 1;
          seenVariables.push(operation.variables.filter);

          return new Observable((observer) => {
            observer.next({
              data: {
                items: [{ id: `hit-${networkCalls}`, amount: "1" }],
              },
            });
            observer.complete();
          });
        }),
      ]),
    });

    interface NestedItemsData {
      items: { id: string; amount: string }[];
    }

    const firstResult = await client.query<NestedItemsData>({
      query: nestedQuery,
      variables: { filter: { minAmount: BigInt(999) } },
      fetchPolicy: "cache-first",
    });

    const secondResult = await client.query<NestedItemsData>({
      query: nestedQuery,
      variables: { filter: { minAmount: BigInt(999) } },
      fetchPolicy: "cache-first",
    });

    expect(networkCalls).toBe(1);
    expect(seenVariables).toEqual([{ minAmount: "999" }]);
    expect(firstResult.data?.items[0]?.id).toBe("hit-1");
    expect(secondResult.data?.items[0]?.id).toBe("hit-1");
  });

  it("flag on: leaves Date variables intact so the #1041 cache-identity guarantee still holds", async () => {
    const dateSchema = makeExecutableSchema({
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

    const dateQuery = gql`
      query Events($at: Date) {
        events(at: $at) {
          id
          at
        }
      }
    `;

    const toIsoWithOffset = (value: Date) => value.toISOString().replace("Z", "+00:00");
    const dateTypesMap = {
      Date: {
        serialize: (value: unknown) => (value instanceof Date ? toIsoWithOffset(value) : value),
        parseValue: (value: unknown) => (typeof value === "string" ? new Date(value) : value),
      },
    };

    let networkCalls = 0;

    const client = new ApolloClient({
      cache: new InMemoryCache(),
      link: ApolloLink.from([
        withScalars({ schema: dateSchema, typesMap: dateTypesMap, ensureSerializableVariables: true }),
        new ApolloLink(() => {
          networkCalls += 1;
          return new Observable((observer) => {
            observer.next({
              data: {
                events: [{ id: `hit-${networkCalls}`, at: "2023-08-19T00:00:00.000Z" }],
              },
            });
            observer.complete();
          });
        }),
      ]),
    });

    interface EventsData {
      events: { id: string; at: Date }[];
    }

    const firstAt = new Date("2023-08-19T00:00:00.000Z");
    const callerVariables = { at: firstAt };
    await client.query<EventsData>({
      query: dateQuery,
      variables: callerVariables,
      fetchPolicy: "cache-first",
    });

    expect(callerVariables.at).toBe(firstAt);
    expect(callerVariables.at).toBeInstanceOf(Date);

    const thirdAt = new Date("2023-08-19T00:00:00.000Z");
    const thirdResult = await client.query<EventsData>({
      query: dateQuery,
      variables: { at: thirdAt },
      fetchPolicy: "cache-first",
    });

    expect(networkCalls).toBe(1);
    expect(thirdResult.data?.events[0]?.id).toBe("hit-1");
  });

  it("flag on: leaves the caller's BigInt untouched but installs a JSON shim on BigInt.prototype", async () => {
    const { client } = buildClient(true);

    const fortyTwo = BigInt(42);
    const callerVariables = { amount: fortyTwo };
    await client.query<ItemsQueryData, ItemsQueryVariables>({
      query,
      variables: callerVariables,
      fetchPolicy: "cache-first",
    });

    expect(typeof callerVariables.amount).toBe("bigint");
    expect(callerVariables.amount).toBe(fortyTwo);
    expect(JSON.stringify(callerVariables)).toBe('{"amount":"42"}');
  });
});
