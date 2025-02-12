/* eslint-disable playwright/expect-expect */

/**
 * End-to-end tests for View functionality in the CMS.
 * Tests the creation, updating, and reordering of views that provide
 * different ways to organize and display content items.
 */

import { createModel } from "@reearth-cms/e2e/project/utils/model";
import { createProject, deleteProject } from "@reearth-cms/e2e/project/utils/project";
import { createWorkspace, deleteWorkspace } from "@reearth-cms/e2e/project/utils/workspace";
import { test } from "@reearth-cms/e2e/utils";

// Import test functions from view.ts
import { ViewCRUD, ViewReordering } from "./view";

/**
 * Setup: Before each test, create a fresh environment
 * - Navigates to the root page
 * - Creates a new workspace
 * - Creates a new project
 * - Creates a new model within the project
 */
test.beforeEach(async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createWorkspace(page);
  await createProject(page);
  await createModel(page);
});

/**
 * Cleanup: After each test, remove all test data
 * by deleting the project and workspace
 */
test.afterEach(async ({ page }) => {
  await deleteProject(page);
  await deleteWorkspace(page);
});

/**
 * Tests basic CRUD operations for views
 * Verifies that views can be created, read, updated,
 * and deleted with proper configuration settings
 */
test("View CRUD has succeeded", async ({ page }) => {
  test.slow();
  await ViewCRUD(page);
});

/**
 * Tests the view reordering functionality
 * Verifies that views can be reordered and their
 * new positions are correctly maintained
 */
test("View reordering has succeeded", async ({ page }) => {
  await ViewReordering(page);
});
