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

test("Boolean field creating and updating has succeeded", async ({
  fieldEditorPage,
  contentPage,
  itemEditorPage,
}) => {
  // Create boolean field
  await fieldEditorPage.createField("Boolean", "boolean1", "boolean1", "boolean1 description");
  await fieldEditorPage.confirmFieldConfiguration();
  await fieldEditorPage.expectFieldInList("boolean1", "boolean1");

  // Test content creation
  await contentPage.navigateToContentTab();
  await contentPage.createNewItem();
  await itemEditorPage.expectFieldVisible("boolean1");
  await itemEditorPage.expectFieldDescription("boolean1 description");

  await itemEditorPage.toggleBoolean("boolean1", true);
  await itemEditorPage.saveItem();
  await itemEditorPage.goBack();
  await itemEditorPage.expectBooleanState("", true);

  // Test editing
  await itemEditorPage.editCellByIndex(0);
  await itemEditorPage.expectBooleanState("", true);
  await itemEditorPage.toggleBoolean("boolean1", false);
  await itemEditorPage.saveItem();
  await itemEditorPage.goBack();
  await itemEditorPage.expectBooleanState("", false);
});

test("Boolean field editing has succeeded", async ({
  page,
  fieldEditorPage,
  contentPage,
  itemEditorPage,
}) => {
  // Create boolean field with default value
  await fieldEditorPage.createField("Boolean", "boolean1", "boolean1", "boolean1 description");
  await fieldEditorPage.setBooleanDefaultValue(true);
  await fieldEditorPage.confirmFieldConfiguration();

  // Test content with default value
  await contentPage.navigateToContentTab();
  await expect(page.locator("thead")).toContainText("boolean1");
  await contentPage.createNewItem();
  await itemEditorPage.expectBooleanState("", true);
  await itemEditorPage.saveItem();
  await itemEditorPage.goBack();
  await itemEditorPage.expectBooleanState("", true);

  // Edit field with advanced settings
  await contentPage.navigateToSchemaTab();
  await fieldEditorPage.editField();
  await fieldEditorPage.setFieldSettings(
    "new boolean1",
    "new-boolean1",
    "new boolean1 description",
  );
  await fieldEditorPage.setSupportMultipleValues(true);
  await fieldEditorPage.expectFieldHidden("Use as title");

  await fieldEditorPage.switchToTab("Validation");
  await fieldEditorPage.expectFieldDisabled("Make field required");
  await fieldEditorPage.expectFieldDisabled("Set field as unique");

  await fieldEditorPage.switchToTab("Default value");
  await expect(page.getByRole("switch").nth(0)).toHaveAttribute("aria-checked", "true");
  await page.getByRole("button", { name: "plus New" }).click();
  await expect(page.getByRole("switch").nth(1)).toHaveAttribute("aria-checked", "false");
  await fieldEditorPage.reorderDefaultValues(0, "down");
  await expect(page.getByRole("switch").nth(0)).toHaveAttribute("aria-checked", "false");
  await expect(page.getByRole("switch").nth(1)).toHaveAttribute("aria-checked", "true");
  await fieldEditorPage.confirmFieldConfiguration();

  await fieldEditorPage.expectFieldInList("new boolean1", "new-boolean1");

  // Test updated field in content
  await contentPage.navigateToContentTab();
  await expect(page.locator("thead")).toContainText("new boolean1");
  await expect(page.getByRole("switch", { name: "check" })).toBeVisible();

  await contentPage.createNewItem();
  await expect(page.getByRole("switch").nth(0)).toHaveAttribute("aria-checked", "false");
  await expect(page.getByRole("switch").nth(1)).toHaveAttribute("aria-checked", "true");
  await page.getByRole("button", { name: "plus New" }).click();
  await expect(page.getByRole("switch").nth(2)).toHaveAttribute("aria-checked", "false");
  await page.getByRole("button", { name: "arrow-up" }).nth(2).click();
  await itemEditorPage.saveItem();
  await itemEditorPage.goBack();

  await itemEditorPage.clickMultipleValueButton(3);
  await itemEditorPage.expectTooltipContains("new boolean1");
  await expect(page.getByRole("switch").nth(1)).toHaveAttribute("aria-checked", "false");
  await expect(page.getByRole("switch").nth(2)).toHaveAttribute("aria-checked", "false");
  await expect(page.getByRole("switch").nth(3)).toHaveAttribute("aria-checked", "true");
});
