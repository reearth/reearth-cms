import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";

test.beforeEach(async ({ reearth, projectPage }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  const projectName = getId();
  await projectPage.createProject(projectName);
  await projectPage.gotoProject(projectName);
});

test.afterEach(async ({ projectPage }) => {
  await projectPage.deleteProject();
});

test("Update settings on Accessibility page has succeeded", async ({ projectPage }) => {
  await projectPage.accessibilityMenuItem.click();
  await expect(projectPage.accessibilityHeadingFirst).toBeVisible();
  await expect(projectPage.accessApiText).toBeVisible();
  await expect(projectPage.apiKeyText).toBeVisible();
  await expect(projectPage.newKeyButton).toBeDisabled();
  await expect(projectPage.changeProjectVisibilityButton).toBeEnabled();
});
