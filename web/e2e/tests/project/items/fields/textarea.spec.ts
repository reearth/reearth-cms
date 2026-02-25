import { SchemaFieldType } from "@reearth-cms/components/molecules/Schema/types";
import { expect, test } from "@reearth-cms/e2e/fixtures/test";
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

test("Textarea field editing has succeeded", async ({
  fieldEditorPage,
  contentPage,
  schemaPage,
}) => {
  await fieldEditorPage.createField({
    type: SchemaFieldType.TextArea,
    name: fieldName,
    key: fieldKey,
    description: fieldDescription,
    defaultValue,
  });
  await expect(fieldEditorPage.fieldText(fieldName, fieldKey)).toBeVisible();
  await fieldEditorPage.ellipsisMenuButton.click();
  await expect(fieldEditorPage.displayNameInput).toBeVisible();
  await expect(fieldEditorPage.displayNameInput).toHaveValue(fieldName);
  await expect(fieldEditorPage.settingsKeyInput).toHaveValue(fieldKey);
  await expect(fieldEditorPage.settingsDescriptionInput).toHaveValue(fieldDescription);
  await expect(fieldEditorPage.supportMultipleValuesCheckbox).not.toBeChecked();
  await expect(fieldEditorPage.useAsTitleCheckbox).not.toBeChecked();
  await fieldEditorPage.validationTab.click();
  await expect(fieldEditorPage.maxLengthInput).toBeEmpty();
  await expect(fieldEditorPage.requiredFieldCheckbox).not.toBeChecked();
  await expect(fieldEditorPage.uniqueFieldCheckbox).not.toBeChecked();
  await fieldEditorPage.defaultValueTab.click();
  await expect(fieldEditorPage.defaultValueTextInput).toHaveValue(defaultValue);
  await fieldEditorPage.cancelButton.click();
  await schemaPage.contentText.click();
  await expect(contentPage.tableHead).toContainText(fieldName);
  await contentPage.newItemButton.click();
  await expect(contentPage.firstLabel).toContainText(fieldName);
  await contentPage.fieldDescriptionText(fieldDescription).click();
  await expect(contentPage.mainRole).toContainText(fieldDescription);
  await expect(contentPage.firstTextbox).toHaveValue(defaultValue);
  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  await contentPage.backButtonLabel.click();
  await contentPage.tableColumnButton(5).click();
  await expect(contentPage.tooltip).toContainText("text1text1 default value");
  await schemaPage.schemaText.click();
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
  await expect(fieldEditorPage.defaultValueTextInput).toHaveValue(defaultValue);
  await fieldEditorPage.plusNewButton.click();
  await fieldEditorPage.defaultValueInputByIndex(1).click();
  await fieldEditorPage.defaultValueInputByIndex(1).fill(testValue2);
  await fieldEditorPage.defaultValueInputByIndex(0).click();
  await fieldEditorPage.defaultValueInputByIndex(0).fill("text1");
  await fieldEditorPage.firstArrowDownButton.click();
  await expect(fieldEditorPage.defaultValueInputByIndex(1)).toHaveValue("text1");
  await fieldEditorPage.okButton.click();
  await contentPage.closeNotification();
  await expect(fieldEditorPage.uniqueFieldText(newFieldName, newFieldKey)).toBeVisible();
  await schemaPage.contentText.click();
  await expect(contentPage.tableHead).toContainText(newFieldName);
  await contentPage.tableColumnButton(5).click();
  await expect(contentPage.tooltip).toContainText("text1text1 default value");
  await contentPage.newItemButton.click();
  await expect(fieldEditorPage.uniqueFieldLabel(newFieldName)).toBeVisible();
  await contentPage.fieldDescriptionText(newFieldDescription).click();
  await expect(contentPage.fieldDescriptionText(newFieldDescription)).toBeVisible();
  await expect(contentPage.textBoxByIndex(0)).toHaveValue(testValue2);
  await expect(contentPage.textBoxByIndex(1)).toHaveValue("text1");
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
  await contentPage.textBoxByIndex(0).click();
  await contentPage.textBoxByIndex(0).fill("text");
  await fieldEditorPage.plusNewButton.click();
  await contentPage.textBoxByIndex(1).click();
  await contentPage.textBoxByIndex(1).fill(testValue2);
  await fieldEditorPage.arrowUpButtonByIndex(1).click();
  await expect(contentPage.textBoxByIndex(0)).toHaveValue(testValue2);
  await expect(contentPage.textBoxByIndex(1)).toHaveValue("text");
  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  await contentPage.backButtonLabel.click();
  await contentPage.getByRole("button", { name: "x2" }).nth(1).click();
  await expect(contentPage.mainRole).toContainText("new text1text2text");
});
