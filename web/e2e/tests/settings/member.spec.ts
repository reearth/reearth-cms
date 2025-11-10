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

test("Searching current members has succeeded", async ({ memberPage, page }) => {
  await test.step("Navigate to member settings and verify member visibility", async () => {
    await memberPage.memberMenuItem.click();
    await page.waitForTimeout(300);
    await expect(memberPage.cellByText("OWNER")).toBeVisible();
  });

  await test.step("Search for non-existent member", async () => {
    await memberPage.searchInput.click();
    await memberPage.searchInput.fill("no member");
    await memberPage.searchButton.click();
    await page.waitForTimeout(300);
    await expect(memberPage.cellByText("OWNER")).toBeHidden();
  });

  await test.step("Clear search and verify member reappears", async () => {
    await memberPage.clearSearchButton.click();
    await page.waitForTimeout(300);
    await expect(memberPage.cellByText("OWNER")).toBeVisible();
  });
});
