import { gql, ApolloLink, DocumentNode, execute, GraphQLRequest, Observable } from "@apollo/client";
import { getOperationName } from "@apollo/client/utilities";
import { graphql, GraphQLScalarType, Kind } from "graphql";
import { makeExecutableSchema } from "graphql-tools";
import { withScalars } from "..";

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
  constructor(readonly date: Date) {}

  public toISOString(): string {
    return this.date.toISOString();
  }
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
  Date: new GraphQLScalarType({
    name: "Date",
    serialize: (parsed: Date | null) => parsed && parsed.toISOString(),
    parseValue: (raw: any) => raw && new Date(raw),
    parseLiteral(ast) {
      if (ast.kind === Kind.STRING || ast.kind === Kind.INT) {
        return new Date(ast.value);
      }
      return null;
    },
  }),
  StartOfDay: new GraphQLScalarType({
    name: "StartOfDay",
    serialize: (parsed: Date | null) => parsed && parsed.toISOString(),
    parseValue: (raw: any) => {
      if (!raw) return null;
      const d = new Date(raw);
      d.setUTCHours(0);
      d.setUTCMinutes(0);
      d.setUTCSeconds(0);
      d.setUTCMilliseconds(0);
      return d;
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
    serialize: (parsed: CustomDate | Date | null) => parsed && parsed.toISOString(),
    parseValue: (raw: any): CustomDate | null => {
      if (!raw) return null;
      const d = new Date(raw);
      d.setUTCHours(0);
      d.setUTCMinutes(0);
      d.setUTCSeconds(0);
      d.setUTCMilliseconds(0);
      return new CustomDate(d);
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

describe("scalar returned directly from first level queries", () => {
  it("can compare 2 custom dates ok", () => {
    const a = new CustomDate(new Date("2018-01-01T00:00:00.000Z"));
    const b = new CustomDate(new Date("2018-01-01T00:00:00.000Z"));
    const c = new CustomDate(new Date("2018-02-03T00:00:00.000Z"));
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
  });

  it("ensure the response fixture is valid (ensure that in the response we have the RAW, the Server is converting from Date to STRING)", async () => {
    expect.assertions(1);
    const queryResponse = await graphql(schema, querySource);
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
