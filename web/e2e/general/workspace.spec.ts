import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { parseConfigBoolean } from "@reearth-cms/utils/format";

import { config } from "../utils/config";

const disableWorkspaceUI = parseConfigBoolean(config.disableWorkspaceUi);

test.beforeEach(async () => {
  // eslint-disable-next-line playwright/no-skipped-test
  test.skip(disableWorkspaceUI, "Workspace UI is disabled in this configuration");
});

test("Workspace CRUD has succeeded", async ({ reearth, workspacePage }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });

  await workspacePage.createWorkspace("workspace name");
  await workspacePage.updateWorkspaceName("new workspace name");
  await expect(workspacePage.header).toContainText("new workspace name");
  await workspacePage.deleteWorkspace();
  await workspacePage.navigateToFirstLink();
  await expect(workspacePage.getByText("new workspace name")).toBeHidden();
});

test("Workspace Creating from tab has succeeded", async ({ reearth, workspacePage }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });

  await workspacePage.createWorkspaceFromTab("workspace name");
  await expect(workspacePage.header).toContainText("workspace name");
  await workspacePage.deleteWorkspace();
});
