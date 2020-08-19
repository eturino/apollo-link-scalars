import { ApolloLink, DocumentNode, execute, getOperationName, GraphQLRequest, Observable } from "apollo-link";
import { graphql, GraphQLScalarType, Kind } from "graphql";
import gql from "graphql-tag";
import { makeExecutableSchema } from "graphql-tools";
import { withScalars } from "..";

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
    days: () => [parsedDay, parsedDay2],
    sureDays: () => [parsedDay, parsedDay2],
    mornings: () => [parsedMorning, parsedMorning2],
    empty: () => [],
  },
  Date: new GraphQLScalarType({
    name: "Date",
    serialize: (parsed: Date | null) => parsed?.toISOString(),
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
    serialize: (parsed: Date | null) => parsed?.toISOString(),
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
    serialize: (parsed: CustomDate | Date | null) => parsed?.toISOString(),
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
