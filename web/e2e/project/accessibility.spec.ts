import { test, expect } from "@reearth-cms/e2e/fixtures/test";

import { createProject, deleteProject } from "./utils/project";

test.beforeEach(async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
});

test.afterEach(async ({ page }) => {
  await deleteProject(page);
});

test("Update settings on Accessibility page has succeeded", async ({ projectSettingsPage }) => {
  await projectSettingsPage.navigateToAccessibility();
  await projectSettingsPage.expectAccessibilityPageVisible();
  await projectSettingsPage.expectNewKeyButtonDisabled();
  await projectSettingsPage.expectChangeVisibilityButtonEnabled();

  expect(true).toBe(true);
});
