import { Buffer } from "node:buffer";
import type { IncomingMessage, ServerResponse } from "node:http";
import react from "@vitejs/plugin-react";
import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLID,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLSchema,
  GraphQLString,
  graphql,
  Kind,
} from "graphql";
import { defineConfig } from "vite";

const BigIntType = new GraphQLScalarType<bigint | null, string | null>({
  name: "BigInt",
  serialize: (value) => (typeof value === "bigint" ? value.toString() : null),
  parseValue: (value) => (typeof value === "string" ? BigInt(value) : null),
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING || ast.kind === Kind.INT) {
      return BigInt(ast.value);
    }
    return null;
  },
});

const ItemType = new GraphQLObjectType({
  name: "Item",
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    label: { type: new GraphQLNonNull(GraphQLString) },
    amount: { type: new GraphQLNonNull(BigIntType) },
  },
});

const QueryType = new GraphQLObjectType({
  name: "Query",
  fields: {
    items: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ItemType))),
      args: {
        amount: { type: BigIntType },
      },
      resolve: (_root, args: { amount?: bigint | null }) => {
        if (args.amount === null || args.amount === undefined) return [];
        const key = args.amount === 12345678901234567890n ? "a" : "other";
        return [
          {
            id: key,
            label: `slot-${key}`,
            amount: args.amount,
          },
        ];
      },
    },
  },
});

const MutationType = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    recordItem: {
      type: new GraphQLNonNull(ItemType),
      args: {
        amount: { type: new GraphQLNonNull(BigIntType) },
      },
      resolve: (_root, args: { amount: bigint }) => {
        const key = args.amount === 12345678901234567890n ? "a" : "other";
        return {
          id: `mut-${key}`,
          label: `mut-${key}`,
          amount: args.amount,
        };
      },
    },
  },
});

const schema = new GraphQLSchema({ query: QueryType, mutation: MutationType });

interface GraphqlHttpBody {
  operationName?: string;
  query?: string;
  variables?: Record<string, unknown>;
}

async function readRequestBody(req: IncomingMessage): Promise<string> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of req) {
    if (typeof chunk === "string") {
      chunks.push(Buffer.from(chunk));
    } else {
      chunks.push(chunk as Uint8Array);
    }
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function handleGraphqlRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end();
    return;
  }

  const bodyText = await readRequestBody(req);
  const body = (bodyText ? JSON.parse(bodyText) : {}) as GraphqlHttpBody;

  const result = await graphql({
    schema,
    source: body.query ?? "",
    variableValues: body.variables,
    operationName: body.operationName,
  });

  res.setHeader("content-type", "application/json");
  res.end(JSON.stringify(result));
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: "local-graphql-endpoint",
      configureServer(server) {
        server.middlewares.use("/graphql", (req, res) => {
          void handleGraphqlRequest(req, res);
        });
      },
    },
  ],
  server: { port: 5180, strictPort: true },
  build: { chunkSizeWarningLimit: 1000 },
});
