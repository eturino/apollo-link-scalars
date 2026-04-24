import { expect, test } from "@playwright/test";

test("reuses cache-first results when serialized variables return to a previous value", async ({ page }) => {
  await page.goto("/");

  await page.getByTestId("reset").click();
  await expect(page.getByTestId("network-hits")).toHaveText("0");

  await page.getByTestId("load-a").click();
  await expect(page.getByTestId("status")).toHaveText("loaded");
  await expect(page.getByTestId("label")).toHaveText("slot-a");
  await expect(page.getByTestId("is-date")).toHaveText("true");
  await expect(page.getByTestId("network-hits")).toHaveText("1");

  await page.getByTestId("load-b").click();
  await expect(page.getByTestId("status")).toHaveText("loaded");
  await expect(page.getByTestId("label")).toHaveText("slot-other");
  await expect(page.getByTestId("is-date")).toHaveText("true");
  await expect(page.getByTestId("network-hits")).toHaveText("2");

  await page.getByTestId("load-a").click();
  await expect(page.getByTestId("status")).toHaveText("loaded");
  await expect(page.getByTestId("label")).toHaveText("slot-a");
  await expect(page.getByTestId("is-date")).toHaveText("true");
  await expect(page.getByTestId("network-hits")).toHaveText("2");
});
