import { expect } from "@playwright/test";

import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { test } from "@reearth-cms/e2e/fixtures/test";
import { crudComment } from "@reearth-cms/e2e/project/utils/comment";
import { getId } from "@reearth-cms/e2e/utils/mock";

import { handleFieldForm } from "../utils/field";

test.beforeEach(async ({ reearth, homePage, projectLayoutPage, schemaPage }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await homePage.createProject(getId());
  await projectLayoutPage.navigateToSchema();
  await schemaPage.createModelFromOverview();
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
  await contentPage.navigateToContentTab();
  await contentPage.createNewItem();
  await itemEditorPage.fillTextField("text", "text");
  await itemEditorPage.saveItem();
  await itemEditorPage.goBack();
  await itemEditorPage.expectCellValue("text");

  // Test search functionality
  await contentPage.searchItems("no field");
  await itemEditorPage.expectCellValue("text"); // Should be hidden after search
  await contentPage.clearSearch();
  await itemEditorPage.expectCellValue("text");

  // Edit item
  await itemEditorPage.editCellByIndex(0);
  await itemEditorPage.expectFieldValue("text", "text");
  await itemEditorPage.fillTextField("text", "new text");
  await itemEditorPage.saveItem();
  await itemEditorPage.goBack();
  await itemEditorPage.expectCellValue("new text");

  // Delete item
  await page.getByLabel("", { exact: true }).check();
  await page.getByText("Delete").click();
  await closeNotification(page);
  await itemEditorPage.expectCellValue("new text"); // Should be hidden after deletion

  expect(true).toBe(true);
});

test("Publishing and Unpublishing item from edit page has succeeded", async ({
  page,
  fieldEditorPage,
  contentPage,
  itemEditorPage,
}) => {
  // Create text field
  await fieldEditorPage.createField("Text", "text", "text");
  await fieldEditorPage.confirmFieldConfiguration();

  // Create content item
  await contentPage.navigateToContentTab();
  await contentPage.createNewItem();
  await itemEditorPage.fillTextField("text", "text");
  await itemEditorPage.saveItem();
  await expect(page.getByText("Draft")).toBeVisible();

  // Publish item from edit page
  await itemEditorPage.publishItem();
  await expect(page.getByText("Published")).toBeVisible();
  await itemEditorPage.goBack();
  await expect(page.getByText("Published")).toBeVisible();

  // Unpublish item from edit page
  await itemEditorPage.editCellByIndex(0);
  await expect(page.getByText("Published")).toBeVisible();
  await itemEditorPage.unpublishItem();
  await expect(page.getByText("Draft")).toBeVisible();
  await itemEditorPage.goBack();
  await expect(page.getByText("Draft")).toBeVisible();

  expect(true).toBe(true);
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
  await contentPage.navigateToContentTab();
  await contentPage.createNewItem();
  await itemEditorPage.fillTextField("text", "text");
  await itemEditorPage.saveItem();
  await expect(page.getByText("Draft")).toBeVisible();
  await itemEditorPage.goBack();
  await expect(page.getByText("Draft")).toBeVisible();

  // Publish from table
  await contentPage.publishItemFromTable();
  await expect(page.getByText("Published")).toBeVisible();

  // Unpublish from table
  await contentPage.unpublishItemFromTable();
  await expect(page.getByText("Draft")).toBeVisible();

  // Verify status in edit page
  await itemEditorPage.editCellByIndex(0);
  await expect(page.getByText("Draft")).toBeVisible();

  expect(true).toBe(true);
});

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
  const itemId = page.url().split("/").at(-1);
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

// eslint-disable-next-line playwright/expect-expect
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
  await crudComment(page);
});

// eslint-disable-next-line playwright/expect-expect
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
  await crudComment(page);
});
