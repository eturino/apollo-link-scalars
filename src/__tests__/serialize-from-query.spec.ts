import { gql, ApolloLink, DocumentNode, execute, GraphQLRequest, Observable } from "@apollo/client";
import { getOperationName } from "@apollo/client/utilities";
import { graphql, GraphQLScalarType, Kind } from "graphql";
import { makeExecutableSchema } from "graphql-tools";
import { cloneDeep, isNumber, isString } from "lodash";
import { withScalars } from "..";

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
  constructor(s: string) {
    this.internalDate = new Date(s);
  }

  public toISOString(): string {
    return this.internalDate.toISOString();
  }

  public getNewDate(): Date {
    return new Date(this.internalDate);
  }
}

// tslint:disable-next-line:max-classes-per-file
class MainDate {
  public readonly internalDate: Date;
  constructor(s: string | number) {
    this.internalDate = new Date(s);
  }

  public toISOString(): string {
    return this.internalDate.toISOString();
  }

  public getNewDate(): Date {
    return new Date(this.internalDate);
  }
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
  Date: new GraphQLScalarType({
    name: "Date",
    serialize: (parsed: MainDate | null) => {
      if (!parsed) return parsed;
      // @ts-ignore
      if (!parsed instanceof MainDate) {
        throw new Error(`given date is not a MainDate!!: ${parsed}`);
      }
      return parsed.toISOString();
    },
    parseValue: (raw: any) => {
      if (!raw) return raw;
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
  StartOfDay: new GraphQLScalarType({
    name: "StartOfDay",
    serialize: (parsed: MainDate | null) => {
      if (!parsed) return parsed;
      // @ts-ignore
      if (!parsed instanceof MainDate) {
        throw new Error(`given date is not a Date!!: ${parsed}`);
      }
      return parsed.toISOString();
    },
    parseValue: (raw: any) => {
      if (!raw) return raw;
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
    serialize: (parsed: CustomDate | null) => {
      if (!parsed) return parsed;
      // @ts-ignore
      if (!parsed instanceof CustomDate) {
        throw new Error(`given date is not a Date!!: ${parsed}`);
      }
      return parsed.toISOString();
    },
    parseValue: (raw: string | number | null): CustomDate | null => {
      if (!raw) return null;
      const d = new Date(raw);
      d.setUTCHours(0);
      d.setUTCMinutes(0);
      d.setUTCSeconds(0);
      d.setUTCMilliseconds(0);
      return new CustomDate(d.toISOString());
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

describe("scalar returned directly from first level queries", () => {
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
