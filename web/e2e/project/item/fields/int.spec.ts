/* eslint-disable playwright/expect-expect */

/**
 * End-to-end tests for Integer field functionality in the CMS.
 * Tests the creation, updating, and editing of integer fields that store
 * whole numbers with optional min/max validation.
 */

import { createModel } from "@reearth-cms/e2e/project/utils/model";
import { createProject, deleteProject } from "@reearth-cms/e2e/project/utils/project";
import { test } from "@reearth-cms/e2e/utils";

import { IntFieldCreatingAndUpdating, IntFieldEditing } from "./group";

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
 * Tests the creation and configuration of integer fields
 * Verifies that integer fields can be added with proper validation rules
 */
test("Int field creating and updating has succeeded", async ({ page }) => {
  await IntFieldCreatingAndUpdating(page);
});

/**
 * Tests the editing capabilities of existing integer fields
 * Verifies that whole numbers can be entered, validated, and saved correctly
 */
test("Int field editing has succeeded", async ({ page }) => {
  await IntFieldEditing(page);
});
