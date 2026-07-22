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

test("@smoke Update settings on Public API page has succeeded", async ({ projectPage }) => {
  await projectPage.publicApiMenuItem.click();
  await expect(projectPage.publicApiHeadingFirst).toBeVisible();
  await expect(projectPage.apiKeyText).toBeVisible();
  await expect(projectPage.newKeyButton).toBeDisabled();
  await expect(projectPage.changeProjectVisibilityButton).toBeEnabled();
});
