import { expect, test } from "@playwright/test";

test("cache-first BigInt query reuses cache and runs mutation without canonicalStringify throwing", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByTestId("reset").click();
  await expect(page.getByTestId("network-hits")).toHaveText("0");

  await page.getByTestId("load-a").click();
  await expect(page.getByTestId("status")).toHaveText("loaded");
  await expect(page.getByTestId("label")).toHaveText("slot-a");
  await expect(page.getByTestId("is-bigint")).toHaveText("true");
  await expect(page.getByTestId("network-hits")).toHaveText("1");

  await page.getByTestId("load-b").click();
  await expect(page.getByTestId("status")).toHaveText("loaded");
  await expect(page.getByTestId("label")).toHaveText("slot-other");
  await expect(page.getByTestId("is-bigint")).toHaveText("true");
  await expect(page.getByTestId("network-hits")).toHaveText("2");

  await page.getByTestId("load-a").click();
  await expect(page.getByTestId("status")).toHaveText("loaded");
  await expect(page.getByTestId("label")).toHaveText("slot-a");
  await expect(page.getByTestId("is-bigint")).toHaveText("true");
  await expect(page.getByTestId("network-hits")).toHaveText("2");

  await page.getByTestId("run-mutation").click();
  await expect(page.getByTestId("mutation-result")).toHaveText("mut-a:bigint");
  await expect(page.getByTestId("mutation-error")).toHaveText("empty");
});
