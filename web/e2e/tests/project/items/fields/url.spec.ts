import { SchemaFieldType } from "@reearth-cms/components/molecules/Schema/types";
import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";

const fieldName = "url1";
const fieldKey = "url1";
const fieldDescription = "url1 description";
const fieldHeader = "url1#url1";
const newFieldName = "new url1";
const newFieldKey = "new-url1";
const newFieldDescription = "new url1 description";
const testUrl1 = "http://test1.com";
const testUrl2 = "http://test2.com";

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

test("URL field creating and updating has succeeded", async ({ fieldEditorPage, contentPage }) => {
  await fieldEditorPage.createField({
    type: SchemaFieldType.URL,
    name: fieldName,
    key: fieldKey,
    description: fieldDescription,
  });

  await expect(fieldEditorPage.fieldsContainerParagraph).toContainText(fieldHeader);
  await contentPage.contentText.click();
  await contentPage.newItemButton.click();
  await expect(contentPage.labelElement()).toContainText(fieldName);
  await expect(contentPage.mainElement).toContainText(fieldDescription);
  await contentPage.fieldInput(fieldName).click();
  await contentPage.fieldInput(fieldName).fill(testUrl1);
  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  await contentPage.backButton.click();
  await expect(contentPage.cellByTextExact(testUrl1)).toBeVisible();

  await contentPage.editButton.click();
  await expect(contentPage.fieldInput(fieldName)).toHaveValue(testUrl1);
  await contentPage.fieldInput(fieldName).click();
  await contentPage.fieldInput(fieldName).fill(testUrl2);
  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  await contentPage.backButton.click();
  await expect(contentPage.cellByTextExact(testUrl2)).toBeVisible();
});

test("URL field editing has succeeded", async ({ fieldEditorPage, contentPage, schemaPage }) => {
  await fieldEditorPage.createField({
    type: SchemaFieldType.URL,
    name: fieldName,
    key: fieldKey,
    description: fieldDescription,
    defaultValue: testUrl1,
  });

  await contentPage.contentText.click();
  await expect(contentPage.tableHead).toContainText(fieldName);
  await contentPage.newItemButton.click();
  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  await contentPage.backButton.click();
  await expect(contentPage.cellByTextExact(testUrl1)).toBeVisible();

  await schemaPage.schemaText.click();
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
  await fieldEditorPage.requiredFieldCheckbox.check();
  await fieldEditorPage.uniqueFieldCheckbox.check();
  await fieldEditorPage.defaultValueTab.click();
  await expect(fieldEditorPage.setDefaultValueInput).toHaveValue(testUrl1);
  await fieldEditorPage.plusNewButton.click();
  await fieldEditorPage.defaultValueInputByIndex(1).click();
  await fieldEditorPage.defaultValueInputByIndex(1).fill(testUrl2);
  await fieldEditorPage.okButton.click();
  await contentPage.closeNotification();

  await expect(schemaPage.uniqueFieldText(newFieldName, newFieldKey)).toBeVisible();
  await contentPage.contentText.click();
  await expect(contentPage.tableHead).toContainText(newFieldName);
  await expect(contentPage.cellByTextExact(testUrl1)).toBeVisible();
  await contentPage.newItemButton.click();
  await expect(contentPage.uniqueFieldLabel(newFieldName)).toBeVisible();
  await expect(contentPage.textBoxByIndex(0)).toHaveValue(testUrl1);
  await expect(contentPage.textBoxByIndex(1)).toHaveValue(testUrl2);
  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  await contentPage.backButton.click();
  await contentPage.x2Button.click();
  await expect(contentPage.tooltip).toContainText("http://test1.comhttp://test2.com");

  await expect(contentPage.tooltip).toContainText("new url1http://test1.comhttp://test2.com");
});
