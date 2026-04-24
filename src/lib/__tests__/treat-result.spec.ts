import { gql, type FetchResult, type Operation } from "@apollo/client/core";
import { makeExecutableSchema } from "@graphql-tools/schema";
import defaultNullFunctions from "../default-null-functions";
import { treatResult } from "../treat-result";

function makeOperation(query: ReturnType<typeof gql>): Operation {
  return {
    query,
    variables: {},
    extensions: {},
    operationName: "TreatResultSpec",
    setContext: () => ({}),
    getContext: () => ({}),
  } as unknown as Operation;
}

describe("treatResult", () => {
  const schemaWithQueryOnly = makeExecutableSchema({
    typeDefs: gql`
      type Query {
        day: String
      }
    `,
  });

  const baseParams = {
    schema: schemaWithQueryOnly,
    functionsMap: {},
    validateEnums: false,
    nullFunctions: defaultNullFunctions,
  };

  it("returns the original result when data is missing", () => {
    const result = { errors: [] } as FetchResult;

    expect(
      treatResult({
        ...baseParams,
        operation: makeOperation(gql`
          query MissingData {
            day
          }
        `),
        result,
      })
    ).toBe(result);
  });

  it("returns the original result when the document has no operation definition", () => {
    const result = { data: { day: "2024-01-02" } } as FetchResult;

    expect(
      treatResult({
        ...baseParams,
        operation: makeOperation(gql`
          fragment OnlyFragment on Query {
            day
          }
        `),
        result,
      })
    ).toBe(result);
  });

  it("returns the original result when the schema has no mutation root", () => {
    const result = { data: { publishAt: "2024-01-02T03:04:05.000Z" } } as FetchResult;

    expect(
      treatResult({
        ...baseParams,
        operation: makeOperation(gql`
          mutation MissingMutationRoot {
            publishAt
          }
        `),
        result,
      })
    ).toBe(result);
  });

  it("returns the original result when the schema has no subscription root", () => {
    const result = { data: { tickAt: "2024-01-02T03:04:05.000Z" } } as FetchResult;

    expect(
      treatResult({
        ...baseParams,
        operation: makeOperation(gql`
          subscription MissingSubscriptionRoot {
            tickAt
          }
        `),
        result,
      })
    ).toBe(result);
  });
});
