import { expect, test } from "@playwright/test";

// Regression for issue #1565: in a `vite build` production bundle the
// `withScalars` link silently no-ops because graphql-js class names are
// minified, breaking the `constructor.name`-based type guards. Running
// against `vite preview` exercises the minified bundle.
test("scalar parsing survives vite production minification", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("status")).toHaveText("parsed");
  await expect(page.getByTestId("is-date")).toHaveText("true");
  await expect(page.getByTestId("release-iso")).toHaveText("1977-05-25T00:00:00.000Z");
});
