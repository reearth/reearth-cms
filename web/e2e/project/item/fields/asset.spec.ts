/* eslint-disable playwright/expect-expect */

/**
 * End-to-end tests for Asset field functionality in the CMS.
 * Tests the creation, updating, and editing of asset fields that handle
 * file uploads, including images, documents, and other media types.
 * Verifies proper file handling, validation, and storage functionality.
 */

import { createModel } from "@reearth-cms/e2e/project/utils/model";
import { createProject, deleteProject } from "@reearth-cms/e2e/project/utils/project";
import { test } from "@reearth-cms/e2e/utils";

import { AssetFieldCreatingAndUpdating, AssetFieldEditing } from "./fields";

/**
 * Setup: Before each test, create a fresh environment
 * - Navigates to the root page
 * - Creates a new project
 * - Creates a new model within the project
 * This ensures each test has a clean slate for asset management testing
 */
test.beforeEach(async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
  await createModel(page);
});

/**
 * Cleanup: After each test, remove all test data
 * by deleting the created project and its associated assets
 */
test.afterEach(async ({ page }) => {
  await deleteProject(page);
});

/**
 * Tests the creation and configuration of asset fields
 * Verifies that:
 * - Asset fields can be added to a model
 * - File upload functionality works correctly
 * - Asset field properties can be configured properly
 */
test("Asset field creating and updating has succeeded", async ({ page }) => {
  await AssetFieldCreatingAndUpdating(page);
});

/**
 * Tests the editing capabilities of existing asset fields
 * Verifies that:
 * - Existing assets can be modified
 * - Files can be replaced or removed
 * - Asset metadata can be updated
 */
test("Asset field editing has succeeded", async ({ page }) => {
  await AssetFieldEditing(page);
});
