import { expect, test } from "@reearth-cms/e2e/utils";

test("workspace can be logged in", async ({ page, reearth }) => {
  await reearth.goto(`/workspace/${reearth.workspaceId}`);

  await expect(page.getByRole("textbox")).toBeVisible();
});
