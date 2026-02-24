import { config } from "@reearth-cms/e2e/config/config";
import { expect, TAG, test } from "@reearth-cms/e2e/fixtures/test";
import { parseConfigBoolean } from "@reearth-cms/e2e/helpers/format.helper";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";

const disableWorkspaceUI = parseConfigBoolean(config.disableWorkspaceUi);

test.beforeEach(async ({ workspacePage }) => {
  test.skip(disableWorkspaceUI, "Workspace UI is disabled in this configuration");
  await workspacePage.goto("/");
});

test("Workspace CRUD has succeeded", { tag: TAG.SMOKE }, async ({ workspacePage }) => {
  const wsName = `e2e-ws-${getId()}`;
  const newWsName = `new-${wsName}`;

  await workspacePage.createWorkspaceButton.click();
  await workspacePage.workspaceNameInput.click();
  await workspacePage.workspaceNameInput.fill(wsName);
  await workspacePage.okButton.click();
  await workspacePage.closeNotification();

  await workspacePage.workspaceSettingsButton.click();
  await workspacePage.workspaceNameSettingsInput.click();
  await workspacePage.workspaceNameSettingsInput.fill(newWsName);
  await workspacePage.saveChangesButton.click();
  await workspacePage.closeNotification();

  await expect(workspacePage.header).toContainText(newWsName);
  await workspacePage.removeWorkspaceButton.click();
  await workspacePage.okButton.click();
  await workspacePage.closeNotification();

  await workspacePage.firstWorkspaceLink.click();
  await expect(workspacePage.workspaceTextByName(newWsName)).toBeHidden();
});

test("Workspace Creating from tab has succeeded", async ({ workspacePage }) => {
  const wsName = `e2e-ws-${getId()}`;

  await workspacePage.firstWorkspaceLink.click();
  await workspacePage.createWorkspaceTabButton.click();
  await workspacePage.workspaceNameInput.click();
  await workspacePage.workspaceNameInput.fill(wsName);
  await workspacePage.okButton.click();
  await workspacePage.closeNotification();
  await expect(workspacePage.header).toContainText(wsName);

  await workspacePage.workspaceSettingsButton.click();
  await workspacePage.removeWorkspaceButton.click();
  await workspacePage.okButton.click();
  await workspacePage.closeNotification();
});
