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

const DateTimeType = new GraphQLScalarType<Date | null, string | null>({
  name: "DateTime",
  serialize: (value) => (value instanceof Date ? value.toISOString() : null),
  parseValue: (value) => (typeof value === "string" ? new Date(value) : null),
  parseLiteral(ast) {
    return ast.kind === Kind.STRING ? new Date(ast.value) : null;
  },
});

const EventType = new GraphQLObjectType({
  name: "Event",
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    label: { type: new GraphQLNonNull(GraphQLString) },
    at: { type: DateTimeType },
  },
});

const QueryType = new GraphQLObjectType({
  name: "Query",
  fields: {
    events: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(EventType))),
      args: {
        at: { type: DateTimeType },
      },
      resolve: (_root, args: { at?: Date | null }) => {
        if (!args.at) return [];

        const key = args.at.toISOString().startsWith("2023-08-19") ? "a" : "other";
        return [
          {
            id: key,
            label: `slot-${key}`,
            at: args.at,
          },
        ];
      },
    },
  },
});

const schema = new GraphQLSchema({ query: QueryType });

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
  server: { port: 5177, strictPort: true },
  build: { chunkSizeWarningLimit: 1000 },
});
