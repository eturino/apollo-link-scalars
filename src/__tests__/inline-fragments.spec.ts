import { ApolloLink, DocumentNode, execute, gql, GraphQLRequest, Observable } from "@apollo/client/core";
import { getOperationName } from "@apollo/client/utilities";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { graphql, GraphQLScalarType, Kind } from "graphql";
import { withScalars } from "..";

describe("prevent conflicts with inline-fragments", () => {
  const querySource = `
query MyQuery {
  someField {
    __typename
    ...FragmentA,
    subFieldB {
      __typename
      ...FragmentB
    }
  }
}

fragment FragmentA on SomeField {
  fieldA1
  fieldA2
  fieldA3
  subFieldB {
    fieldB2
  }
}

fragment FragmentB on SomeFieldB {
  fieldB1
  fieldB2
  fieldB3
}
  `;

  const typeDefs = gql`
    type Query {
      someField: SomeField
    }

    type SomeField {
      fieldA1: StartOfDay
      fieldA2: Date
      fieldA3: StartOfDay
      subFieldB: SomeFieldB
    }

    type SomeFieldB {
      fieldB1: StartOfDay
      fieldB2: Date
      fieldB3: StartOfDay
    }

    "represents a Date with time"
    scalar Date

    "represents a Date with time at the start of the day UTC"
    scalar StartOfDay
  `;

  class CustomDate {
    constructor(readonly date: Date) {}

    public toISOString(): string {
      return this.date.toISOString();
    }
  }

  const rawDay = "2018-02-03T12:13:14.000Z";
  const rawMorning = "2018-02-03T00:00:00.000Z";

  const parsedDay = new Date(rawDay);
  const parsedMorning = new Date(rawMorning);
  const parsedMorningCustom = new CustomDate(parsedMorning);

  const resolvers = {
    Query: {
      someField: () => ({}),
    },
    SomeField: {
      fieldA1: () => parsedMorning,
      fieldA2: () => parsedDay,
      fieldA3: () => parsedMorning,
      subFieldB: () => ({}),
    },
    SomeFieldB: {
      fieldB1: () => parsedMorning,
      fieldB2: () => parsedDay,
      fieldB3: () => parsedMorning,
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
      someField: {
        __typename: "SomeField",
        fieldA1: rawMorning,
        fieldA2: rawDay,
        fieldA3: rawMorning,
        subFieldB: {
          __typename: "SomeFieldB",
          fieldB1: rawMorning,
          fieldB2: rawDay,
          fieldB3: rawMorning,
        },
      },
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
        someField: {
          __typename: "SomeField",
          fieldA1: parsedMorning,
          fieldA2: parsedDay,
          fieldA3: parsedMorning,
          subFieldB: {
            __typename: "SomeFieldB",
            fieldB1: parsedMorning,
            fieldB2: parsedDay,
            fieldB3: parsedMorning,
          },
        },
      },
    };

    const observable = execute(link, request);
    observable.subscribe((value) => {
      expect(value).toEqual(expectedResponse);
      done();
    });
    expect.assertions(1);
  });

  it("override the scalar resolvers with the custom functions map", (done) => {
    const link = ApolloLink.from([
      withScalars({ schema, typesMap }),
      new ApolloLink(() => {
        return Observable.of(response);
      }),
    ]);
    const expectedResponse = {
      data: {
        someField: {
          __typename: "SomeField",
          fieldA1: parsedMorningCustom,
          fieldA2: parsedDay,
          fieldA3: parsedMorningCustom,
          subFieldB: {
            __typename: "SomeFieldB",
            fieldB1: parsedMorningCustom,
            fieldB2: parsedDay,
            fieldB3: parsedMorningCustom,
          },
        },
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
