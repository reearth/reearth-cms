/* eslint-disable playwright/expect-expect */

/**
 * End-to-end tests for Markdown field functionality in the CMS.
 * Tests the creation and editing of markdown fields that support
 * rich text formatting using markdown syntax.
 */

import { createModel } from "@reearth-cms/e2e/project/utils/model";
import { createProject, deleteProject } from "@reearth-cms/e2e/project/utils/project";
import { test } from "@reearth-cms/e2e/utils";

import { MarkdownFieldCreating,  MarkdownFieldCreatingNewItem, MarkdownFieldUpdating } from "./group";

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
 * Tests the creation and editing of markdown fields
 * Verifies that markdown content can be entered and formatted correctly
 */
test("Markdown field editing has succeeded", async ({ page }) => {
  await MarkdownFieldCreating(page);
  await MarkdownFieldUpdating(page);
  await MarkdownFieldCreatingNewItem(page);
});
