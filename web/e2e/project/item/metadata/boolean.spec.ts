/* eslint-disable playwright/expect-expect */

/**
 * End-to-end tests for Boolean metadata functionality in the CMS.
 * Tests the creation, updating, and editing of boolean metadata fields that handle
 * true/false values, typically represented as checkboxes or toggles in the metadata section.
 * Verifies proper state management and value persistence for metadata boolean fields.
 */

import { createModel } from "@reearth-cms/e2e/project/utils/model";
import { createProject, deleteProject } from "@reearth-cms/e2e/project/utils/project";
import { test } from "@reearth-cms/e2e/utils";

import { BooleanMetadataCreatingAndUpdating, BooleanMetadataEditing } from "../fields/fields";

/**
 * Setup: Before each test, create a fresh environment
 * - Navigates to the root page
 * - Creates a new project
 * - Creates a new model within the project
 * This ensures each test has a clean state for boolean metadata testing
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
 * Tests the creation and configuration of boolean metadata fields
 * Verifies that:
 * - Boolean metadata fields can be added to a model
 * - Default values can be set
 * - Metadata field properties can be configured properly
 */
test("Boolean metadata creating and updating has succeeded", async ({ page }) => {
  await BooleanMetadataCreatingAndUpdating(page);
});

/**
 * Tests the editing capabilities of existing boolean metadata fields
 * Verifies that:
 * - Boolean metadata values can be toggled
 * - State changes are properly saved
 * - UI reflects the current boolean state correctly
 * Note: Uses slow test configuration for complex interactions
 */
test("Boolean metadata editing has succeeded", async ({ page }) => {
  test.slow();
  await BooleanMetadataEditing(page);
});
