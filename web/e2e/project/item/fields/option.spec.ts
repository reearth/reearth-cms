/* eslint-disable playwright/expect-expect */

/**
 * End-to-end tests for Option field functionality in the CMS.
 * Tests the creation, updating, and editing of option fields that handle
 * predefined choices and selection capabilities.
 * Verifies proper option handling, validation, and selection functionality.
 */

import { createModel } from "@reearth-cms/e2e/project/utils/model";
import { createProject, deleteProject } from "@reearth-cms/e2e/project/utils/project";
import { test } from "@reearth-cms/e2e/utils";

import { OptionFieldCreatingAndUpdating, OptionFieldEditing } from "./option";

/**
 * Setup: Before each test, create a fresh environment
 * - Navigates to the root page
 * - Creates a new project
 * - Creates a new model within the project
 * This ensures each test has a clean slate for option field testing
 */
test.beforeEach(async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
  await createModel(page);
});

/**
 * Cleanup: After each test, remove all test data
 * by deleting the created project and its associated options
 */
test.afterEach(async ({ page }) => {
  await deleteProject(page);
});

/**
 * Tests the creation and configuration of option fields
 * Verifies that:
 * - Option fields can be added to a model
 * - Predefined choices can be configured
 * - Option field properties can be set correctly
 */
test("Option field creating and updating has succeeded", async ({ page }) => {
  await OptionFieldCreatingAndUpdating(page);
});

/**
 * Tests the editing capabilities of existing option fields
 * Verifies that:
 * - Existing options can be modified
 * - Choices can be added or removed
 * - Option field settings can be updated
 */
test("Option field editing has succeeded", async ({ page }) => {
  await OptionFieldEditing(page);
});
