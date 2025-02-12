/* eslint-disable playwright/expect-expect */

/**
 * End-to-end tests for Text metadata functionality in the CMS.
 * Tests the creation, updating, and editing of text metadata fields that handle
 * string data with configurable validation and formatting options.
 * Verifies proper text input handling and validation functionality.
 */

import { createModel } from "@reearth-cms/e2e/project/utils/model";
import { createProject, deleteProject } from "@reearth-cms/e2e/project/utils/project";
import { test } from "@reearth-cms/e2e/utils";

import { TextMetadataCreatingAndUpdating, TextMetadataEditing } from "../fields/reference";

/**
 * Setup: Before each test, create a fresh environment
 * - Navigates to the root page
 * - Creates a new project
 * - Creates a new model within the project
 * This ensures each test has a clean slate for text metadata testing
 */
test.beforeEach(async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
  await createModel(page);
});

/**
 * Cleanup: After each test, remove all test data
 * by deleting the created project and its associated text metadata
 */
test.afterEach(async ({ page }) => {
  await deleteProject(page);
});

/**
 * Tests the creation and configuration of text metadata fields
 * Verifies that:
 * - Text metadata fields can be added to a model
 * - Text validation rules can be configured
 * - Text field properties can be set correctly
 */
test("Text metadata creating and updating has succeeded", async ({ page }) => {
  await TextMetadataCreatingAndUpdating(page);
});

/**
 * Tests the editing capabilities of existing text metadata fields
 * Verifies that:
 * - Existing text metadata can be modified
 * - Validation rules can be updated
 * - Text field settings can be changed
 * Note: Uses slow test configuration due to complex text field interactions
 */
test("Text metadata editing has succeeded", async ({ page }) => {
  test.slow();
  await TextMetadataEditing(page);
});
