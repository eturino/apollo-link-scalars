import { expect, test } from "@playwright/test";

test("parses rickandmortyapi DateTime scalar into a Date (v3)", async ({ page }) => {
  const browserMessages: string[] = [];
  page.on("console", (msg) => {
    const type = msg.type();
    if (type === "error" || type === "warning") {
      browserMessages.push(`[${type}] ${msg.text()}`);
    }
  });
  page.on("pageerror", (err) => browserMessages.push(`[pageerror] ${err.message}`));

  await page.goto("/");
  await page.getByTestId("input-id").fill("1");
  await page.getByTestId("button-fetch").click();

  await expect(page.getByTestId("char-name")).toHaveText("Rick Sanchez");
  await expect(page.getByTestId("char-created-is-date")).toHaveText("true");
  await expect(page.getByTestId("char-created-iso")).toHaveText(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  await expect(page.getByTestId("char-created-year")).toHaveText(/^20\d{2}$/);

  expect(browserMessages, `browser logged errors/warnings:\n${browserMessages.join("\n")}`).toHaveLength(0);
});
