/* eslint-disable playwright/expect-expect */

/**
 * End-to-end tests for URL metadata functionality in the CMS.
 * Tests the creation, updating, and editing of URL metadata fields.
 * Requires a project and model to be created before each test.
 */

import { createModel } from "@reearth-cms/e2e/project/utils/model";
import { createProject, deleteProject } from "@reearth-cms/e2e/project/utils/project";
import { test } from "@reearth-cms/e2e/utils";

import { URLMetadataCreatingAndUpdating, URLMetadataEditing } from "../fields/url";

/**
 * Before each test, navigate to the application root, create a project and model.
 */
test.beforeEach(async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
  await createModel(page);
});

/**
 * After each test, delete the project and associated data.
 */
test.afterEach(async ({ page }) => {
  await deleteProject(page);
});

/**
 * Test the creation and updating of URL metadata fields.
 * Verifies the ability to add and configure URL metadata.
 */
test("Url metadata creating and updating has succeeded", async ({ page }) => {
  await URLMetadataCreatingAndUpdating(page);
});

/**
 * Test the editing capabilities of existing URL metadata fields.
 * Uses slow test configuration due to complex interactions.
 */
test("Url metadata editing has succeeded", async ({ page }) => {
  test.slow();
  await URLMetadataEditing(page);
});
