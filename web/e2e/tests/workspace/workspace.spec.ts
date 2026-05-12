import { config } from "@reearth-cms/e2e/config/config";
import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { parseConfigBoolean } from "@reearth-cms/e2e/helpers/format.helper";

const disableWorkspaceUI = parseConfigBoolean(config.disableWorkspaceUi);

test.beforeEach(async ({ reearth }) => {
  test.skip(disableWorkspaceUI, "Workspace UI is disabled in this configuration");
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
});

test("@smoke Workspace CRUD has succeeded", async ({ workspacePage }) => {
  await workspacePage.createWorkspaceButton.click();
  await workspacePage.workspaceNameInput.click();
  await workspacePage.workspaceNameInput.fill("workspace name");
  await workspacePage.clickAndExpectSuccess(workspacePage.okButton);

  await workspacePage.workspaceSettingsButton.click();
  await workspacePage.workspaceNameSettingsInput.click();
  await workspacePage.workspaceNameSettingsInput.fill("new workspace name");
  await workspacePage.clickAndExpectSuccess(workspacePage.saveChangesButton);

  await expect(workspacePage.header).toContainText("new workspace name");
  await workspacePage.removeWorkspaceButton.click();
  await workspacePage.clickAndExpectSuccess(workspacePage.okButton);

  await workspacePage.firstWorkspaceLink.click();
  await expect(workspacePage.workspaceTextByName("new workspace name")).toBeHidden();
});

test("Workspace Creating from tab has succeeded", async ({ workspacePage }) => {
  await workspacePage.firstWorkspaceLink.click();
  await workspacePage.createWorkspaceTabButton.click();
  await workspacePage.workspaceNameInput.click();
  await workspacePage.workspaceNameInput.fill("workspace name");
  await workspacePage.clickAndExpectSuccess(workspacePage.okButton);
  await expect(workspacePage.header).toContainText("workspace name");

  await workspacePage.workspaceSettingsButton.click();
  await workspacePage.removeWorkspaceButton.click();
  await workspacePage.clickAndExpectSuccess(workspacePage.okButton);
});
