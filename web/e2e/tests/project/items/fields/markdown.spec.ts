import { SchemaFieldType } from "@reearth-cms/components/molecules/Schema/types";
import { expect, TAG, test } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";

const fieldName = "text1";
const fieldKey = "text1";
const fieldDescription = "text1 description";
const defaultValue = "text1 default value";
const newFieldName = "new text1";
const newFieldKey = "new-text1";
const newFieldDescription = "new text1 description";
const testValue2 = "text2";

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

test("Markdown field editing has succeeded", { tag: TAG.FIELD_VARIANT }, async ({
  fieldEditorPage,
  contentPage,
  schemaPage,
}) => {
  await fieldEditorPage.createField({
    type: SchemaFieldType.MarkdownText,
    name: fieldName,
    key: fieldKey,
    description: fieldDescription,
    defaultValue,
  });
  await expect(fieldEditorPage.fieldText(fieldName, fieldKey)).toBeVisible();
  await fieldEditorPage.ellipsisMenuButton.click();
  await expect(fieldEditorPage.displayNameInput).toBeVisible();
  await expect(fieldEditorPage.displayNameInput).toHaveValue(fieldName);
  await expect(fieldEditorPage.fieldKeyInput).toHaveValue(fieldKey);
  await expect(fieldEditorPage.descriptionInput).toHaveValue(fieldDescription);
  await expect(fieldEditorPage.supportMultipleValuesCheckbox).not.toBeChecked();
  await expect(fieldEditorPage.useAsTitleCheckbox).not.toBeChecked();
  await fieldEditorPage.validationTab.click();
  await expect(fieldEditorPage.maxLengthInput).toBeEmpty();
  await expect(fieldEditorPage.requiredFieldCheckbox).not.toBeChecked();
  await expect(fieldEditorPage.uniqueFieldCheckbox).not.toBeChecked();
  await fieldEditorPage.defaultValueTab.click();
  await expect(fieldEditorPage.setDefaultValueInput).toHaveValue(defaultValue);
  await fieldEditorPage.cancelButton.click();
  await schemaPage.contentText.click();
  await expect(contentPage.tableHead).toContainText(fieldName);
  await contentPage.newItemButton.click();
  await expect(contentPage.getByText(fieldName, { exact: true })).toBeVisible();
  await expect(contentPage.mainRole).toContainText(fieldDescription);
  await expect(contentPage.getByText(defaultValue).last()).toBeVisible();
  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  await contentPage.backButtonLabel.click();
  await contentPage.tableColumnButton(5).click();
  await expect(contentPage.tooltip).toContainText("text1text1 default value");
  await schemaPage.schemaText.click();
  // TODO(editField): cannot migrate — interleaved reorder assertions
  await fieldEditorPage.ellipsisMenuButton.click();
  await fieldEditorPage.supportMultipleValuesCheckbox.check();
  await fieldEditorPage.useAsTitleCheckbox.check();
  await fieldEditorPage.displayNameInput.click();
  await fieldEditorPage.displayNameInput.fill(newFieldName);
  await fieldEditorPage.fieldKeyInput.click();
  await fieldEditorPage.fieldKeyInput.fill(newFieldKey);
  await fieldEditorPage.descriptionInput.click();
  await fieldEditorPage.descriptionInput.fill(newFieldDescription);
  await fieldEditorPage.validationTab.click();
  await fieldEditorPage.maxLengthInput.click();
  await fieldEditorPage.maxLengthInput.fill("5");
  await fieldEditorPage.requiredFieldCheckbox.check();
  await fieldEditorPage.uniqueFieldCheckbox.check();
  await fieldEditorPage.defaultValueTab.click();
  await expect(fieldEditorPage.setDefaultValueInput).toHaveValue(defaultValue);
  await fieldEditorPage.plusNewButton.click();
  await fieldEditorPage.secondTextContainer.click();
  await fieldEditorPage.lastTextbox.fill(testValue2);
  await fieldEditorPage.firstTextContainer.click();
  await fieldEditorPage.lastTextbox.fill("text1");
  await fieldEditorPage.firstArrowDownButton.click();
  await expect(fieldEditorPage.secondTextContainer).toContainText("text1");
  await fieldEditorPage.okButton.click();
  await contentPage.closeNotification();
  // TODO(editField): end migration block
  await expect(fieldEditorPage.uniqueFieldText(newFieldName, newFieldKey)).toBeVisible();
  await schemaPage.contentText.click();
  await expect(contentPage.tableHead).toContainText(newFieldName);
  await contentPage.tableColumnButton(5).click();
  await expect(contentPage.tooltip).toContainText("text1text1 default value");
  await contentPage.newItemButton.click();
  await expect(fieldEditorPage.uniqueFieldLabel(newFieldName)).toBeVisible();
  await contentPage.fieldDescriptionText(newFieldDescription).click();
  await expect(contentPage.fieldDescriptionText(newFieldDescription)).toBeVisible();
  await expect(contentPage.firstTextContainer).toContainText(testValue2);
  await expect(contentPage.secondTextContainer).toContainText("text1");
  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  await contentPage.backButtonLabel.click();
  await contentPage.x2Button.click();
  await expect(contentPage.mainRole).toContainText("new text1text2text1");
  await contentPage.cellByIndex(1).click();
  await expect(fieldEditorPage.uniqueFieldLabel(newFieldName)).toBeVisible();
  await fieldEditorPage.deleteButton.first().click();
  await expect(contentPage.pleaseInputFieldText).toBeVisible();
  await fieldEditorPage.plusNewButton.click();
  await expect(contentPage.saveButton).toBeDisabled();
  await contentPage.firstTextContainer.click();
  await contentPage.lastTextbox.fill("text");
  await fieldEditorPage.plusNewButton.click();
  await fieldEditorPage.plusNewButton.click();
  await contentPage.secondTextContainer.click();
  await contentPage.lastTextbox.fill(testValue2);
  await fieldEditorPage.arrowUpButtonByIndex(1).click();
  await expect(contentPage.firstTextContainer).toContainText(testValue2);
  await expect(contentPage.secondTextContainer).toContainText("text");
  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  await contentPage.backButtonLabel.click();
  await contentPage.getByRole("button", { name: "x2" }).nth(1).click();
  await expect(contentPage.mainRole).toContainText("new text1text2text");
});
