import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { crudComment } from "@reearth-cms/e2e/project/utils/comment";
import { handleFieldForm } from "@reearth-cms/e2e/project/utils/field";
import { createModelFromOverview } from "@reearth-cms/e2e/project/utils/model";
import { getId } from "@reearth-cms/e2e/utils/mock";

test.beforeEach(async ({ reearth, page, homePage, projectLayoutPage }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await homePage.createProject(getId());
  await projectLayoutPage.navigateToSchema();
  await createModelFromOverview(page);
});

test.afterEach(async ({ projectLayoutPage, projectSettingsPage }) => {
  await projectLayoutPage.navigateToSettings();
  await projectSettingsPage.deleteProject();
});

test("Item CRUD and searching has succeeded", async ({
  page,
  fieldEditorPage,
  contentPage,
  itemEditorPage,
}) => {
  // Create text field
  await fieldEditorPage.createField("Text", "text", "text");
  await fieldEditorPage.confirmFieldConfiguration();

  // Create content item
  await contentPage.contentTab.click();
  await contentPage.newItemButton.click();
  await itemEditorPage.fillTextField("text", "text");
  await itemEditorPage.saveItem();
  await itemEditorPage.goBack();
  await itemEditorPage.expectCellValue("text");

  // Search: no match
  await contentPage.searchInput.fill("no field");
  await contentPage.searchButton.click();
  await itemEditorPage.expectCellValue("text"); // your helper checks visibility state
  // Clear search
  await contentPage.searchInput.fill("");
  await contentPage.searchButton.click();
  await itemEditorPage.expectCellValue("text");

  // Edit item
  await itemEditorPage.editCellByIndex(0);
  await itemEditorPage.expectFieldValue("text", "text");
  await itemEditorPage.fillTextField("text", "new text");
  await itemEditorPage.saveItem();
  await itemEditorPage.goBack();
  await itemEditorPage.expectCellValue("new text");

  // Delete item (table)
  await contentPage.selectRowCheckbox.check();
  await page.getByText("Delete").click();
  await closeNotification(page);
  await itemEditorPage.expectCellValue("new text"); // hidden after deletion (your helper asserts)
});

test("Publishing and Unpublishing item from edit page has succeeded", async ({
  fieldEditorPage,
  contentPage,
  itemEditorPage,
}) => {
  // Create text field
  await fieldEditorPage.createField("Text", "text", "text");
  await fieldEditorPage.confirmFieldConfiguration();

  // Create content item
  await contentPage.contentTab.click();
  await contentPage.newItemButton.click();
  await itemEditorPage.fillTextField("text", "text");
  await itemEditorPage.saveItem();
  await expect(contentPage.draftChip).toBeVisible();

  // Publish from edit page
  await itemEditorPage.publishItem();
  await expect(contentPage.publishedChip).toBeVisible();
  await itemEditorPage.goBack();
  await expect(contentPage.publishedChip).toBeVisible();

  // Unpublish from edit page
  await itemEditorPage.editCellByIndex(0);
  await expect(contentPage.publishedChip).toBeVisible();
  await itemEditorPage.unpublishItem();
  await expect(contentPage.draftChip).toBeVisible();
  await itemEditorPage.goBack();
  await expect(contentPage.draftChip).toBeVisible();
});

test("Publishing and Unpublishing item from table has succeeded", async ({
  page,
  fieldEditorPage,
  contentPage,
  itemEditorPage,
}) => {
  // Create text field
  await fieldEditorPage.createField("Text", "text", "text");
  await fieldEditorPage.confirmFieldConfiguration();

  // Create content item
  await contentPage.contentTab.click();
  await contentPage.newItemButton.click();
  await itemEditorPage.fillTextField("text", "text");
  await itemEditorPage.saveItem();
  await expect(contentPage.draftChip).toBeVisible();
  await itemEditorPage.goBack();
  await expect(contentPage.draftChip).toBeVisible();

  // Publish from table
  await contentPage.selectRowCheckbox.check();
  await contentPage.publishButton.click();
  await closeNotification(page);
  await expect(contentPage.publishedChip).toBeVisible();

  // Unpublish from table
  await contentPage.selectRowCheckbox.check();
  await contentPage.unpublishButton.click();
  await closeNotification(page);
  await expect(contentPage.draftChip).toBeVisible();

  // Verify status in edit page
  await itemEditorPage.editCellByIndex(0);
  await expect(contentPage.draftChip).toBeVisible();
});

test("Showing item title has succeeded", async ({ page, contentPage }) => {
  // Create model field via UI helpers (schema-side)
  await page.locator("li").filter({ hasText: "Text" }).locator("div").first().click();
  await handleFieldForm(page, "text");

  // Create item
  await contentPage.contentTab.click();
  await contentPage.newItemButton.click();
  await expect(page.getByTitle("e2e model name", { exact: true })).toBeVisible();
  await page.getByLabel("text").fill("text");
  await contentPage.saveButton.click();
  await closeNotification(page);

  const itemId = page.url().split("/").at(-1);
  await expect(page.getByTitle(`e2e model name / ${itemId}`, { exact: true })).toBeVisible();

  // Update title field behavior in Schema tab
  await contentPage.schemaTab.click();
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  await page.getByLabel("Use as title").check();
  await page.getByRole("tab", { name: "Default value" }).click();
  await page.getByLabel("Set default value").click();
  await page.getByLabel("Set default value").fill("default text");
  await contentPage.okButton.click();
  await closeNotification(page);

  // Verify titles with existing and default value
  await contentPage.contentTab.click();
  await page.getByRole("cell").getByLabel("edit").locator("svg").click();
  await expect(page.getByTitle(`e2e model name / text`, { exact: true })).toBeVisible();
  await page.getByLabel("Back").click();

  await contentPage.newItemButton.click();
  await expect(page.getByTitle("e2e model name", { exact: true })).toBeVisible();
  await contentPage.saveButton.click();
  await closeNotification(page);
  await expect(page.getByTitle(`e2e model name / default text`, { exact: true })).toBeVisible();
});

// eslint-disable-next-line playwright/expect-expect
test("Comment CRUD on Content page has succeeded", async ({ page, contentPage }) => {
  await page.locator("li").filter({ hasText: "Text" }).locator("div").first().click();
  await handleFieldForm(page, "text");

  await contentPage.contentTab.click();
  await contentPage.newItemButton.click();
  await page.getByLabel("text").fill("text");
  await contentPage.saveButton.click();
  await closeNotification(page);

  await page.getByLabel("Back").click();

  await contentPage.commentsCountButton(0).click();
  await crudComment(page);
});

// eslint-disable-next-line playwright/expect-expect
test("Comment CRUD on edit page has succeeded", async ({ page, contentPage }) => {
  await page.locator("li").filter({ hasText: "Text" }).locator("div").first().click();
  await handleFieldForm(page, "text");

  await contentPage.contentTab.click();
  await contentPage.newItemButton.click();
  await page.getByLabel("text").fill("text");
  await contentPage.saveButton.click();
  await closeNotification(page);

  await page.getByLabel("comment").click();
  await crudComment(page);
});
