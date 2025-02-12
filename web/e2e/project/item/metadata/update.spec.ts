/* eslint-disable playwright/expect-expect */

/**
 * End-to-end tests for metadata update functionality in the CMS.
 * Tests the updating of metadata fields after they have been added to existing items,
 * verifying proper handling of metadata modifications and state persistence.
 */

import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { handleFieldForm } from "@reearth-cms/e2e/project/utils/field";
import { createModel } from "@reearth-cms/e2e/project/utils/model";
import { createProject, deleteProject } from "@reearth-cms/e2e/project/utils/project";
import { expect, test } from "@reearth-cms/e2e/utils";

/**
 * Setup: Before each test, create a fresh environment
 * - Navigates to the root page
 * - Creates a project and model
 * - Adds initial fields and creates an item
 * - Configures metadata fields
 */
test.beforeEach(async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
  await createModel(page);
  await page.locator("li").filter({ hasText: "Text" }).locator("div").first().click();
  await handleFieldForm(page, "text");
  await page.getByText("Content").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByText("Schema").click();
  await page.getByRole("tab", { name: "Meta Data" }).click();
  await page.locator("li").filter({ hasText: "Boolean" }).locator("div").first().click();
  await handleFieldForm(page, "boolean");
  await page.getByText("Content").click();
});

/**
 * Cleanup: After each test, remove all test data
 * by deleting the created project and its associated metadata
 */
test.afterEach(async ({ page }) => {
  await deleteProject(page);
});

/**
 * Tests updating metadata from the table view
 * Verifies that:
 * - Metadata can be modified directly from the table
 * - Changes are persisted correctly
 * - UI updates reflect the modifications
 */
test("Updating metadata added later from table has succeeded", async ({ page }) => {
  await page.getByRole("switch").click();
  await closeNotification(page);
  await page.getByRole("switch").click();
  await closeNotification(page);
  await page.getByRole("switch").click();
  await closeNotification(page);
  await page.getByRole("cell").getByLabel("edit").locator("svg").click();
  await expect(page.getByLabel("boolean")).toHaveAttribute("aria-checked", "true");
});

/**
 * Tests updating metadata from the edit page
 * Verifies that:
 * - Metadata can be modified from the item edit view
 * - Changes are saved properly
 * - UI state reflects the updates correctly
 */
test("Updating metadata added later from edit page has succeeded", async ({ page }) => {
  await page.getByRole("cell").getByLabel("edit").locator("svg").click();
  await page.getByLabel("boolean").click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await expect(page.getByRole("switch")).toHaveAttribute("aria-checked", "true");
});
