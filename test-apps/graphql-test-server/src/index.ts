// Boot an Apollo Server with runId-partitioned state. `X-Run-Id`
// from the request (HTTP header or WS connection params) picks the
// partition; omitting it routes to a shared read-only store that rejects
// mutations.
//
// Wiring follows Apollo's canonical "HTTP + subscriptions" recipe:
//   express  — HTTP transport
//   ws + graphql-ws — subscription transport
//   @apollo/server + @as-integrations/express5 — request pipeline
//
// Apollo Server's drainHttpServer plugin drains in-flight HTTP requests
// on shutdown; a companion plugin disposes the WS server so tests that
// call `handle.close()` get a clean exit.

import { createServer, type Server } from "node:http";
import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { expressMiddleware } from "@as-integrations/express5";
import cors from "cors";
import express from "express";
import { useServer } from "graphql-ws/use/ws";
import { WebSocketServer } from "ws";
import { schema, type ServerContext } from "./schema.ts";
import { getStore, resetStore, SHARED_READONLY_ID } from "./store.ts";

type RunIdSource =
  | Headers
  | { [key: string]: unknown }
  | Readonly<Record<string, unknown>>
  | undefined;

function extractRunId(source: RunIdSource): string | undefined {
  if (!source) return undefined;
  // Duck-type the Headers check: Node's undici Headers may not match the
  // global Headers class identity, so `instanceof Headers` can return false
  // for a value that quacks like one.
  const maybeGetter = source as { get?: (key: string) => string | null };
  if (typeof maybeGetter.get === "function") {
    return maybeGetter.get("x-run-id") ?? undefined;
  }
  const record = source as Record<string, unknown>;
  const value =
    record["x-run-id"] ?? record["X-Run-Id"] ?? record["X-RUN-ID"] ?? record.runId;
  return typeof value === "string" ? value : undefined;
}

export interface StartOptions {
  port?: number;
  host?: string;
}

export interface ServerHandle {
  server: Server;
  port: number;
  url: string;
  close: () => Promise<void>;
}

export async function startServer(options: StartOptions = {}): Promise<ServerHandle> {
  const port = options.port ?? 5178;
  const host = options.host ?? "127.0.0.1";

  const app = express();
  const httpServer = createServer(app);

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  const wsCleanup = useServer(
    {
      schema,
      context: (ctx): ServerContext => {
        const runId = extractRunId(ctx.connectionParams);
        return { handle: getStore(runId) };
      },
    },
    wsServer
  );

  const apollo = new ApolloServer<ServerContext>({
    schema,
    // Surface real error messages so test failures point at the actual
    // resolver bug instead of a generic "Unexpected error". Apollo masks
    // errors by default in production mode.
    includeStacktraceInErrorResponses: true,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        serverWillStart() {
          return Promise.resolve({
            async drainServer() {
              await wsCleanup.dispose();
            },
          });
        },
      },
    ],
  });

  await apollo.start();

  // Tiny readiness probe for playwright's webServer `url` check, which
  // expects a 2xx on GET. Apollo's default landing page returns HTML but
  // depends on dev/prod detection we don't want to rely on.
  app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true });
  });

  app.use(
    "/graphql",
    cors({
      origin: "*",
      credentials: false,
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["content-type", "x-run-id", "authorization"],
    }),
    express.json(),
    expressMiddleware(apollo, {
      context: ({ req }): Promise<ServerContext> => {
        const runId = extractRunId(req.headers);
        return Promise.resolve({ handle: getStore(runId) });
      },
    })
  );

  await new Promise<void>((resolve) => {
    httpServer.listen(port, host, resolve);
  });

  return {
    server: httpServer,
    port,
    url: `http://${host}:${port}/graphql`,
    close: async () => {
      // apollo.stop() triggers the drainServer plugins: ApolloServerPluginDrainHttpServer
      // drains in-flight HTTP requests and closes the underlying httpServer;
      // our custom plugin disposes the graphql-ws cleanup. No manual close()
      // on httpServer/wsServer — calling them again raises "server is not
      // running" at this point.
      await apollo.stop();
    },
  };
}

export { getStore, resetStore, SHARED_READONLY_ID };
