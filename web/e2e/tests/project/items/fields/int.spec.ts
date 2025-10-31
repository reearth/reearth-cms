import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";

test.beforeEach(async ({ reearth, projectPage }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  const projectName = getId();
  await projectPage.createProject(projectName);
  await projectPage.gotoProject(projectName);
  await projectPage.createModelFromOverview();
});

test.afterEach(async ({ projectPage }) => {
  await projectPage.deleteProject();
});

test("@smoke Int field creating and updating has succeeded", async ({
  fieldEditorPage,
  projectPage,
  contentPage,
  schemaPage,
}) => {
  await fieldEditorPage.fieldTypeButton("Int").click();
  await fieldEditorPage.displayNameInput.click();
  await fieldEditorPage.displayNameInput.fill("int1");
  await fieldEditorPage.settingsKeyInput.click();
  await fieldEditorPage.settingsKeyInput.fill("int1");
  await fieldEditorPage.settingsDescriptionInput.click();
  await fieldEditorPage.settingsDescriptionInput.fill("int1 description");

  await fieldEditorPage.okButton.click();
  await contentPage.closeNotification();

  await expect(schemaPage.fieldsContainer.getByRole("paragraph")).toContainText("int1#int1");
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

  await contentPage.cellEditButton.click();
  await expect(contentPage.fieldInput("int1")).toHaveValue("1");
  await contentPage.fieldInput("int1").click();
  await contentPage.fieldInput("int1").fill("2");
  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  await contentPage.backButtonLabel.click();
  await expect(contentPage.cellByTextExact("2")).toBeVisible();
});

test("Int field editing has succeeded", async ({ fieldEditorPage, contentPage, schemaPage }) => {
  await fieldEditorPage.fieldTypeListItem("Int").click();
  await fieldEditorPage.displayNameInput.click();
  await fieldEditorPage.displayNameInput.fill("int1");
  await fieldEditorPage.settingsKeyInput.click();
  await fieldEditorPage.settingsKeyInput.fill("int1");
  await fieldEditorPage.settingsDescriptionInput.click();
  await fieldEditorPage.settingsDescriptionInput.fill("int1 description");
  await fieldEditorPage.defaultValueTab.click();
  await fieldEditorPage.setDefaultValueInput.click();
  await fieldEditorPage.setDefaultValueInput.fill("1");
  await fieldEditorPage.okButton.click();
  await contentPage.closeNotification();

  await schemaPage.contentText.click();
  await expect(contentPage.tableHead).toContainText("int1");
  await contentPage.newItemButton.click();
  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  await contentPage.backButtonLabel.click();
  await expect(contentPage.cellByTextExact("1")).toBeVisible();

  await schemaPage.schemaText.click();
  await fieldEditorPage.ellipsisMenuButton.click();
  await fieldEditorPage.settingsTab.click();
  await fieldEditorPage.displayNameInput.click();
  await fieldEditorPage.displayNameInput.fill("new int1");
  await fieldEditorPage.fieldKeyInput.click();
  await fieldEditorPage.fieldKeyInput.fill("new-int1");
  await fieldEditorPage.descriptionOptionalInput.click();
  await fieldEditorPage.descriptionOptionalInput.fill("new int1 description");
  await fieldEditorPage.supportMultipleValuesCheckbox.check();
  await expect(fieldEditorPage.useAsTitleCheckbox).toBeHidden();
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
  await schemaPage.contentText.click();
  await expect(contentPage.tableHead).toContainText("new int1");
  await expect(contentPage.cellByTextExact("1")).toBeVisible();
  await contentPage.newItemButton.click();
  await expect(fieldEditorPage.uniqueFieldLabel("new int1")).toBeVisible();
  await expect(contentPage.spinbuttonByIndex(0)).toHaveValue("2");
  await expect(contentPage.spinbuttonByIndex(1)).toHaveValue("3");
  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  await contentPage.backButtonLabel.click();
  await contentPage.x2Button.click();
  await expect(contentPage.tooltip).toContainText("new int123");
});
