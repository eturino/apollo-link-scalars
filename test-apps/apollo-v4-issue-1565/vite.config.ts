import { Buffer } from "node:buffer";
import type { IncomingMessage, ServerResponse } from "node:http";
import react from "@vitejs/plugin-react";
import {
  GraphQLID,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLSchema,
  GraphQLString,
  graphql,
  Kind,
} from "graphql";
import { defineConfig } from "vite";

const DateScalar = new GraphQLScalarType<Date | null, string | null>({
  name: "Date",
  serialize: (value) => (value instanceof Date ? value.toISOString() : null),
  parseValue: (value) => (typeof value === "string" ? new Date(value) : null),
  parseLiteral(ast) {
    return ast.kind === Kind.STRING ? new Date(ast.value) : null;
  },
});

const FilmType = new GraphQLObjectType({
  name: "Film",
  fields: {
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    releaseDate: { type: DateScalar },
  },
});

const RootType = new GraphQLObjectType({
  name: "Root",
  fields: {
    film: {
      type: FilmType,
      args: { filmID: { type: GraphQLID } },
      resolve: (_root, args: { filmID?: string | null }) => ({
        id: args.filmID ?? "1",
        title: "A New Hope",
        releaseDate: new Date("1977-05-25T00:00:00.000Z"),
      }),
    },
  },
});

const schema = new GraphQLSchema({ query: RootType });

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
      // The `vite preview` server runs after `vite build` and does not boot
      // the dev `configureServer`. Mount the same /graphql middleware so the
      // production build can be tested end-to-end without a separate server.
      configurePreviewServer(server) {
        server.middlewares.use("/graphql", (req, res) => {
          void handleGraphqlRequest(req, res);
        });
      },
    },
  ],
  server: { port: 5179, strictPort: true },
  preview: { port: 5179, strictPort: true },
  build: { chunkSizeWarningLimit: 1000 },
});
