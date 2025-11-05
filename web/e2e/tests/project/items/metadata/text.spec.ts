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

test("Text metadata creating and updating has succeeded", async ({
  fieldEditorPage,
  contentPage,
  schemaPage,
}) => {
  await schemaPage.metaDataTab.click();
  await fieldEditorPage.fieldTypeButton("Text").click();
  await fieldEditorPage.displayNameInput.fill("text1");
  await fieldEditorPage.fieldKeyInput.fill("text1");
  await fieldEditorPage.fieldDescriptionInput.fill("text1 description");
  await fieldEditorPage.okButton.click();
  await contentPage.closeNotification();
  await expect(schemaPage.groupNameByText("text1#text1")).toBeVisible();

  await fieldEditorPage.ellipsisButton.click();
  await expect(fieldEditorPage.displayNameInput).toHaveValue("text1");
  await expect(fieldEditorPage.fieldKeyInput).toHaveValue("text1");
  await expect(fieldEditorPage.fieldDescriptionInput).toHaveValue("text1 description");
  await expect(fieldEditorPage.supportMultipleValuesCheckbox).not.toBeChecked();
  await expect(fieldEditorPage.useAsTitleCheckbox).toBeHidden();

  await fieldEditorPage.validationTab.click();
  await expect(fieldEditorPage.maxLengthInput).toBeEmpty();
  await expect(fieldEditorPage.requiredFieldCheckbox).not.toBeChecked();
  await expect(fieldEditorPage.uniqueFieldCheckbox).not.toBeChecked();

  await fieldEditorPage.defaultValueTab.click();
  await expect(fieldEditorPage.setDefaultValueInput).toBeEmpty();

  await fieldEditorPage.cancelButton.click();
  await schemaPage.menuItemByName("Content").click();
  await contentPage.newItemButton.click();
  await expect(contentPage.fieldInput("text1")).toBeVisible();
  await expect(contentPage.optionTextByName("text1 description")).toBeVisible();

  await contentPage.fieldInput("text1").fill("text1");
  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  await expect(contentPage.itemInformationHeading).toBeVisible();
  await expect(contentPage.fieldInput("text1")).toHaveValue("text1");

  await contentPage.backButton.click();
  await expect(contentPage.textBoxes).toHaveValue("text1");
  await contentPage.textBoxes.fill("new text1");
  await contentPage.antTableBody.click();
  await contentPage.closeNotification();
  await expect(contentPage.textBoxes).toHaveValue("new text1");

  await contentPage.editButton.click();
  await expect(contentPage.fieldInput("text1")).toHaveValue("new text1");

  await contentPage.fieldInput("text1").fill("text1");
  await contentPage.closeNotification();
  await expect(contentPage.fieldInput("text1")).toHaveValue("text1");

  await contentPage.backButton.click();
  await expect(contentPage.textBoxes).toHaveValue("text1");
});

test("Text metadata editing has succeeded", async ({
  fieldEditorPage,
  contentPage,
  schemaPage,
}) => {
  await schemaPage.metaDataTab.click();
  await schemaPage.textListItem.click();
  await fieldEditorPage.displayNameInput.fill("text1");
  await fieldEditorPage.fieldKeyInput.fill("text1");
  await fieldEditorPage.fieldDescriptionInput.fill("text1 description");
  await fieldEditorPage.defaultValueTab.click();
  await fieldEditorPage.setDefaultValueInput.fill("text1 default value");
  await fieldEditorPage.okButton.click();
  await contentPage.closeNotification();

  await schemaPage.menuItemByName("Content").click();
  await expect(contentPage.columnHeaderWithEdit("text1")).toBeVisible();

  await contentPage.newItemButton.click();
  await expect(contentPage.fieldInput("text1")).toHaveValue("text1 default value");

  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  await schemaPage.menuItemByName("Schema").click();
  await schemaPage.metaDataTab.click();
  await fieldEditorPage.ellipsisButton.click();
  await fieldEditorPage.displayNameInput.fill("new text1");
  await fieldEditorPage.fieldKeyInput.fill("new-text1");
  await fieldEditorPage.fieldDescriptionInput.fill("new text1 description");
  await fieldEditorPage.supportMultipleValuesCheckbox.check();
  await fieldEditorPage.validationTab.click();
  await fieldEditorPage.maxLengthInput.fill("5");
  await fieldEditorPage.requiredFieldCheckbox.check();
  await fieldEditorPage.uniqueFieldCheckbox.check();
  await fieldEditorPage.defaultValueTab.click();
  await expect(contentPage.textBoxByIndex(0)).toHaveValue("text1 default value");

  await fieldEditorPage.plusNewButton.click();
  await contentPage.textBoxByIndex(1).fill("text2");
  await expect(fieldEditorPage.okButton).toBeDisabled();
  await contentPage.textBoxByIndex(0).fill("text1");
  await fieldEditorPage.okButton.click();
  await contentPage.closeNotification();
  await expect(contentPage.optionTextByName("new text1 *#new-text1(unique)")).toBeVisible();

  await schemaPage.menuItemByName("Content").click();
  await expect(contentPage.columnHeaderWithEdit("new text1")).toBeVisible();
  await expect(contentPage.textBoxes).toHaveValue("text1 default value");

  await contentPage.newItemButton.click();
  await expect(contentPage.optionTextByName("new text1(unique)")).toBeVisible();
  await expect(contentPage.optionTextByName("new text1 description")).toBeVisible();
  await expect(contentPage.textBoxByIndex(0)).toHaveValue("text1");
  await expect(contentPage.textBoxByIndex(1)).toHaveValue("text2");
  await contentPage.textBoxByIndex(1).fill("text22");
  await expect(contentPage.saveButton).toBeDisabled();
  await contentPage.textBoxByIndex(1).fill("text2");

  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  await expect(contentPage.textBoxByIndex(0)).toHaveValue("text1");
  await expect(contentPage.textBoxByIndex(1)).toHaveValue("text2");

  await contentPage.backButton.click();
  await contentPage.x2Button.click();
  await expect(contentPage.tooltipTextboxes.nth(0)).toHaveValue("text1");
  await expect(contentPage.tooltipTextboxes.nth(1)).toHaveValue("text2");

  await contentPage.tooltipTextboxes.nth(1).fill("new text2");
  await contentPage.tooltipTextByName("new text1").click();
  await contentPage.closeNotification(false);
  await contentPage.x2Button.click();
  await contentPage.tooltipTextboxes.nth(1).fill("text3");
  await contentPage.tooltipTextByName("new text1").click();
  await contentPage.closeNotification();
  await contentPage.editButton.first().click();
  await expect(contentPage.textBoxByIndex(0)).toHaveValue("text1");
  await expect(contentPage.textBoxByIndex(1)).toHaveValue("text3");
  await fieldEditorPage.plusNewButton.click();
  await contentPage.textBoxes.last().fill("text2");
  await contentPage.closeNotification();
  await expect(contentPage.textBoxByIndex(0)).toHaveValue("text1");
  await expect(contentPage.textBoxByIndex(1)).toHaveValue("text3");
  await expect(contentPage.textBoxByIndex(2)).toHaveValue("text2");

  await contentPage.backButton.click();
  await contentPage.x3Button.click();
  await expect(contentPage.tooltipTextboxes.nth(0)).toHaveValue("text1");
  await expect(contentPage.tooltipTextboxes.nth(1)).toHaveValue("text3");
  await expect(contentPage.tooltipTextboxes.nth(2)).toHaveValue("text2");
});
