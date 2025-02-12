/* eslint-disable playwright/expect-expect */

/**
 * End-to-end tests for text field functionality in the CMS.
 * Tests the creation and updating of text fields within a model.
 * Requires a project and model to be created before each test.
 */

import { createModel } from "@reearth-cms/e2e/project/utils/model";
import { createProject, deleteProject } from "@reearth-cms/e2e/project/utils/project";
import { test } from "@reearth-cms/e2e/utils";

import { TextFieldCreatingAndUpdating } from "./reference";

/**
 * Before each test, navigate to the application root, create a project and model.
 */
test.beforeEach (async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
  await createModel(page);
});

/**
 * After each test, delete the project and associated data.
 */
test.afterEach(async ({ page }) => {
  await deleteProject(page);
});

/**
 * Test the creation and updating of text fields within a model.
 */
test("Text field editing has succeeded", async ({ page }) => {
  await TextFieldCreatingAndUpdating(page);
});
