import { SchemaFieldType } from "@reearth-cms/components/molecules/Schema/types";
import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";

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
    name: "url1",
    key: "url1",
    description: "url1 description",
  });

  await expect(fieldEditorPage.fieldsContainerParagraph).toContainText("url1#url1");
  await contentPage.contentText.click();
  await contentPage.newItemButton.click();
  await expect(contentPage.labelElement()).toContainText("url1");
  await expect(contentPage.mainElement).toContainText("url1 description");
  await contentPage.fieldInput("url1").click();
  await contentPage.fieldInput("url1").fill("http://test1.com");
  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  await contentPage.backButton.click();
  await expect(contentPage.cellByTextExact("http://test1.com")).toBeVisible();

  await contentPage.editButton.click();
  await expect(contentPage.fieldInput("url1")).toHaveValue("http://test1.com");
  await contentPage.fieldInput("url1").click();
  await contentPage.fieldInput("url1").fill("http://test2.com");
  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  await contentPage.backButton.click();
  await expect(contentPage.cellByTextExact("http://test2.com")).toBeVisible();
});

test("URL field editing has succeeded", async ({ fieldEditorPage, contentPage, schemaPage }) => {
  await fieldEditorPage.createField({
    type: SchemaFieldType.URL,
    name: "url1",
    key: "url1",
    description: "url1 description",
    defaultValue: "http://test1.com",
  });

  await contentPage.contentText.click();
  await expect(contentPage.tableHead).toContainText("url1");
  await contentPage.newItemButton.click();
  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  await contentPage.backButton.click();
  await expect(contentPage.cellByTextExact("http://test1.com")).toBeVisible();

  await schemaPage.schemaText.click();
  await fieldEditorPage.ellipsisMenuButton.click();
  await fieldEditorPage.settingsTab.click();
  await fieldEditorPage.displayNameInput.click();
  await fieldEditorPage.displayNameInput.fill("new url1");
  await fieldEditorPage.fieldKeyInput.click();
  await fieldEditorPage.fieldKeyInput.fill("new-url1");
  await fieldEditorPage.descriptionInput.click();
  await fieldEditorPage.descriptionInput.fill("new url1 description");
  await fieldEditorPage.supportMultipleValuesCheckbox.check();
  await expect(fieldEditorPage.useAsTitleCheckbox).toBeHidden();
  await fieldEditorPage.validationTab.click();
  await fieldEditorPage.requiredFieldCheckbox.check();
  await fieldEditorPage.uniqueFieldCheckbox.check();
  await fieldEditorPage.defaultValueTab.click();
  await expect(fieldEditorPage.setDefaultValueInput).toHaveValue("http://test1.com");
  await fieldEditorPage.plusNewButton.click();
  await fieldEditorPage.defaultValueInputByIndex(1).click();
  await fieldEditorPage.defaultValueInputByIndex(1).fill("http://test2.com");
  await fieldEditorPage.okButton.click();
  await contentPage.closeNotification();

  await expect(schemaPage.uniqueFieldText("new url1", "new-url1")).toBeVisible();
  await contentPage.contentText.click();
  await expect(contentPage.tableHead).toContainText("new url1");
  await expect(contentPage.cellByTextExact("http://test1.com")).toBeVisible();
  await contentPage.newItemButton.click();
  await expect(contentPage.uniqueFieldLabel("new url1")).toBeVisible();
  await expect(contentPage.textBoxByIndex(0)).toHaveValue("http://test1.com");
  await expect(contentPage.textBoxByIndex(1)).toHaveValue("http://test2.com");
  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  await contentPage.backButton.click();
  await contentPage.x2Button.click();
  await expect(contentPage.tooltip).toContainText("http://test1.comhttp://test2.com");

  await expect(contentPage.tooltip).toContainText("new url1http://test1.comhttp://test2.com");
});
