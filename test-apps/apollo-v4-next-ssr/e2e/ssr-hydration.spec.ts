import { expect, test } from "@playwright/test";

test("SSR hydration keeps JSON-shaped scalars without reviveScalarsInCache", async ({ page }) => {
  const browserMessages: string[] = [];
  page.on("console", (msg) => {
    const type = msg.type();
    if (type === "error" || type === "warning") {
      browserMessages.push(`[${type}] ${msg.text()}`);
    }
  });
  page.on("pageerror", (err) => browserMessages.push(`[pageerror] ${err.message}`));

  await page.goto("/");

  await expect(page.getByTestId("network-count")).toHaveText("0");
  await expect(page.getByTestId("char-name")).toHaveText("Rick Sanchez");
  await expect(page.getByTestId("char-created-type")).toHaveText("string");
  await expect(page.getByTestId("char-created-is-date")).toHaveText("false");
  await expect(page.getByTestId("char-created-iso")).toHaveText("2024-01-02T03:04:05.000Z");

  expect(browserMessages, `browser logged errors/warnings:\n${browserMessages.join("\n")}`).toHaveLength(0);
});

test("SSR hydration restores parsed scalars with reviveScalarsInCache", async ({ page }) => {
  const browserMessages: string[] = [];
  page.on("console", (msg) => {
    const type = msg.type();
    if (type === "error" || type === "warning") {
      browserMessages.push(`[${type}] ${msg.text()}`);
    }
  });
  page.on("pageerror", (err) => browserMessages.push(`[pageerror] ${err.message}`));

  await page.goto("/?fix=1");

  await expect(page.getByTestId("network-count")).toHaveText("0");
  await expect(page.getByTestId("char-name")).toHaveText("Rick Sanchez");
  await expect(page.getByTestId("char-created-type")).toHaveText("object");
  await expect(page.getByTestId("char-created-is-date")).toHaveText("true");
  await expect(page.getByTestId("char-created-iso")).toHaveText("2024-01-02T03:04:05.000Z");

  expect(browserMessages, `browser logged errors/warnings:\n${browserMessages.join("\n")}`).toHaveLength(0);
});
