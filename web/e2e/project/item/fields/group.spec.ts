/* eslint-disable playwright/expect-expect */

/**
 * End-to-end tests for Group field functionality in the CMS.
 * Tests the creation, updating, and editing of group fields that handle
 * nested field structures and field grouping capabilities.
 * Verifies proper group handling, validation, and organization functionality.
 */

import { createModel } from "@reearth-cms/e2e/project/utils/model";
import { createProject, deleteProject } from "@reearth-cms/e2e/project/utils/project";
import { test } from "@reearth-cms/e2e/utils";

import { GroupFieldCreatingAndUpdating, GroupFieldEditing } from "./group";

/**
 * Setup: Before each test, create a fresh environment
 * - Navigates to the root page
 * - Creates a new project
 * - Creates a new model within the project
 * This ensures each test has a clean slate for group field testing
 */
test.beforeEach(async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
  await createModel(page);
});

/**
 * Cleanup: After each test, remove all test data
 * by deleting the created project and its associated group fields
 */
test.afterEach(async ({ page }) => {
  await deleteProject(page);
});

/**
 * Tests the creation and configuration of group fields
 * Verifies that:
 * - Group fields can be added to a model
 * - Nested fields can be properly configured
 * - Group field properties can be set correctly
 */
test("Group field creating and updating has succeeded", async ({ page }) => {
  test.slow();
  await GroupFieldCreatingAndUpdating(page);
});

/**
 * Tests the editing capabilities of existing group fields
 * Verifies that:
 * - Existing group fields can be modified
 * - Nested fields can be added or removed
 * - Group field structure can be reorganized
 */
test("Group field editing has succeeded", async ({ page }) => {
  test.slow();
  await GroupFieldEditing(page);
});
