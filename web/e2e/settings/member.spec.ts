import { createWorkspace, deleteWorkspace } from "@reearth-cms/e2e/project/utils/workspace";
import { expect, test } from "@reearth-cms/e2e/utils";

import { config } from "../utils/config";

const disableWorkspaceUI = config.disableWorkspaceUi === "true";

test.beforeEach(async ({ reearth, page }) => {
  // eslint-disable-next-line playwright/no-skipped-test
  test.skip(disableWorkspaceUI, "Workspace UI is disabled in this configuration");

  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createWorkspace(page);
});

test.afterEach(async ({ page }) => {
  // eslint-disable-next-line playwright/no-skipped-test
  test.skip(disableWorkspaceUI, "Workspace UI is disabled in this configuration");

  await deleteWorkspace(page);
});

test("Searching current members has succeeded", async ({ page }) => {
  await page.getByText("Member").click();
  await expect(page.getByRole("cell", { name: "OWNER" })).toBeVisible();
  await page.getByPlaceholder("input search text").click();
  await page.getByPlaceholder("input search text").fill("no member");
  await page.getByRole("button", { name: "search" }).click();
  await expect(page.getByRole("cell", { name: "OWNER" })).toBeHidden();
  await page.getByRole("button", { name: "close-circle" }).click();
  await expect(page.getByRole("cell", { name: "OWNER" })).toBeVisible();
});
