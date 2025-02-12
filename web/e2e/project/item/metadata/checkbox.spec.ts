/* eslint-disable playwright/expect-expect */

/**
 * End-to-end tests for Checkbox metadata functionality in the CMS.
 * Tests the creation, updating, and editing of checkbox metadata fields that handle
 * multiple selection capabilities in the metadata section.
 * Verifies proper checkbox state management and selection persistence.
 */

import { createModel } from "@reearth-cms/e2e/project/utils/model";
import { createProject, deleteProject } from "@reearth-cms/e2e/project/utils/project";
import { test } from "@reearth-cms/e2e/utils";

import { CheckboxMetadataCreatingAndUpdating, CheckboxMetadataEditing } from "./metadata";

/**
 * Setup: Before each test, create a fresh environment
 * - Navigates to the root page
 * - Creates a new project
 * - Creates a new model within the project
 * This ensures each test has a clean state for checkbox metadata testing
 */
test.beforeEach(async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
  await createModel(page);
});

/**
 * Cleanup: After each test, remove all test data
 * by deleting the created project and its associated metadata
 */
test.afterEach(async ({ page }) => {
  await deleteProject(page);
});

/**
 * Tests the creation and configuration of checkbox metadata fields
 * Verifies that:
 * - Checkbox metadata fields can be added to a model
 * - Multiple selection options can be configured
 * - Checkbox group properties can be set properly
 */
test("Checkbox metadata creating and updating has succeeded", async ({ page }) => {
  await CheckboxMetadataCreatingAndUpdating(page);
});

/**
 * Tests the editing capabilities of existing checkbox metadata fields
 * Verifies that:
 * - Multiple checkboxes can be selected/deselected
 * - Selection states are properly saved
 * - UI reflects the current checkbox states correctly
 * Note: Uses slow test configuration for complex interactions
 */
test("Checkbox metadata editing has succeeded", async ({ page }) => {
  test.slow();
  await CheckboxMetadataEditing(page);
});
