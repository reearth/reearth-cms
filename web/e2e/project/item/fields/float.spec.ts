/* eslint-disable playwright/expect-expect */

/**
 * End-to-end tests for Float field functionality in the CMS.
 * Tests the creation, updating, and editing of float fields that store
 * decimal numbers with configurable precision.
 */

import { createModel } from "@reearth-cms/e2e/project/utils/model";
import { createProject, deleteProject } from "@reearth-cms/e2e/project/utils/project";
import { test } from "@reearth-cms/e2e/utils";

import { FloatFieldCreatingAndUpdating, FloatFieldEditing } from "./fields";

/**
 * Setup: Before each test, create a fresh environment
 * - Navigates to the root page
 * - Creates a new project
 * - Creates a new model within the project
 */
test.beforeEach(async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
  await createModel(page);
});

/**
 * Cleanup: After each test, remove all test data
 * by deleting the created project
 */
test.afterEach(async ({ page }) => {
  await deleteProject(page);
});

/**
 * Tests the creation and configuration of float fields
 * Verifies that float fields can be added with proper validation rules
 * and decimal precision settings
 */
test("Float field creating and updating has succeeded", async ({ page }) => {
  await FloatFieldCreatingAndUpdating(page);
});

/**
 * Tests the editing capabilities of existing float fields
 * Verifies that decimal values can be entered, validated, and saved correctly
 */
test("Float field editing has succeeded", async ({ page }) => {
  await FloatFieldEditing(page);
});
