/* eslint-disable playwright/expect-expect */

/**
 * End-to-end tests for Project functionality in the CMS.
 * Tests the creation, updating, searching, and deletion of projects
 * that serve as containers for models and content items.
 */

import { expect, test } from "@reearth-cms/e2e/utils";

import {
  createNewProject,
  deleteProject,
  searchProject,
  updateProject,
} from "../project/utils/project";

/**
 * Cleanup: After each test, remove all test data
 * by deleting the created project to ensure a clean state
 * for subsequent tests
 */
test.afterEach(async ({ page }) => {
  await deleteProject(page);
  await expect(page.getByText("new project name", { exact: true })).toBeHidden();
});

/**
 * Tests the complete project lifecycle including:
 * - Project creation
 * - Project search functionality
 * - Project updates and modifications
 * Verifies that all basic project operations work correctly
 */
test("Project CRUD and searching has succeeded", async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });

  // Create new project and verify setup
  await createNewProject(page);

  // Test search functionality
  await searchProject(page);

  // Test update operations
  await updateProject(page);
});
