import { config } from "@reearth-cms/e2e/config/config";
import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { parseConfigBoolean } from "@reearth-cms/e2e/helpers/format.helper";

const disableWorkspaceUI = parseConfigBoolean(config.disableWorkspaceUi);

test.beforeEach(async ({ reearth, workspacePage }) => {
  test.skip(disableWorkspaceUI, "Workspace UI is disabled in this configuration");
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await workspacePage.createWorkspace("e2e workspace name");
});

test.afterEach(async ({ workspacePage }) => {
  test.skip(disableWorkspaceUI, "Workspace UI is disabled in this configuration");
  await workspacePage.deleteWorkspace();
});

test("@smoke Searching current members has succeeded", async ({ memberPage }) => {
  await memberPage.memberMenuItem.click();
  await expect(memberPage.cellByText("OWNER")).toBeVisible();
  await memberPage.searchInput.click();
  await memberPage.searchInput.fill("no member");
  await memberPage.searchButton.click();
  await expect(memberPage.cellByText("OWNER")).toBeHidden();
  await memberPage.clearSearchButton.click();
  await expect(memberPage.cellByText("OWNER")).toBeVisible();
});
