import { expect, test } from "@playwright/test";

const CREATED_ISO = "2020-01-02T03:04:05.000Z";

test("serializes a DateTime mutation variable and parses DateTime in the mutation result and the subscription (v4)", async ({
  page,
}) => {
  const browserMessages: string[] = [];
  page.on("console", (msg) => {
    const type = msg.type();
    if (type === "error" || type === "warning") {
      browserMessages.push(`[${type}] ${msg.text()}`);
    }
  });
  page.on("pageerror", (err) => browserMessages.push(`[pageerror] ${err.message}`));

  // The subscription must be registered on the server before the mutation fires,
  // or the server emits the event to nobody.
  const sentFrames: string[] = [];
  page.on("websocket", (ws) => ws.on("framesent", (frame) => sentFrames.push(String(frame.payload))));
  await page.goto("/");
  await expect.poll(() => sentFrames.some((f) => f.includes('"type":"subscribe"'))).toBe(true);
  await expect(page.getByTestId("sub-status")).toHaveText("waiting");

  const mutationRequest = page.waitForRequest(
    (req) =>
      req.url().endsWith("/graphql") && req.method() === "POST" && (req.postData() ?? "").includes("CreateCharacter")
  );
  await page.getByTestId("button-create").click();

  expect((await mutationRequest).postDataJSON()).toMatchObject({
    variables: { input: { created: "2020-01-02T03:04:05.000+00:00" } },
  });

  await expect(page.getByTestId("create-name")).toHaveText("Squanchy");
  await expect(page.getByTestId("create-created-is-date")).toHaveText("true");
  await expect(page.getByTestId("create-created-iso")).toHaveText(CREATED_ISO);

  await expect(page.getByTestId("sub-name")).toHaveText("Squanchy");
  await expect(page.getByTestId("sub-created-is-date")).toHaveText("true");
  await expect(page.getByTestId("sub-created-iso")).toHaveText(CREATED_ISO);

  expect(browserMessages, `browser logged errors/warnings:\n${browserMessages.join("\n")}`).toHaveLength(0);
});
