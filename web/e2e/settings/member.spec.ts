/* eslint-disable playwright/no-skipped-test */
import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { createWorkspace, deleteWorkspace } from "@reearth-cms/e2e/project/utils/workspace";
import { parseConfigBoolean } from "@reearth-cms/utils/format";

import { config } from "../utils/config";

const disableWorkspaceUI = parseConfigBoolean(config.disableWorkspaceUi);

test.beforeEach(async ({ reearth, page }) => {
  test.skip(disableWorkspaceUI, "Workspace UI is disabled in this configuration");
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createWorkspace(page);
});

test.afterEach(async ({ page }) => {
  test.skip(disableWorkspaceUI, "Workspace UI is disabled in this configuration");
  await deleteWorkspace(page);
});

test("Searching current members has succeeded", async ({ memberPage }) => {
  await memberPage.memberMenuItem.click();
  await expect(memberPage.cellByText("OWNER")).toBeVisible();
  await memberPage.searchInput.click();
  await memberPage.searchInput.fill("no member");
  await memberPage.searchButton.click();
  await expect(memberPage.cellByText("OWNER")).toBeHidden();
  await memberPage.clearSearchButton.click();
  await expect(memberPage.cellByText("OWNER")).toBeVisible();
});
