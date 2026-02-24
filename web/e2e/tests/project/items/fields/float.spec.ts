import { SchemaFieldType } from "@reearth-cms/components/molecules/Schema/types";
import { expect, test } from "@reearth-cms/e2e/fixtures/test";
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

test("Float field creating and updating has succeeded", async ({
  fieldEditorPage,
  contentPage,
  schemaPage,
}) => {
  await fieldEditorPage.createField({
    type: SchemaFieldType.Number,
    name: "float1",
    key: "float1",
    description: "float1 description",
  });

  await expect(fieldEditorPage.fieldsContainerParagraph).toContainText("float1#float1");
  await schemaPage.contentText.click();
  await contentPage.newItemButton.click();
  await expect(contentPage.firstLabel).toContainText("float1");
  await expect(contentPage.mainRole).toContainText("float1 description");
  await contentPage.fieldInput("float1").click();
  await contentPage.fieldInput("float1").fill("1.1");
  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  await contentPage.backButtonLabel.click();
  await expect(contentPage.cellByTextExact("1.1")).toBeVisible();

  await contentPage.cellEditButton.click();
  await expect(contentPage.fieldInput("float1")).toHaveValue("1.1");
  await contentPage.fieldInput("float1").click();
  await contentPage.fieldInput("float1").fill("2.2");
  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  await contentPage.backButtonLabel.click();
  await expect(contentPage.cellByTextExact("2.2")).toBeVisible();
});

test("Float field editing has succeeded", async ({ fieldEditorPage, contentPage, schemaPage }) => {
  await fieldEditorPage.createField({
    type: SchemaFieldType.Number,
    name: "float1",
    key: "float1",
    description: "float1 description",
    defaultValue: "1.1",
  });

  await schemaPage.contentText.click();
  await expect(contentPage.tableHead).toContainText("float1");
  await contentPage.newItemButton.click();
  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  await contentPage.backButtonLabel.click();
  await expect(contentPage.cellByTextExact("1.1")).toBeVisible();

  await schemaPage.schemaText.click();
  await fieldEditorPage.ellipsisMenuButton.click();
  await fieldEditorPage.settingsTab.click();
  await fieldEditorPage.displayNameInput.click();
  await fieldEditorPage.displayNameInput.fill("new float1");
  await fieldEditorPage.fieldKeyInput.click();
  await fieldEditorPage.fieldKeyInput.fill("new-float1");
  await fieldEditorPage.descriptionInput.click();
  await fieldEditorPage.descriptionInput.fill("new float1 description");
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
  await expect(fieldEditorPage.setDefaultValueInput).toHaveValue("1.1");
  await expect(fieldEditorPage.okButton).toBeDisabled();
  await fieldEditorPage.setDefaultValueInput.click();
  await fieldEditorPage.setDefaultValueInput.fill("11.1");
  await expect(fieldEditorPage.okButton).toBeDisabled();
  await fieldEditorPage.setDefaultValueInput.click();
  await fieldEditorPage.setDefaultValueInput.fill("2.2");
  await fieldEditorPage.plusNewButton.click();
  await fieldEditorPage.defaultValueInputByIndex(1).click();
  await fieldEditorPage.defaultValueInputByIndex(1).fill("3.3");
  await fieldEditorPage.okButton.click();
  await contentPage.closeNotification();

  await expect(fieldEditorPage.uniqueFieldText("new float1", "new-float1")).toBeVisible();
  await schemaPage.contentText.click();
  await expect(contentPage.tableHead).toContainText("new float1");
  await expect(contentPage.cellByTextExact("1.1")).toBeVisible();
  await contentPage.newItemButton.click();
  await expect(fieldEditorPage.uniqueFieldLabel("new float1")).toBeVisible();
  await expect(contentPage.spinButtonByIndex(0)).toHaveValue("2.2");
  await expect(contentPage.spinButtonByIndex(1)).toHaveValue("3.3");
  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  await contentPage.backButtonLabel.click();
  await contentPage.x2Button.click();
  await expect(contentPage.tooltip).toContainText("new float12.23.3");
});
