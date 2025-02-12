/* eslint-disable playwright/expect-expect */

/**
 * End-to-end tests for Date metadata functionality in the CMS.
 * Tests the creation, updating, and editing of date metadata fields that handle
 * temporal data in the metadata section.
 */

import { createModel } from "@reearth-cms/e2e/project/utils/model";
import { createProject, deleteProject } from "@reearth-cms/e2e/project/utils/project";
import { test } from "@reearth-cms/e2e/utils";

import { createDateMetadata, editDateMetadata } from "../fields/date";

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
 * Tests the creation and configuration of date metadata
 * Verifies that:
 * - Date metadata can be added to a model
 * - Date format settings can be configured
 * - Date validation rules can be set properly
 */
test("Date metadata creating and updating has succeeded", async ({ page }) => {
  await createDateMetadata(page);
});

/**
 * Tests the editing capabilities of existing date metadata
 * Verifies that:
 * - Existing date metadata can be modified
 * - Date formats can be updated
 * - Date validation settings can be changed
 */
test("Date metadata editing has succeeded", async ({ page }) => {
  test.slow();
  await editDateMetadata(page);
});
