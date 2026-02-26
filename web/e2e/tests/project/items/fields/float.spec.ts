import { SchemaFieldType } from "@reearth-cms/components/molecules/Schema/types";
import { expect, TAG, test } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";

const fieldName = "float1";
const fieldKey = "float1";
const fieldDescription = "float1 description";
const fieldHeader = "float1#float1";
const newFieldName = "new float1";
const newFieldKey = "new-float1";
const newFieldDescription = "new float1 description";
const defaultValue = "1.1";
const testValue1 = "1.1";
const testValue2 = "2.2";

test.beforeEach(async ({ projectPage }) => {
  await projectPage.goto("/");
  const projectName = getId();
  await projectPage.createProject(projectName);
  await projectPage.gotoProject(projectName);
  await projectPage.createModelFromOverview();
});

test.afterEach(async ({ projectPage }) => {
  await projectPage.deleteProject();
});

test("Float field creating and updating has succeeded", { tag: TAG.FIELD_VARIANT }, async ({
  fieldEditorPage,
  contentPage,
  schemaPage,
}) => {
  await fieldEditorPage.createField({
    type: SchemaFieldType.Number,
    name: fieldName,
    key: fieldKey,
    description: fieldDescription,
  });

  await expect(fieldEditorPage.fieldsContainerParagraph).toContainText(fieldHeader);
  await schemaPage.contentText.click();
  await contentPage.newItemButton.click();
  await expect(contentPage.firstLabel).toContainText(fieldName);
  await expect(contentPage.mainRole).toContainText(fieldDescription);
  await contentPage.fieldInput(fieldName).click();
  await contentPage.fieldInput(fieldName).fill(testValue1);
  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  await contentPage.backButtonLabel.click();
  await expect(contentPage.cellByTextExact(testValue1)).toBeVisible();

  await contentPage.cellEditButton.click();
  await expect(contentPage.fieldInput(fieldName)).toHaveValue(testValue1);
  await contentPage.fieldInput(fieldName).click();
  await contentPage.fieldInput(fieldName).fill(testValue2);
  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  await contentPage.backButtonLabel.click();
  await expect(contentPage.cellByTextExact(testValue2)).toBeVisible();
});

test("Float field editing has succeeded", { tag: TAG.FIELD_VARIANT }, async ({ fieldEditorPage, contentPage, schemaPage }) => {
  await fieldEditorPage.createField({
    type: SchemaFieldType.Number,
    name: fieldName,
    key: fieldKey,
    description: fieldDescription,
    defaultValue: defaultValue,
  });

  await schemaPage.contentText.click();
  await expect(contentPage.tableHead).toContainText(fieldName);
  await contentPage.newItemButton.click();
  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  await contentPage.backButtonLabel.click();
  await expect(contentPage.cellByTextExact(defaultValue)).toBeVisible();

  await schemaPage.schemaText.click();
  // TODO(editField): cannot migrate — interleaved okButton.toBeDisabled assertions (validation range checks)
  await fieldEditorPage.ellipsisMenuButton.click();
  await fieldEditorPage.settingsTab.click();
  await fieldEditorPage.displayNameInput.click();
  await fieldEditorPage.displayNameInput.fill(newFieldName);
  await fieldEditorPage.fieldKeyInput.click();
  await fieldEditorPage.fieldKeyInput.fill(newFieldKey);
  await fieldEditorPage.descriptionInput.click();
  await fieldEditorPage.descriptionInput.fill(newFieldDescription);
  await fieldEditorPage.supportMultipleValuesCheckbox.check();
  await expect(fieldEditorPage.useAsTitleCheckbox).toBeHidden();
  await fieldEditorPage.validationTab.click();
  await fieldEditorPage.minValueInput.click();
  await fieldEditorPage.minValueInput.fill("10.1");
  await fieldEditorPage.maxValueInput.click();
  await fieldEditorPage.maxValueInput.fill("2.1");
  await expect(fieldEditorPage.okButton).toBeDisabled();
  await fieldEditorPage.minValueInput.click();
  await fieldEditorPage.minValueInput.fill("2.1");
  await fieldEditorPage.maxValueInput.click();
  await fieldEditorPage.maxValueInput.fill("10.1");
  await fieldEditorPage.requiredFieldCheckbox.check();
  await fieldEditorPage.uniqueFieldCheckbox.check();
  await fieldEditorPage.defaultValueTab.click();
  await expect(fieldEditorPage.setDefaultValueInput).toBeVisible();
  await expect(fieldEditorPage.setDefaultValueInput).toHaveValue(defaultValue);
  await expect(fieldEditorPage.okButton).toBeDisabled();
  await fieldEditorPage.setDefaultValueInput.click();
  await fieldEditorPage.setDefaultValueInput.fill("11.1");
  await expect(fieldEditorPage.okButton).toBeDisabled();
  await fieldEditorPage.setDefaultValueInput.click();
  await fieldEditorPage.setDefaultValueInput.fill(testValue2);
  await fieldEditorPage.plusNewButton.click();
  await fieldEditorPage.defaultValueInputByIndex(1).click();
  await fieldEditorPage.defaultValueInputByIndex(1).fill("3.3");
  await fieldEditorPage.okButton.click();
  await contentPage.closeNotification();
  // TODO(editField): end migration block

  await expect(fieldEditorPage.uniqueFieldText(newFieldName, newFieldKey)).toBeVisible();
  await schemaPage.contentText.click();
  await expect(contentPage.tableHead).toContainText(newFieldName);
  await expect(contentPage.cellByTextExact(defaultValue)).toBeVisible();
  await contentPage.newItemButton.click();
  await expect(fieldEditorPage.uniqueFieldLabel(newFieldName)).toBeVisible();
  await expect(contentPage.spinButtonByIndex(0)).toHaveValue(testValue2);
  await expect(contentPage.spinButtonByIndex(1)).toHaveValue("3.3");
  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  await contentPage.backButtonLabel.click();
  await contentPage.x2Button.click();
  await expect(contentPage.tooltip).toContainText("new float12.23.3");
});
