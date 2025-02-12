/* eslint-disable playwright/expect-expect */

/**
 * End-to-end tests for textarea field functionality in the CMS.
 * Tests the creation and updating of textarea fields within a model.
 * Requires a project and model to be created before each test.
 */

import { createModel } from "@reearth-cms/e2e/project/utils/model";
import { createProject, deleteProject } from "@reearth-cms/e2e/project/utils/project";
import { test } from "@reearth-cms/e2e/utils";

import { TextareaFieldCreatingAndUpdating } from "./reference";

/**
 * Before each test, navigate to the application root, create a project and model.
 * This setup ensures each test starts with a clean environment.
 */
test.beforeEach(async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
  await createModel(page);
});

/**
 * After each test, clean up by deleting the project and associated data.
 * This ensures no test data persists between test runs.
 */
test.afterEach(async ({ page }) => {
  await deleteProject(page);
});

/**
 * Test the creation and updating of textarea fields within a model.
 * Verifies that textarea fields can be properly added and modified.
 */
test("Textarea field editing has succeeded", async ({ page }) => {
  await TextareaFieldCreatingAndUpdating(page);
});
