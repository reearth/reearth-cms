/* eslint-disable playwright/expect-expect */

/**
 * End-to-end tests for GeometryObject field functionality in the CMS.
 * Tests the creation, updating, and editing of geometry object fields that handle
 * spatial data, including points, lines, polygons, and other geometric shapes.
 * Verifies proper geometry handling, validation, and storage functionality.
 */

import { createModel } from "@reearth-cms/e2e/project/utils/model";
import { createProject, deleteProject } from "@reearth-cms/e2e/project/utils/project";
import { test } from "@reearth-cms/e2e/utils";

import { GeometryObjectFieldCreatingAndUpdating, GeometryObjectFieldEditing } from "./fields";

/**
 * Setup: Before each test, create a fresh environment
 * - Navigates to the root page
 * - Creates a new project
 * - Creates a new model within the project
 * This ensures each test has a clean slate for geometry object testing
 */
test.beforeEach(async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
  await createModel(page);
});

/**
 * Cleanup: After each test, remove all test data
 * by deleting the created project and its associated geometry objects
 */
test.afterEach(async ({ page }) => {
  await deleteProject(page);
});

/**
 * Tests the creation and configuration of geometry object fields
 * Verifies that:
 * - Geometry object fields can be added to a model
 * - Spatial data input functionality works correctly
 * - Geometry field properties can be configured properly
 */
test("GeometryObject field creating and updating has succeeded", async ({ page }) => {
  await GeometryObjectFieldCreatingAndUpdating(page);
});

/**
 * Tests the editing capabilities of existing geometry object fields
 * Verifies that:
 * - Existing geometry objects can be modified
 * - Spatial data can be updated or removed
 * - Geometry properties can be updated
 */
test("GeometryObject field editing has succeeded", async ({ page }) => {
  await GeometryObjectFieldEditing(page);
});

test.describe.configure({ timeout: 60000 }); // Increase timeout to 60 seconds
