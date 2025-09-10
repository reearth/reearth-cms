import { expect, test } from "@reearth-cms/e2e/fixtures/test";

import { createProject, deleteProject } from "./utils/project";

test.beforeEach(async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
});

test.afterEach(async ({ page }) => {
  await deleteProject(page);
});

test("Update settings on Accessibility page has succeeded", async ({ projectPage }) => {
  await projectPage.accessibilityMenuItem.click();
  await expect(projectPage.accessibilityHeadingFirst).toBeVisible();
  await expect(projectPage.accessApiText).toBeVisible();
  await expect(projectPage.apiKeyText).toBeVisible();
  await expect(projectPage.newKeyButton).toBeDisabled();
  await expect(projectPage.changeProjectVisibilityButton).toBeEnabled();
});
