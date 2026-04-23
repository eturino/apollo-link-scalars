import { expect, test } from "@playwright/test";

/**
 * Fix path for issue #760: `reviveScalarsInCache(cache.extract(), schema,
 * typesMap)` re-applies `parseValue` to the cache snapshot after
 * `apollo4-cache-persist` rehydrates it from localStorage. The consumer
 * sees real Date instances again — both when reading synchronously on
 * mount and when Apollo serves the query from cache on a later call.
 */
test("reviveScalarsInCache restores Date scalars after rehydration (v4)", async ({ page }) => {
  const browserMessages: string[] = [];
  page.on("console", (msg) => {
    const type = msg.type();
    if (type === "error" || type === "warning") {
      browserMessages.push(`[${type}] ${msg.text()}`);
    }
  });
  page.on("pageerror", (err) => browserMessages.push(`[pageerror] ${err.message}`));

  // Phase 1: seed the cache via a live network fetch without the fix toggle.
  // This writes the scalar link's parsed payload into memory and localStorage.
  await page.goto("/");
  await page.evaluate(() => {
    window.localStorage.clear();
  });
  await page.reload();

  await page.getByTestId("button-fetch").click();
  await expect(page.getByTestId("last-source")).toHaveText("network");
  await expect(page.getByTestId("rendered-is-date")).toHaveText("true");

  await page.waitForFunction(
    () => window.localStorage.getItem("apollo-cache-persist") !== null,
  );

  // Phase 2: reload with the fix toggle. reviveScalarsInCache runs right
  // after persistCache's restore, so the cache entry holds Date instances
  // when the page reads it on mount.
  await page.goto("/?fix=1");

  await expect(page.getByTestId("fix-flag")).toHaveText("on");
  await expect(page.getByTestId("cached-type")).toHaveText("object");
  await expect(page.getByTestId("cached-is-date")).toHaveText("true");
  await expect(page.getByTestId("cached-iso")).toHaveText(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
  );

  // Phase 3: cache-first query pulls from memory (0 network hits). The
  // scalar link still never runs on this path, but the revive step means
  // the consumer receives a Date instance anyway.
  await page.getByTestId("button-fetch").click();
  await expect(page.getByTestId("last-source")).toHaveText("cache");
  await expect(page.getByTestId("rendered-type")).toHaveText("object");
  await expect(page.getByTestId("rendered-is-date")).toHaveText("true");
  await expect(page.getByTestId("network-count")).toHaveText("0");

  expect(
    browserMessages,
    `browser logged errors/warnings:\n${browserMessages.join("\n")}`,
  ).toHaveLength(0);
});
