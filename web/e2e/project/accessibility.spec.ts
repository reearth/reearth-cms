import { expect, test } from "@reearth-cms/e2e/fixtures/test";

import { createProject, deleteProject } from "./utils/project";

test.beforeEach(async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
});

test.afterEach(async ({ page }) => {
  await deleteProject(page);
});

test("Update settings on Accessibility page has succeeded", async ({ page }) => {
  await page.getByText("Accessibility").click();
  await expect(page.getByText("Accessibility").first()).toBeVisible();
  await expect(page.getByText("Access API").first()).toBeVisible();
  await expect(page.getByText("API Key").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "New Key" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Change project visibility" })).toBeEnabled();
});
