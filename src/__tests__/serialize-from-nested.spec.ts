import { ApolloLink, DocumentNode, execute, gql, GraphQLRequest, Observable } from "@apollo/client/core";
import { getOperationName } from "@apollo/client/utilities";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { graphql, GraphQLScalarType, Kind } from "graphql";
import cloneDeep from "lodash.clonedeep";
import isNumber from "lodash.isnumber";
import isString from "lodash.isstring";
import { withScalars } from "..";

describe("scalars in nested input objects", () => {
  const typeDefs = gql`
    type Query {
      convert(input: MyInput!): MyResponse!
    }

    input MyInput {
      first: Date!
      second: MyNested!
    }

    input MyNested {
      morning: StartOfDay!
      list: [StartOfDay!]!
    }

    type MyResponse {
      first: StartOfDay!
      nested: MyNestedResponse
    }

    type MyNestedResponse {
      nestedDay: Date!
      days: [Date!]!
    }

    "represents a Date with time"
    scalar Date

    "represents a Date at the beginning of the UTC day"
    scalar StartOfDay
  `;

  type MyInput = { first: MainDate; second: MyNested };
  type MyNested = { morning: MainDate; list: MainDate[] };
  type MyResponse = { first: MainDate; nested: MyNestedResponse };
  type MyNestedResponse = { nestedDay: MainDate; days: MainDate[] };

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
  // const parsedMorningCustom2 = new CustomDate(rawMorning2);

  function toStartOfDay(givenDate: MainDate): MainDate {
    const d = givenDate.getNewDate();
    d.setUTCHours(0);
    d.setUTCMinutes(0);
    d.setUTCSeconds(0);
    d.setUTCMilliseconds(0);
    return new MainDate(d.toISOString());
  }

  function toDay(givenDate: MainDate): MainDate {
    const d = givenDate.getNewDate();
    d.setUTCHours(12);
    d.setUTCMinutes(13);
    d.setUTCSeconds(14);
    d.setUTCMilliseconds(0);
    return new MainDate(d.toISOString());
  }

  const resolvers = {
    Query: {
      convert: (_root: any, { input }: { input: MyInput }): MyResponse => {
        return {
          first: toStartOfDay(input.first),
          nested: {
            nestedDay: toDay(input.second.morning),
            days: input.second.list.map(toDay),
          },
        };
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
        if (isSerializableDate(parsed)) {
          return parsed.toISOString();
        }
        throw new Error(`given date is not a valid date!!: ${parsed}`);
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
        throw new Error(`given date to parse is not a string or a number!! (typesMap.StartOfDay.serialize): ${raw}`);
      },
    },
  };

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  const querySource = `
  query MyQuery($input: MyInput!) {
    convert(input: $input) {
      first
      nested {
        nestedDay
        days
      }
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
    variables: {
      input: {
        __typename: "MyInput",
        first: parsedDay,
        second: {
          __typename: "MyNested",
          morning: parsedMorning,
          list: [parsedMorning, parsedMorning2],
        },
      },
    },
    operationName: queryOperationName,
  };

  const response = {
    data: {
      convert: {
        first: rawMorning,
        nested: { nestedDay: rawDay, days: [rawDay, rawDay2] },
      },
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
        input: {
          first: rawDay,
          second: { morning: rawMorning, list: [rawMorning, rawMorning2] },
        },
      },
    });
    expect(queryResponse).toEqual(response);
  });

  it("use the scalar resolvers in the schema to serialize (without removeTypenameFromInputs)", (done) => {
    const link = ApolloLink.from([
      withScalars({ schema }),
      new ApolloLink((operation) => {
        expect(operation.variables).toEqual({
          input: {
            __typename: "MyInput",
            first: rawDay,
            second: {
              __typename: "MyNested",
              morning: rawMorning,
              list: [rawMorning, rawMorning2],
            },
          },
        });
        return Observable.of(cloneDeep(response));
      }),
    ]);
    const expectedResponse = {
      data: {
        convert: {
          first: parsedMorning,
          nested: { nestedDay: parsedDay, days: [parsedDay, parsedDay2] },
        },
      },
    };

    const observable = execute(link, cloneDeep(request));
    observable.subscribe((value) => {
      expect(value).toEqual(expectedResponse);
      done();
    });
    expect.assertions(2);
  });

  it("use the scalar resolvers in the schema to serialize (with removeTypenameFromInputs -> removes __typename)", (done) => {
    const link = ApolloLink.from([
      withScalars({ schema, removeTypenameFromInputs: true }),
      new ApolloLink((operation) => {
        expect(operation.variables).toEqual({
          input: {
            first: rawDay,
            second: {
              morning: rawMorning,
              list: [rawMorning, rawMorning2],
            },
          },
        });
        return Observable.of(cloneDeep(response));
      }),
    ]);
    const expectedResponse = {
      data: {
        convert: {
          first: parsedMorning,
          nested: { nestedDay: parsedDay, days: [parsedDay, parsedDay2] },
        },
      },
    };

    const observable = execute(link, cloneDeep(request));
    observable.subscribe((value) => {
      expect(value).toEqual(expectedResponse);
      done();
    });
    expect.assertions(2);
  });

  it("override the scala resolvers with the custom functions map (without removeTypenameFromInputs)", (done) => {
    const link = ApolloLink.from([
      withScalars({ schema, typesMap }),
      new ApolloLink((operation) => {
        expect(operation.variables).toEqual({
          input: {
            __typename: "MyInput",
            first: rawDay,
            second: {
              __typename: "MyNested",
              morning: rawMorning,
              list: [rawMorning, rawMorning2],
            },
          },
        });
        return Observable.of(cloneDeep(response));
      }),
    ]);
    const expectedResponse = {
      data: {
        convert: {
          first: parsedMorningCustom,
          nested: { nestedDay: parsedDay, days: [parsedDay, parsedDay2] },
        },
      },
    };

    const observable = execute(link, cloneDeep(request));
    observable.subscribe((value) => {
      expect(value).toEqual(expectedResponse);
      done();
    });
    expect.assertions(2);
  });

  it("override the scala resolvers with the custom functions map (with removeTypenameFromInputs -> removes __typename)", (done) => {
    const link = ApolloLink.from([
      withScalars({ schema, typesMap, removeTypenameFromInputs: true }),
      new ApolloLink((operation) => {
        expect(operation.variables).toEqual({
          input: {
            first: rawDay,
            second: { morning: rawMorning, list: [rawMorning, rawMorning2] },
          },
        });
        return Observable.of(cloneDeep(response));
      }),
    ]);
    const expectedResponse = {
      data: {
        convert: {
          first: parsedMorningCustom,
          nested: { nestedDay: parsedDay, days: [parsedDay, parsedDay2] },
        },
      },
    };

    const observable = execute(link, cloneDeep(request));
    observable.subscribe((value) => {
      expect(value).toEqual(expectedResponse);
      done();
    });
    expect.assertions(2);
  });
});
