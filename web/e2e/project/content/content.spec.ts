import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { crudComment } from "@reearth-cms/e2e/project/utils/comment";
import { handleFieldForm } from "@reearth-cms/e2e/project/utils/field";
import { createModel } from "@reearth-cms/e2e/project/utils/model";
import { createProject, deleteProject } from "@reearth-cms/e2e/project/utils/project";
import { expect, test } from "@reearth-cms/e2e/utils";

// import {
//   CRUDandSearching,
//   PublishingAndUnpublishingFromEdit,
//   PublishingAndUnpublishingFromTable,
//   ShowingItemTitle,
//   CommentCRUDOnEditPage,
//   CommentCRUDonContentPage,
// } from "./content";

/**
 * Setup: Before each test, create a fresh environment
 * - Navigates to the root page
 * - Creates a new project
 * - Creates a new model within the project
 */
test.beforeEach(async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject( page);
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
 * Tests basic CRUD operations and search functionality
 * Verifies that content items can be created, read, updated,
 * deleted, and found through search
 */
test("Item CRUD and searching has succeeded", async ({ page }) => {
  await page.locator("li").filter({ hasText: "Text" }).locator("div").first().click();
  await handleFieldForm(page, "text");
  await page.getByText("Content").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByLabel("text").click();
  await page.getByLabel("text").fill("text");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await expect(page.getByRole("cell", { name: "text", exact: true })).toBeVisible();
  await page.getByPlaceholder("input search text").click();
  await page.getByPlaceholder("input search text").fill("no field");
  await page.getByRole("button", { name: "search" }).click();
  await expect(page.getByRole("cell", { name: "text", exact: true })).toBeHidden();
  await page.getByPlaceholder("input search text").fill("");
  await page.getByRole("button", { name: "search" }).click();
  await expect(page.getByRole("cell", { name: "text", exact: true })).toBeVisible();
  await page.getByRole("cell").getByLabel("edit").locator("svg").click();
  await page.getByLabel("text").click();

  await page.getByLabel("text").click();
  await page.getByLabel("text").fill("new text");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await expect(page.getByRole("cell", { name: "new text" })).toBeVisible();
  await page.getByLabel("", { exact: true }).check();
  await page.getByText("Delete").click();
  await closeNotification(page);
  await expect(page.getByRole("cell", { name: "new text" })).toBeHidden();
});

/**
 * Tests publishing workflow from the edit page
 * Verifies that content items can be published and unpublished
 * directly from the editing interface
 */
test("Publishing and Unpublishing item from edit page has succeeded", async ({ page }) => {
  await page.locator("li").filter({ hasText: "Text" }).locator("div").first().click();
  await handleFieldForm(page, "text");
  await page.getByText("Content").first().click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByLabel("text").click();
  await page.getByLabel("text").fill("text");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await expect(page.getByText("DRAFT")).toBeVisible();
  await page.getByRole("button", { name: "Publish" }).click();
  await closeNotification(page);
  await expect(page.getByText("PUBLIC")).toBeVisible();
  await page.getByLabel("Back").click();
  await expect(page.getByText("PUBLIC")).toBeVisible();
  await page.getByRole("cell").getByLabel("edit").locator("svg").click();
  await expect(page.getByText("PUBLIC")).toBeVisible();
  await page.getByRole("button", { name: "ellipsis" }).click();
  await page.getByText("Unpublish").click();
  await closeNotification(page);
  await expect(page.getByText("DRAFT")).toBeVisible();
  await page.getByLabel("Back").click();
  await expect(page.getByText("DRAFT")).toBeVisible();
});

/**
 * Tests publishing workflow from the table view
 * Verifies that content items can be published and unpublished
 * from the content listing table
 */
test("Publishing and Unpublishing item from table has succeeded", async ({ page }) => {
  await page.locator("li").filter({ hasText: "Text" }).locator("div").first().click();
  await handleFieldForm(page, "text");
  await page.getByText("Content").first().click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByLabel("text").click();
  await page.getByLabel("text").fill("text");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await expect(page.getByText("DRAFT")).toBeVisible();
  await page.getByLabel("Back").click();
  await expect(page.getByText("DRAFT")).toBeVisible();
  await page.getByLabel("", { exact: true }).check();
  await page.getByText("Publish", { exact: true }).click();
  await page.getByRole("button", { name: "Yes" }).click();
  await closeNotification(page);
  await expect(page.getByText("PUBLIC")).toBeVisible();
  await page.getByText("Unpublish").click();
  await closeNotification(page);
  await expect(page.getByText("DRAFT")).toBeVisible();
  await page.getByRole("cell").getByLabel("edit").locator("svg").click();
  await expect(page.getByText("DRAFT")).toBeVisible();
});

/**
 * Tests item title display functionality
 * Verifies that content item titles are correctly shown
 * across different views and contexts
 */
test("Showing item title has succeeded", async ({ page }) => {
  await page.locator("li").filter({ hasText: "Text" }).locator("div").first().click();
  await handleFieldForm(page, "text");
  await page.getByText("Content").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.getByTitle("e2e model name", { exact: true })).toBeVisible();
  await page.getByLabel("text").click();
  await page.getByLabel("text").fill("text");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  const itemId = await page
    .getByRole("main")
    .locator("p")
    .filter({ hasText: "ID" })
    .locator("div > span")
    .innerText();
  await expect(page.getByTitle(`e2e model name / ${itemId}`, { exact: true })).toBeVisible();

  await page.getByText("Schema").click();
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  await page.getByLabel("Use as title").check();
  await page.getByRole("tab", { name: "Default value" }).click();
  await page.getByLabel("Set default value").click();
  await page.getByLabel("Set default value").fill("default text");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);

  await page.getByText("Content").click();
  await page.getByRole("cell").getByLabel("edit").locator("svg").click();
  await expect(page.getByTitle(`e2e model name / text`, { exact: true })).toBeVisible();
  await page.getByLabel("Back").click();

  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.getByTitle("e2e model name", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await expect(page.getByTitle(`e2e model name / default text`, { exact: true })).toBeVisible();
});

/**
 * Tests comment functionality on the content listing page
 * Verifies that comments can be created, read, updated,
 * and deleted from the content view
 */
test("Comment CRUD on Content page has succeeded", async ({ page }) => {
  await page.locator("li").filter({ hasText: "Text" }).locator("div").first().click();
  await handleFieldForm(page, "text");
  await page.getByText("Content").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByLabel("text").click();
  await page.getByLabel("text").fill("text");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);

  await page.getByLabel("Back").click();

  await page.getByRole("button", { name: "0" }).click();
  await expect(page.getByText("CommentsNo comments.0 / 1000Comment")).toBeVisible();
  await crudComment(page);
});

/**
 * Tests comment functionality on the item edit page
 * Verifies that comments can be created, read, updated,
 * and deleted while editing content items
 */
test("Comment CRUD on edit page has succeeded", async ({ page }) => {
  await page.locator("li").filter({ hasText: "Text" }).locator("div").first().click();
  await handleFieldForm(page, "text");
  await page.getByText("Content").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByLabel("text").click();
  await page.getByLabel("text").fill("text");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("comment").click();
  await expect(page.getByText("Comments0 / 1000Comment")).toBeVisible();
  await crudComment(page);
});
