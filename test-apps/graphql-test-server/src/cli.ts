#!/usr/bin/env node
// CLI entry — starts the test server on the configured port and logs
// its URL. Used by mise tasks, playwright webServer, and ad-hoc dev.

import { startServer } from "./index.ts";

const port = Number(process.env.PORT ?? 5178);
const host = process.env.HOST ?? "127.0.0.1";

const handle = await startServer({ port, host });

console.log(`graphql-test-server listening at ${handle.url}`);

const shutdown = async (signal: string) => {
    console.log(`\nreceived ${signal}, shutting down`);
  await handle.close();
  process.exit(0);
};
process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
