import { expect, test } from "@reearth-cms/e2e/utils";

test("dasboard can be logged in", async ({ page, reearth }) => {
  await reearth.initUser();
  await reearth.goto(`/workspace/${reearth.workspaceId}`);

  await expect(page.getByText(`${reearth.userName}'s workspace`)).toBeVisible();
});
