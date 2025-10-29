import { config } from "@reearth-cms/e2e/config/config";
import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { parseConfigBoolean } from "@reearth-cms/e2e/helpers/format.helper";

const disableWorkspaceUI = parseConfigBoolean(config.disableWorkspaceUi);

let workspaceCreated = false;

test.beforeEach(async () => {
  workspaceCreated = false;
});

test.afterEach(async ({ reearth, workspacePage }) => {
  // Clean up workspace if it was created and not already deleted in the test
  if (workspaceCreated) {
    try {
      await reearth.goto("/", { waitUntil: "domcontentloaded" });
      // Check if the workspace still exists
      const workspaceExists =
        (await workspacePage
          .workspaceTextByName("new workspace name")
          .or(workspacePage.workspaceTextByName("workspace name"))
          .isVisible()
          .catch(() => false)) ?? false;

      if (workspaceExists) {
        await workspacePage
          .workspaceTextByName("new workspace name")
          .or(workspacePage.workspaceTextByName("workspace name"))
          .first()
          .click();
        await workspacePage.deleteWorkspace();
      }
    } catch (error) {
      console.warn("Workspace cleanup failed:", error);
    }
  }
});

test("Workspace CRUD has succeeded", async ({ reearth, workspacePage }) => {
  test.skip(disableWorkspaceUI, "Workspace UI is disabled in this configuration");
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await workspacePage.createWorkspaceButton.click();
  await workspacePage.workspaceNameInput.click();
  await workspacePage.workspaceNameInput.fill("workspace name");
  await workspacePage.okButton.click();
  await workspacePage.closeNotification();
  workspaceCreated = true;

  await workspacePage.workspaceSettingsButton.click();
  await workspacePage.workspaceNameSettingsInput.click();
  await workspacePage.workspaceNameSettingsInput.fill("new workspace name");
  await workspacePage.saveChangesButton.click();
  await workspacePage.closeNotification();

  await expect(workspacePage.header).toContainText("new workspace name");
  await workspacePage.removeWorkspaceButton.click();
  await workspacePage.okButton.click();
  await workspacePage.closeNotification();
  workspaceCreated = false; // Mark as cleaned up

  await workspacePage.firstWorkspaceLink.click();
  await expect(workspacePage.workspaceTextByName("new workspace name")).toBeHidden();
});

test("Workspace Creating from tab has succeeded", async ({ reearth, workspacePage }) => {
  test.skip(disableWorkspaceUI, "Workspace UI is disabled in this configuration");
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await workspacePage.firstWorkspaceLink.click();
  await workspacePage.createWorkspaceTabButton.click();
  await workspacePage.workspaceNameInput.click();
  await workspacePage.workspaceNameInput.fill("workspace name");
  await workspacePage.okButton.click();
  await workspacePage.closeNotification();
  workspaceCreated = true;
  await expect(workspacePage.header).toContainText("workspace name");

  await workspacePage.workspaceSettingsButton.click();
  await workspacePage.removeWorkspaceButton.click();
  await workspacePage.okButton.click();
  await workspacePage.closeNotification();
  workspaceCreated = false; // Mark as cleaned up
});
