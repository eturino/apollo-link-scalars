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
      days: [Date]!
      sureDays: [Date!]!
      mornings: [StartOfDay!]!
      empty: [Date]!
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
      days: () => [parsedDay, parsedDay2],
      sureDays: () => [parsedDay, parsedDay2],
      mornings: () => [parsedMorning, parsedMorning2],
      empty: () => [],
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
    days
    sureDays
    mornings
    myMornings: mornings
    empty
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
      days: [rawDay, rawDay2],
      sureDays: [rawDay, rawDay2],
      mornings: [rawMorning, rawMorning2],
      myMornings: [rawMorning, rawMorning2],
      empty: [],
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
        days: [parsedDay, parsedDay2],
        sureDays: [parsedDay, parsedDay2],
        mornings: [parsedMorning, parsedMorning2],
        myMornings: [parsedMorning, parsedMorning2],
        empty: [],
      },
    };

    const observable = execute(link, request);
    observable.subscribe((value) => {
      expect(value).toEqual(expectedResponse);
      done();
    });
    expect.assertions(1);
  });

  it("override the scala resolvers with the custom functions map", (done) => {
    const link = ApolloLink.from([
      withScalars({ schema, typesMap }),
      new ApolloLink(() => {
        return Observable.of(response);
      }),
    ]);
    const expectedResponse = {
      data: {
        days: [parsedDay, parsedDay2],
        sureDays: [parsedDay, parsedDay2],
        mornings: [parsedMorningCustom, parsedMorningCustom2],
        myMornings: [parsedMorningCustom, parsedMorningCustom2],
        empty: [],
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
