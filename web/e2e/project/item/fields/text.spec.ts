import { test, expect } from "@reearth-cms/e2e/fixtures/test";
import { createModelFromOverview } from "@reearth-cms/e2e/project/utils/model";
import { createProject, deleteProject } from "@reearth-cms/e2e/project/utils/project";

test.beforeEach(async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
  await createModelFromOverview(page);
});

test.afterEach(async ({ page }) => {
  await deleteProject(page);
});

test("Text field editing has succeeded", async ({
  page,
  fieldEditorPage,
  contentPage,
  itemEditorPage,
}) => {
  // Create initial field
  await fieldEditorPage.createField("Text", "text1", "text1", "text1 description");
  await fieldEditorPage.setDefaultValue("text1 default value");
  await fieldEditorPage.confirmFieldConfiguration();
  await fieldEditorPage.expectFieldInList("text1", "text1");

  // Test content creation
  await contentPage.navigateToContentTab();
  await expect(page.locator("thead")).toContainText("text1");
  await contentPage.createNewItem();
  await itemEditorPage.expectFieldVisible("text1");
  await itemEditorPage.expectFieldValue("text1", "text1 default value");
  await itemEditorPage.saveItem();
  await itemEditorPage.goBack();
  await expect(page.locator("tbody")).toContainText("text1 default value");

  // Edit field with advanced settings
  await contentPage.navigateToSchemaTab();
  await fieldEditorPage.editField();
  await fieldEditorPage.setSupportMultipleValues(true);
  await fieldEditorPage.setUseAsTitle(true);
  await fieldEditorPage.setFieldSettings("new text1", "new-text1", "new text1 description");
  await fieldEditorPage.setValidationOptions(true, true, "5");

  await fieldEditorPage.switchToTab("Default value");
  await fieldEditorPage.setMultipleValues(["text1", "text2"]);
  await fieldEditorPage.reorderDefaultValues(0, "down");
  await expect(page.locator("#defaultValue").nth(1)).toHaveValue("text1");
  await fieldEditorPage.confirmFieldConfiguration();

  await fieldEditorPage.expectFieldInList("new text1", "new-text1", ["required", "unique"]);

  // Test updated field in content
  await contentPage.navigateToContentTab();
  await expect(page.locator("thead")).toContainText("new text1");
  await itemEditorPage.expectCellValue("text1 default value");

  await contentPage.createNewItem();
  await expect(page.getByText("new text1(unique)")).toBeVisible();
  await itemEditorPage.expectMultipleValues(["text2", "text1"]);
  await itemEditorPage.saveItem();
  await itemEditorPage.goBack();

  await itemEditorPage.clickMultipleValueButton(2);
  await expect(page.getByRole("main")).toContainText("new text1text2text1");
});
