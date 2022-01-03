import { ApolloLink, DocumentNode, execute, gql, GraphQLRequest, Observable } from "@apollo/client/core";
import { getOperationName } from "@apollo/client/utilities";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { graphql, GraphQLScalarType, Kind } from "graphql";
import cloneDeep from "lodash.clonedeep";
import isNumber from "lodash.isnumber";
import isString from "lodash.isstring";
import { withScalars } from "..";

describe("scalar returned directly from first level queries", () => {
  const typeDefs = gql`
    type Query {
      "returns a Date object with time"
      convertToMorning(date: Date!): StartOfDay!
      convertToDay(date: StartOfDay!): Date!
      convertToDays(dates: [StartOfDay!]!): [Date!]!
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
  const rawMorning = "2018-02-03T00:00:00.000Z";

  const parsedDay = new MainDate(rawDay);
  const parsedMorning = new MainDate(rawMorning);
  const parsedMorningCustom = new CustomDate(rawMorning);

  const rawDay2 = "2018-03-04T12:13:14.000Z";
  const rawMorning2 = "2018-03-04T00:00:00.000Z";

  const parsedDay2 = new MainDate(rawDay2);
  const parsedMorning2 = new MainDate(rawMorning2);
  const parsedMorningCustom2 = new CustomDate(rawMorning2);

  const resolvers = {
    Query: {
      convertToMorning: (_root: any, { date }: { date: MainDate }) => {
        const d = date.getNewDate();
        d.setUTCHours(0);
        d.setUTCMinutes(0);
        d.setUTCSeconds(0);
        d.setUTCMilliseconds(0);
        return new MainDate(d.toISOString());
      },
      convertToDay: (_root: any, { date }: { date: MainDate }) => {
        const d = date.getNewDate();
        d.setUTCHours(12);
        d.setUTCMinutes(13);
        d.setUTCSeconds(14);
        d.setUTCMilliseconds(0);
        return new MainDate(d.toISOString());
      },
      convertToDays: (_root: any, { dates }: { dates: MainDate[] }) => {
        return dates.map((date) => {
          const d = date.getNewDate();
          d.setUTCHours(12);
          d.setUTCMinutes(13);
          d.setUTCSeconds(14);
          d.setUTCMilliseconds(0);
          return new MainDate(d.toISOString());
        });
      },
    },
    Date: new GraphQLScalarType<MainDate | null, string | null>({
      name: "Date",
      serialize: (parsed) => {
        if (!parsed) return null;
        if (isSerializableDate(parsed)) {
          return parsed.toISOString();
        }
        throw new Error(`given date is not a MainDate!!: ${parsed}`);
      },
      parseValue: (raw) => {
        if (!raw) return null;
        if (raw instanceof MainDate) return raw;
        if (raw instanceof Date) return new MainDate(raw.toISOString());

        if (isString(raw) || isNumber(raw)) {
          return new MainDate(raw);
        }

        throw new Error(`given date to parse is not a string or a number!!: ${raw}`);
      },
      parseLiteral(ast) {
        if (ast.kind === Kind.STRING || ast.kind === Kind.INT) {
          return new MainDate(ast.value);
        }
        return null;
      },
    }),
    StartOfDay: new GraphQLScalarType<MainDate | null, string | null>({
      name: "StartOfDay",
      serialize: (parsed) => {
        if (!parsed) return null;
        if (isSerializableDate(parsed)) {
          return parsed.toISOString();
        }
        throw new Error(`given date is not a MainDate!!: ${parsed}`);
      },
      parseValue: (raw) => {
        if (!raw) return null;
        if (raw instanceof MainDate) return raw;
        if (raw instanceof Date) return new MainDate(raw.toISOString());

        if (isString(raw) || isNumber(raw)) {
          const d = new Date(raw);
          d.setUTCHours(0);
          d.setUTCMinutes(0);
          d.setUTCSeconds(0);
          d.setUTCMilliseconds(0);
          return new MainDate(d.toISOString());
        }

        throw new Error(`given date to parse is not a string or a number!!: ${raw}`);
      },
      parseLiteral(ast) {
        if (ast.kind === Kind.STRING || ast.kind === Kind.INT) {
          const d = new Date(ast.value);
          d.setUTCHours(0);
          d.setUTCMinutes(0);
          d.setUTCSeconds(0);
          d.setUTCMilliseconds(0);
          return new MainDate(d.toISOString());
        }
        return null;
      },
    }),
  };

  const typesMap = {
    StartOfDay: {
      serialize: (parsed: unknown): string | null => {
        if (!parsed) return null;
        if (parsed instanceof CustomDate) {
          return parsed.toISOString();
        }
        throw new Error(`given date is not a Date!!: ${parsed}`);
      },
      parseValue: (raw: unknown): CustomDate | null => {
        if (!raw) return null;
        if (raw instanceof CustomDate) return raw;
        if (raw instanceof Date) return new CustomDate(raw.toISOString());

        if (isString(raw) || isNumber(raw)) {
          const d = new Date(raw);
          d.setUTCHours(0);
          d.setUTCMinutes(0);
          d.setUTCSeconds(0);
          d.setUTCMilliseconds(0);
          return new CustomDate(d.toISOString());
        }
        throw new Error(`given date to parse is not a string or a number!!: ${raw}`);
      },
    },
  };

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  const querySource = `
  query MyQuery($morning: StartOfDay!, $mornings: [StartOfDay!]!, $day: Date!) {
    convertToMorning(date: $day)
    convertToDay(date: $morning)
    convertToDays(dates: $mornings)
  }
`;

  const queryDocument: DocumentNode = gql`
    ${querySource}
  `;
  const queryOperationName = getOperationName(queryDocument);
  if (!queryOperationName) throw new Error("invalid query operation name");

  const request: GraphQLRequest = {
    query: queryDocument,
    variables: {
      day: parsedDay,
      morning: parsedMorning,
      mornings: [parsedMorning, parsedMorning2],
    },
    operationName: queryOperationName,
  };

  const response = {
    data: {
      convertToMorning: rawMorning,
      convertToDay: rawDay,
      convertToDays: [rawDay, rawDay2],
    },
  };

  it("stringify of custom dates is not the same as toISOString()", () => {
    expect(JSON.stringify(parsedDay)).not.toEqual(rawDay);
  });
  it("can compare 2 custom dates ok", () => {
    const a = new CustomDate("2018-01-01T00:00:00.000Z");
    const b = new CustomDate("2018-01-01T00:00:00.000Z");
    const c = new CustomDate("2018-02-03T00:00:00.000Z");
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
  });

  it("can compare 2 MainDates ok", () => {
    const a = new MainDate("2018-01-01T00:00:00.000Z");
    const b = new MainDate("2018-01-01T00:00:00.000Z");
    const c = new MainDate("2018-02-03T00:00:00.000Z");
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
  });

  it("ensure the response and request fixtures are valid", async () => {
    expect.assertions(1);
    const queryResponse = await graphql({
      schema,
      source: querySource,
      variableValues: {
        morning: rawMorning,
        day: rawDay,
        mornings: [rawMorning, rawMorning2],
      },
    });
    expect(queryResponse).toEqual(response);
  });

  it("use the scalar resolvers in the schema to serialize", (done) => {
    const link = ApolloLink.from([
      withScalars({ schema }),
      new ApolloLink((operation) => {
        expect(operation.variables).toEqual({
          morning: rawMorning,
          day: rawDay,
          mornings: [rawMorning, rawMorning2],
        });
        return Observable.of(cloneDeep(response));
      }),
    ]);
    const expectedResponse = {
      data: {
        convertToDay: parsedDay,
        convertToDays: [parsedDay, parsedDay2],
        convertToMorning: parsedMorning,
      },
    };

    const observable = execute(link, cloneDeep(request));
    observable.subscribe((value) => {
      expect(value).toEqual(expectedResponse);
      done();
    });
    expect.assertions(2);
  });

  it("override the scala resolvers with the custom functions map", (done) => {
    const customRequest: GraphQLRequest = {
      query: { ...queryDocument },
      variables: {
        morning: parsedMorningCustom,
        mornings: [parsedMorningCustom, parsedMorningCustom2],
        day: parsedDay,
      },
      operationName: queryOperationName,
    };

    const link = ApolloLink.from([
      withScalars({ schema, typesMap }),
      new ApolloLink((operation) => {
        expect(operation.variables).toEqual({
          morning: rawMorning,
          mornings: [rawMorning, rawMorning2],
          day: rawDay,
        });
        return Observable.of(cloneDeep(response));
      }),
    ]);
    const expectedResponse = {
      data: {
        convertToDay: parsedDay,
        convertToDays: [parsedDay, parsedDay2],
        convertToMorning: parsedMorningCustom,
      },
    };

    const observable = execute(link, cloneDeep(customRequest));
    observable.subscribe((value) => {
      expect(value).toEqual(expectedResponse);
      done();
    });
    expect.assertions(2);
  });
});
