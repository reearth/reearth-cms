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
  await expect(projectSettingsPage.getByText("Accessibility").first()).toBeVisible();
  await expect(projectSettingsPage.getByText("Access API").first()).toBeVisible();
  await expect(projectSettingsPage.getByText("API Key").first()).toBeVisible();

  await expect(projectSettingsPage.getByRole("button", { name: "New Key" })).toBeDisabled();
  await expect(projectSettingsPage.getByRole("button", { name: "Change project visibility" })).toBeEnabled();
});
