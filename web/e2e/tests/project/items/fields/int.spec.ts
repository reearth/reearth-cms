import { SchemaFieldType } from "@reearth-cms/components/molecules/Schema/types";
import { expect, TAG, test } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";

test.beforeEach(async ({ projectPage }) => {
  await projectPage.goto("/", { waitUntil: "domcontentloaded" });
  const projectName = getId();
  await projectPage.createProject(projectName);
  await projectPage.gotoProject(projectName);
  await projectPage.createModelFromOverview();
});

test.afterEach(async ({ projectPage }) => {
  await projectPage.deleteProject();
});

test(
  "Int field creating and updating has succeeded",
  { tag: TAG.SMOKE },
  async ({ fieldEditorPage, projectPage, contentPage, schemaPage }) => {
    await test.step("Create int field with settings", async () => {
      await fieldEditorPage.createField({
        type: SchemaFieldType.Integer,
        name: "int1",
        key: "int1",
        description: "int1 description",
      });
      await expect(schemaPage.fieldsContainer.getByRole("paragraph")).toContainText("int1#int1");
    });

    await test.step("Create item with int value", async () => {
      await projectPage.contentMenuItem.click();
      await contentPage.newItemButton.click();
      await expect(contentPage.firstLabel).toContainText("int1");
      await expect(contentPage.mainRole).toContainText("int1 description");
      await contentPage.fieldInput("int1").click();
      await contentPage.fieldInput("int1").fill("1");
      await contentPage.saveButton.click();
      await contentPage.closeNotification();
      await contentPage.backButtonLabel.click();
      await expect(contentPage.cellByTextExact("1")).toBeVisible();
    });

    await test.step("Update int value", async () => {
      await contentPage.cellEditButton.click();
      await expect(contentPage.fieldInput("int1")).toHaveValue("1");
      await contentPage.fieldInput("int1").click();
      await contentPage.fieldInput("int1").fill("2");
      await contentPage.saveButton.click();
      await contentPage.closeNotification();
      await contentPage.backButtonLabel.click();
      await expect(contentPage.cellByTextExact("2")).toBeVisible();
    });
  },
);

test("Int field editing has succeeded", async ({ fieldEditorPage, contentPage, schemaPage }) => {
  await test.step("Create int field with default value", async () => {
    await fieldEditorPage.createField({
      type: SchemaFieldType.Integer,
      name: "int1",
      key: "int1",
      description: "int1 description",
      defaultValue: "1",
    });
  });

  await test.step("Verify field in content and create item with default value", async () => {
    await schemaPage.contentText.click();
    await expect(contentPage.tableHead).toContainText("int1");
    await contentPage.newItemButton.click();
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
    await contentPage.backButtonLabel.click();
    await expect(contentPage.cellByTextExact("1")).toBeVisible();
  });
  await test.step("Update field with multiple values and validations", async () => {
    await schemaPage.schemaText.click();
    await fieldEditorPage.ellipsisMenuButton.click();
    await fieldEditorPage.settingsTab.click();
    await fieldEditorPage.displayNameInput.click();
    await fieldEditorPage.displayNameInput.fill("new int1");
    await fieldEditorPage.fieldKeyInput.click();
    await fieldEditorPage.fieldKeyInput.fill("new-int1");
    await fieldEditorPage.descriptionInput.click();
    await fieldEditorPage.descriptionInput.fill("new int1 description");
    await fieldEditorPage.supportMultipleValuesCheckbox.check();
    await expect(fieldEditorPage.useAsTitleCheckbox).toBeHidden();
  });

  await test.step("Configure min/max validation with value range checks", async () => {
    await fieldEditorPage.validationTab.click();
    await fieldEditorPage.minValueInput.click();
    await fieldEditorPage.minValueInput.fill("10");
    await fieldEditorPage.maxValueInput.click();
    await fieldEditorPage.maxValueInput.fill("2");
    await expect(fieldEditorPage.okButton).toBeDisabled();
    await fieldEditorPage.minValueInput.click();
    await fieldEditorPage.minValueInput.fill("2");
    await fieldEditorPage.maxValueInput.click();
    await fieldEditorPage.maxValueInput.fill("10");
    await fieldEditorPage.requiredFieldCheckbox.check();
    await fieldEditorPage.uniqueFieldCheckbox.check();
  });

  await test.step("Update default values with validation checks", async () => {
    await fieldEditorPage.defaultValueTab.click();
    await expect(fieldEditorPage.setDefaultValueInput).toBeVisible();
    await expect(fieldEditorPage.setDefaultValueInput).toHaveValue("1");
    await expect(fieldEditorPage.okButton).toBeDisabled();
    await fieldEditorPage.setDefaultValueInput.click();
    await fieldEditorPage.setDefaultValueInput.fill("11");
    await expect(fieldEditorPage.okButton).toBeDisabled();
    await fieldEditorPage.setDefaultValueInput.click();
    await fieldEditorPage.setDefaultValueInput.fill("2");
    await fieldEditorPage.plusNewButton.click();
    await fieldEditorPage.defaultValueInputByIndex(1).click();
    await fieldEditorPage.defaultValueInputByIndex(1).fill("3");
    await fieldEditorPage.okButton.click();
    await contentPage.closeNotification();
    await expect(fieldEditorPage.uniqueFieldText("new int1", "new-int1")).toBeVisible();
  });

  await test.step("Verify updated field in content with multiple values", async () => {
    await schemaPage.contentText.click();
    await expect(contentPage.tableHead).toContainText("new int1");
    await expect(contentPage.cellByTextExact("1")).toBeVisible();
    await contentPage.newItemButton.click();
    await expect(fieldEditorPage.uniqueFieldLabel("new int1")).toBeVisible();
    await expect(contentPage.spinButtonByIndex(0)).toHaveValue("2");
    await expect(contentPage.spinButtonByIndex(1)).toHaveValue("3");
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
    await contentPage.backButtonLabel.click();
    await contentPage.x2Button.click();
    await expect(contentPage.tooltip).toContainText("new int123");
  });
});
