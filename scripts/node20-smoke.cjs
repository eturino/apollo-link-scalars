#!/usr/bin/env node
// Loads the built package on the oldest Node that `engines.node` promises. vitest and pnpm need Node 22+,
// so CI installs and builds on the pinned Node, swaps to Apollo Client 3 + graphql 16 (graphql 17 needs
// Node 22+), then runs this file on Node 20.
const assert = require("node:assert/strict");
const { ApolloLink, Observable, execute, gql } = require("@apollo/client/core");
const { buildSchema } = require("graphql");
const { withScalars } = require("../build/main");

const ISO = "2020-01-02T03:04:05.000Z";
const schema = buildSchema("scalar DateTime type Query { echo(at: DateTime!): DateTime }");
const typesMap = {
  DateTime: {
    serialize: (value) => value.toISOString(),
    parseValue: (value) => new Date(value),
  },
};

let sentVariables;
const fakeServer = new ApolloLink((operation) => {
  sentVariables = operation.variables;
  return Observable.of({ data: { echo: ISO } });
});
const link = ApolloLink.from([withScalars({ schema, typesMap }), fakeServer]);
const query = gql`
  query Echo($at: DateTime!) {
    echo(at: $at)
  }
`;

let received = false;
execute(link, { query, variables: { at: new Date(ISO) } }).subscribe({
  next: (result) => {
    assert.equal(sentVariables.at, ISO);
    assert.ok(result.data.echo instanceof Date, `expected a Date, got ${JSON.stringify(result.data.echo)}`);
    received = true;
  },
  error: (error) => {
    console.error(error);
    process.exitCode = 1;
  },
});

process.on("exit", (code) => {
  if (code === 0 && !received) {
    console.error("no result came back through the link");
    process.exitCode = 1;
    return;
  }
  if (code === 0) console.log(`ok: Node ${process.version}`);
});
