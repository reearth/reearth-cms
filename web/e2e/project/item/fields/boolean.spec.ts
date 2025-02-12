/* eslint-disable playwright/expect-expect */

/**
 * End-to-end tests for Boolean field functionality in the CMS.
 * Tests the creation, updating, and editing of boolean fields that handle
 * true/false values, typically represented as checkboxes or toggles.
 * Verifies proper state management and value persistence.
 */

import { createModel } from "@reearth-cms/e2e/project/utils/model";
import { createProject, deleteProject } from "@reearth-cms/e2e/project/utils/project";
import { test } from "@reearth-cms/e2e/utils";

import { BooleanFieldCreatingAndUpdating, BooleanFieldEditing } from "./fields";

/**
 * Setup: Before each test, create a fresh environment
 * - Navigates to the root page
 * - Creates a new project
 * - Creates a new model within the project
 * This ensures each test has a clean state for boolean field testing
 */
test.beforeEach(async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
  await createModel(page);
});

/**
 * Cleanup: After each test, remove all test data
 * by deleting the created project and its associated data
 */
test.afterEach(async ({ page }) => {
  await deleteProject(page);
});

/**
 * Tests the creation and configuration of boolean fields
 * Verifies that:
 * - Boolean fields can be added to a model
 * - Default values can be set
 * - Field properties can be configured properly
 */
test("Boolean field creating and updating has succeeded", async ({ page }) => {
  await BooleanFieldCreatingAndUpdating(page);
});

/**
 * Tests the editing capabilities of existing boolean fields
 * Verifies that:
 * - Boolean values can be toggled
 * - State changes are properly saved
 * - UI reflects the current boolean state correctly
 */
test("Boolean field editing has succeeded", async ({ page }) => {
  await BooleanFieldEditing(page);
});
