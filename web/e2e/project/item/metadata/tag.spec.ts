/* eslint-disable playwright/expect-expect */

/**
 * End-to-end tests for Tag metadata functionality in the CMS.
 * Tests the creation, updating, and editing of tag metadata fields that handle
 * categorization and labeling capabilities in the metadata section.
 * Verifies proper tag management and association functionality.
 */

import { createModel } from "@reearth-cms/e2e/project/utils/model";
import { createProject, deleteProject } from "@reearth-cms/e2e/project/utils/project";
import { test } from "@reearth-cms/e2e/utils";

import { TagMetadataCreatingAndUpdating, TagMetadataEditing } from "./metadata";

/**
 * Setup: Before each test, create a fresh environment
 * - Navigates to the root page
 * - Creates a new project
 * - Creates a new model within the project
 * This ensures each test has a clean state for tag metadata testing
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
 * Tests the creation and configuration of tag metadata fields
 * Verifies that:
 * - Tag metadata fields can be added to a model
 * - Tag options can be configured
 * - Tag field properties can be set properly
 */
test("Tag metadata creating and updating has succeeded", async ({ page }) => {
  await TagMetadataCreatingAndUpdating(page);
});

/**
 * Tests the editing capabilities of existing tag metadata fields
 * Verifies that:
 * - Existing tags can be modified
 * - Tag associations can be updated
 * - UI reflects the current tag states correctly
 */
test("Tag metadata editing has succeeded", async ({ page }) => {
  await TagMetadataEditing(page);
});
