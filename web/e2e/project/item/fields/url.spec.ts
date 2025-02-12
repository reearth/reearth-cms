/* eslint-disable playwright/expect-expect */

/**
 * End-to-end tests for URL field functionality in the CMS.
 * Tests the creation, updating, and editing of URL fields within a model.
 * Requires a project and model to be created before each test.
 */

import { createModel } from "@reearth-cms/e2e/project/utils/model";
import { createProject, deleteProject } from "@reearth-cms/e2e/project/utils/project";
import { test } from "@reearth-cms/e2e/utils";

import { URLFieldCreatingAndUpdating, URLFieldEditing } from "./url";

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
 * Test the creation and updating of URL fields within a model.
 * Verifies that URL fields can be properly added and their properties can be modified.
 */
test("URL field creating and updating has succeeded", async ({ page }) => {
  await URLFieldCreatingAndUpdating(page);
});

/**
 * Test the editing functionality of URL fields.
 * Verifies that existing URL fields can be modified and validates the changes.
 */
test("URL field editing has succeeded", async ({ page }) => {
  await URLFieldEditing(page);
});
