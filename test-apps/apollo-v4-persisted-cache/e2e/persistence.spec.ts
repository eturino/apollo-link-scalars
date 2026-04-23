import { expect, test } from "@playwright/test";

/**
 * Reproduction of issue #760: after apollo3-cache-persist round-trips the
 * cache through localStorage (JSON), a custom scalar parsed by
 * apollo-link-scalars on the original network response comes back as a
 * plain JSON value (string for DateTime) on the next session. The scalar
 * link only runs on link-level responses, so cache-hit reads never
 * re-invoke parseValue.
 */
test("custom scalars degrade to strings after localStorage rehydration (v4)", async ({ page }) => {
  const browserMessages: string[] = [];
  page.on("console", (msg) => {
    const type = msg.type();
    if (type === "error" || type === "warning") {
      browserMessages.push(`[${type}] ${msg.text()}`);
    }
  });
  page.on("pageerror", (err) => browserMessages.push(`[pageerror] ${err.message}`));

  // Phase 1: fresh visit, empty cache. First query should hit the network
  // and go through apollo-link-scalars — `created` arrives as a real Date.
  await page.goto("/");
  await page.evaluate(() => {
    window.localStorage.clear();
  });
  await page.reload();

  await expect(page.getByTestId("cached-empty")).toBeVisible();

  await page.getByTestId("button-fetch").click();

  await expect(page.getByTestId("last-source")).toHaveText("network");
  await expect(page.getByTestId("rendered-type")).toHaveText("object");
  await expect(page.getByTestId("rendered-is-date")).toHaveText("true");
  await expect(page.getByTestId("rendered-iso")).toHaveText(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
  );

  // Wait for apollo3-cache-persist to flush the in-memory cache to
  // localStorage. debounce is 0, so this is a single tick.
  await page.waitForFunction(
    () => window.localStorage.getItem("apollo-cache-persist") !== null,
  );

  // Phase 2: reload. The persistor rehydrates InMemoryCache from localStorage;
  // DateTime values are now plain strings because JSON.stringify dropped the
  // Date prototype on the way into storage.
  await page.reload();

  await expect(page.getByTestId("cached-type")).toHaveText("string");
  await expect(page.getByTestId("cached-is-date")).toHaveText("false");
  await expect(page.getByTestId("cached-iso")).toHaveText(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
  );

  // Phase 3: run the query again. cache-first returns the rehydrated entry
  // with zero network hops — apollo-link-scalars is never invoked, so the
  // string-typed `created` propagates to the consumer.
  await page.getByTestId("button-fetch").click();
  await expect(page.getByTestId("last-source")).toHaveText("cache");
  await expect(page.getByTestId("rendered-type")).toHaveText("string");
  await expect(page.getByTestId("rendered-is-date")).toHaveText("false");
  await expect(page.getByTestId("network-count")).toHaveText("0");

  expect(
    browserMessages,
    `browser logged errors/warnings:\n${browserMessages.join("\n")}`,
  ).toHaveLength(0);
});
