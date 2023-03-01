import { ApolloLink, DocumentNode, execute, gql, GraphQLRequest, Observable } from "@apollo/client/core";
import { getOperationName } from "@apollo/client/utilities";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { graphql, GraphQLScalarType, Kind } from "graphql";
import isNumber from "lodash/isNumber";
import isString from "lodash/isString";
import { withScalars } from "..";

describe("scalar returned directly from first level queries", () => {
  const typeDefs = gql`
    type Query {
      listA: [IntA]
      listB: [IntB]
    }

    interface IntA {
      day: Date
    }

    interface IntB {
      morning: StartOfDay!
    }

    type TypeA implements IntA {
      day: Date
      extraA: Date
      nestedB: IntB
    }

    type TypeOtherA implements IntA {
      day: Date
      morning: StartOfDay!
      nestedList: [IntA]
    }

    type TypeB implements IntB {
      morning: StartOfDay!
      extraB: Date
      nestedA: IntA
    }

    type TypeOtherB implements IntB {
      morning: StartOfDay!
      stop: String!
    }

    "represents a Date with time"
    scalar Date

    "represents a Date at the beginning of the UTC day"
    scalar StartOfDay
  `;

  class CustomDate {
    public readonly internalDate: Date;
    constructor(x: string | number | Date) {
      this.internalDate = x instanceof Date ? x : new Date(x);
    }

    public toISOString(): string {
      return this.internalDate.toISOString();
    }

    public getNewDate(): Date {
      return new Date(this.internalDate);
    }
  }

  class MainDate {
    public readonly internalDate: Date;
    constructor(x: string | number | Date) {
      this.internalDate = x instanceof Date ? x : new Date(x);
    }

    public toISOString(): string {
      return this.internalDate.toISOString();
    }

    public getNewDate(): Date {
      return new Date(this.internalDate);
    }
  }

  function isSerializableDate(x: unknown): x is { toISOString: () => string } {
    return x instanceof Date || x instanceof CustomDate || x instanceof MainDate;
  }

  const rawDay = "2018-02-03T12:13:14.000Z";
  const rawDay2 = "2019-02-03T12:13:14.000Z";
  const rawMorning = "2018-02-03T00:00:00.000Z";
  const rawMorning2 = "2019-02-03T00:00:00.000Z";

  const parsedDay = new Date(rawDay);
  const parsedDay2 = new Date(rawDay2);
  const parsedMorning = new Date(rawMorning);
  const parsedMorning2 = new Date(rawMorning2);
  const parsedMorningCustom = new CustomDate(parsedMorning);
  const parsedMorningCustom2 = new CustomDate(parsedMorning2);

  const resolvers = {
    Query: {
      listA: () => [
        null,
        {
          __typename: "TypeA",
          day: parsedDay,
          extraA: parsedDay2,
          nestedB: {
            __typename: "TypeB",
            morning: parsedMorning,
            extraB: parsedDay2,
            nestedA: null,
          },
        },
        {
          __typename: "TypeOtherA",
          day: parsedDay2,
          morning: parsedMorning,
          nestedList: [
            null,
            {
              __typename: "TypeA",
              day: parsedDay2,
              extraA: parsedDay,
              nestedB: null,
            },
          ],
        },
      ],
      listB: () => [
        null,
        {
          __typename: "TypeOtherB",
          morning: parsedMorning2,
          stop: "STOP",
        },
        {
          __typename: "TypeB",
          morning: parsedMorning,
          extraB: parsedDay2,
          nestedA: {
            __typename: "TypeOtherA",
            day: parsedDay,
            morning: parsedMorning2,
            nestedList: [
              {
                __typename: "TypeOtherA",
                day: parsedDay2,
                morning: parsedMorning,
                nestedList: [],
              },
            ],
          },
        },
        null,
      ],
    },
    IntA: {
      __resolveType: (x: any) => (x.morning ? "TypeOtherA" : "TypeA"),
    },
    IntB: {
      __resolveType: (x: any) => (x.stop ? "TypeOtherB" : "TypeB"),
    },
    Date: new GraphQLScalarType<Date | null, string | null>({
      name: "Date",
      serialize: (parsed) => (isSerializableDate(parsed) ? parsed.toISOString() : null),
      parseValue: (raw) => {
        if (!raw) return null;
        if (raw instanceof Date) return raw;
        if (isString(raw) || isNumber(raw)) {
          return new Date(raw);
        }
        throw new Error(`'invalid value to parse (no date, no string, no number): ${raw}'`);
      },
      parseLiteral(ast) {
        if (ast.kind === Kind.STRING || ast.kind === Kind.INT) {
          return new Date(ast.value);
        }
        return null;
      },
    }),
    StartOfDay: new GraphQLScalarType<Date | null, string | null>({
      name: "StartOfDay",
      serialize: (parsed) => (isSerializableDate(parsed) ? parsed.toISOString() : null),
      parseValue: (raw) => {
        if (!raw) return null;
        if (raw instanceof Date) return raw;
        if (isString(raw) || isNumber(raw)) {
          const d = new Date(raw);
          d.setUTCHours(0);
          d.setUTCMinutes(0);
          d.setUTCSeconds(0);
          d.setUTCMilliseconds(0);
          return d;
        }
        throw new Error(`'invalid value to parse (no date, no string, no number): ${raw}'`);
      },
      parseLiteral(ast) {
        if (ast.kind === Kind.STRING || ast.kind === Kind.INT) {
          return new Date(ast.value);
        }
        return null;
      },
    }),
  };

  const typesMap = {
    StartOfDay: {
      serialize: (parsed: unknown): string | null => (isSerializableDate(parsed) ? parsed.toISOString() : null),
      parseValue: (raw: unknown): CustomDate | null => {
        if (!raw) return null;
        if (raw instanceof Date) return new CustomDate(raw);
        if (isString(raw) || isNumber(raw)) {
          const d = new Date(raw);
          d.setUTCHours(0);
          d.setUTCMinutes(0);
          d.setUTCSeconds(0);
          d.setUTCMilliseconds(0);
          return new CustomDate(d);
        }

        throw new Error(`'invalid value to parse (no date, no string, no number): ${raw}'`);
      },
    },
  };

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  const querySource = `
  query MyQuery {
    listA { ...IntA }
    listB { ...IntB }
  }

  fragment IntA on IntA {
    __typename
    day
    ... on TypeA {
      extraA
      nestedB {
        ...NestedB
      }
    }
    ... on TypeOtherA {
      morning
      nestedList {
        ...NestedA
      }
    }
  }

  fragment NestedA on IntA {
    __typename
    day
    ... on TypeA {
      extraA
    }
    ... on TypeOtherA {
      morning
    }
  }

  fragment IntB on IntB {
    __typename
    morning
    ... on TypeB {
      extraB
      nestedA {
        ...NestedA
      }
    }
    ... on TypeOtherB {
      stop
    }
  }

  fragment NestedB on IntB {
    __typename
    morning
    ... on TypeB {
      extraB
    }
    ... on TypeOtherB {
      stop
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
    variables: {},
    operationName: queryOperationName,
  };

  const response = {
    data: {
      listA: [
        null,
        {
          __typename: "TypeA",
          day: rawDay,
          extraA: rawDay2,
          nestedB: {
            __typename: "TypeB",
            morning: rawMorning,
            extraB: rawDay2,
          },
        },
        {
          __typename: "TypeOtherA",
          day: rawDay2,
          morning: rawMorning,
          nestedList: [
            null,
            {
              __typename: "TypeA",
              day: rawDay2,
              extraA: rawDay,
            },
          ],
        },
      ],
      listB: [
        null,
        {
          __typename: "TypeOtherB",
          morning: rawMorning2,
          stop: "STOP",
        },
        {
          __typename: "TypeB",
          morning: rawMorning,
          extraB: rawDay2,
          nestedA: {
            __typename: "TypeOtherA",
            day: rawDay,
            morning: rawMorning2,
          },
        },
        null,
      ],
    },
  };

  it("can compare 2 custom dates ok", () => {
    const a = new CustomDate(new Date("2018-01-01T00:00:00.000Z"));
    const b = new CustomDate(new Date("2018-01-01T00:00:00.000Z"));
    const c = new CustomDate(new Date("2018-02-03T00:00:00.000Z"));
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
  });

  it("ensure the response fixture is valid (ensure that in the response we have the RAW, the Server is converting from Date to STRING)", async () => {
    expect.assertions(1);
    const queryResponse = await graphql({ schema, source: querySource });
    expect(queryResponse).toEqual(response);
  });

  it("use the scalar resolvers in the schema to parse back", (done) => {
    const link = ApolloLink.from([
      withScalars({ schema }),
      new ApolloLink(() => {
        return Observable.of(response);
      }),
    ]);
    const expectedResponse = {
      data: {
        listA: [
          null,
          {
            __typename: "TypeA",
            day: parsedDay,
            extraA: parsedDay2,
            nestedB: {
              __typename: "TypeB",
              morning: parsedMorning,
              extraB: parsedDay2,
            },
          },
          {
            __typename: "TypeOtherA",
            day: parsedDay2,
            morning: parsedMorning,
            nestedList: [
              null,
              {
                __typename: "TypeA",
                day: parsedDay2,
                extraA: parsedDay,
              },
            ],
          },
        ],
        listB: [
          null,
          {
            __typename: "TypeOtherB",
            morning: parsedMorning2,
            stop: "STOP",
          },
          {
            __typename: "TypeB",
            morning: parsedMorning,
            extraB: parsedDay2,
            nestedA: {
              __typename: "TypeOtherA",
              day: parsedDay,
              morning: parsedMorning2,
            },
          },
          null,
        ],
      },
    };

    const observable = execute(link, request);
    observable.subscribe((value) => {
      expect(value).toEqual(expectedResponse);
      done();
    });
    expect.assertions(1);
  });

  it("override the scala resolvers with the custom functions map (removes `__typename` of inputs)", (done) => {
    const link = ApolloLink.from([
      withScalars({ schema, typesMap }),
      new ApolloLink(() => {
        return Observable.of(response);
      }),
    ]);
    const expectedResponse = {
      data: {
        listA: [
          null,
          {
            __typename: "TypeA",
            day: parsedDay,
            extraA: parsedDay2,
            nestedB: {
              __typename: "TypeB",
              morning: parsedMorningCustom,
              extraB: parsedDay2,
            },
          },
          {
            __typename: "TypeOtherA",
            day: parsedDay2,
            morning: parsedMorningCustom,
            nestedList: [
              null,
              {
                __typename: "TypeA",
                day: parsedDay2,
                extraA: parsedDay,
              },
            ],
          },
        ],
        listB: [
          null,
          {
            __typename: "TypeOtherB",
            morning: parsedMorningCustom2,
            stop: "STOP",
          },
          {
            __typename: "TypeB",
            morning: parsedMorningCustom,
            extraB: parsedDay2,
            nestedA: {
              __typename: "TypeOtherA",
              day: parsedDay,
              morning: parsedMorningCustom2,
            },
          },
          null,
        ],
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
