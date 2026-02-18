import { SchemaFieldType } from "@reearth-cms/components/molecules/Schema/types";
import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";

const fieldName = "tag";
const description = "tag description";
const tag1 = "Tag1";
const tag2 = "Tag2";

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

test("@smoke Tag metadata creating and updating has succeeded", async ({
  page,
  fieldEditorPage,
  contentPage,
  schemaPage,
}) => {
  await test.step("Create tag metadata field with validation checks", async () => {
    await schemaPage.metaDataTab.click();
    await fieldEditorPage.fieldTypeButton(SchemaFieldType.Tag).click();
    await fieldEditorPage.displayNameInput.fill(fieldName);
    await fieldEditorPage.fieldKeyInput.fill(fieldName);
    await fieldEditorPage.fieldDescriptionInput.fill(description);
    await fieldEditorPage.plusNewButton.click();
    await fieldEditorPage.tagFilterDiv.last().click();
    await fieldEditorPage.lastTextbox.fill(tag1);
    await fieldEditorPage.plusNewButton.click();
    await fieldEditorPage.tagFilterDiv.last().click();
    await fieldEditorPage.lastTextbox.fill("");
    await expect(contentPage.optionTextByName("Empty values are not allowed")).toBeVisible();
    await expect(fieldEditorPage.okButton).toBeDisabled();
    await fieldEditorPage.lastTextbox.fill(tag1);
    await expect(contentPage.optionTextByName("Labels must be unique")).toBeVisible();
    await expect(fieldEditorPage.okButton).toBeDisabled();
    await fieldEditorPage.lastTextbox.fill(tag2);
    await fieldEditorPage.okButton.click();
    await contentPage.closeNotification();
    await expect(schemaPage.groupNameByText(`${fieldName}#${fieldName}`)).toBeVisible();
    await page.waitForTimeout(300);
  });

  await test.step("Verify metadata field settings", async () => {
    await fieldEditorPage.ellipsisButton.click();
    await expect(fieldEditorPage.displayNameInput).toHaveValue(fieldName);
    await expect(fieldEditorPage.fieldKeyInput).toHaveValue(fieldName);
    await expect(fieldEditorPage.fieldDescriptionInput).toHaveValue(description);
    await expect(fieldEditorPage.tagOptionText(tag1)).toBeVisible();
    await expect(fieldEditorPage.tagOptionText(tag2)).toBeVisible();
    await expect(fieldEditorPage.supportMultipleValuesCheckbox).not.toBeChecked();
    await expect(fieldEditorPage.useAsTitleCheckbox).toBeHidden();
    await fieldEditorPage.validationTab.click();
    await expect(fieldEditorPage.requiredFieldCheckbox).not.toBeChecked();
    await expect(fieldEditorPage.uniqueFieldCheckbox).not.toBeChecked();
    await fieldEditorPage.defaultValueTab.click();
    await expect(fieldEditorPage.setDefaultValueInput).toBeEmpty();
    await fieldEditorPage.cancelButton.click();
    await page.waitForTimeout(300);
  });

  await test.step("Create item with tag value", async () => {
    await schemaPage.menuItemByName("Content").click();
    await contentPage.newItemButton.click();
    await expect(contentPage.optionTextByName(description)).toBeVisible();
    await contentPage.fieldInput(fieldName).click();
    await fieldEditorPage.tagOptionText(tag1).click();
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
    await expect(contentPage.itemInformationHeading).toBeVisible();
    await expect(contentPage.tabPanel.getByText(tag1)).toBeVisible();
    await page.waitForTimeout(300);
  });

  await test.step("Update tag from table view", async () => {
    await contentPage.backButtonRole.click();
    await contentPage.cellByText(fieldName).locator("div").nth(1).click();
    await fieldEditorPage.tagOptionText(tag2).last().click();
    await contentPage.closeNotification();
    await expect(contentPage.cellByText(tag2)).toBeVisible();
    await page.waitForTimeout(300);
  });

  await test.step("Update tag from edit view", async () => {
    await contentPage.editButton.click();
    await expect(contentPage.tabPanel.getByText(tag2)).toBeVisible();
    await fieldEditorPage.tagOptionText(tag2).click({ force: true });
    await fieldEditorPage.tagOptionText(tag1).click({ force: true });
    await contentPage.closeNotification();
    await expect(contentPage.tabPanel.getByText(tag1)).toBeVisible();
    await page.waitForTimeout(300);
  });

  await test.step("Verify updated tag in table view", async () => {
    await contentPage.backButton.click();
    await expect(contentPage.cellByText(tag1)).toBeVisible();
    await page.waitForTimeout(300);
  });
});

test("Tag metadata editing has succeeded", async ({
  page,
  fieldEditorPage,
  contentPage,
  schemaPage,
}) => {
  const newFieldName = `new ${fieldName}`;
  const newKey = `new-${fieldName}`;
  const newDescription = `new ${description}`;
  const tag3 = "Tag3";

  await test.step("Create tag metadata with default value", async () => {
    await schemaPage.metaDataTab.click();
    await fieldEditorPage.fieldTypeButton(SchemaFieldType.Tag).click();
    await fieldEditorPage.displayNameInput.fill(fieldName);
    await fieldEditorPage.fieldKeyInput.fill(fieldName);
    await fieldEditorPage.fieldDescriptionInput.fill(description);
    await fieldEditorPage.plusNewButton.click();
    await fieldEditorPage.tagFilterDiv.last().click();
    await fieldEditorPage.lastTextbox.fill(tag1);
    await fieldEditorPage.plusNewButton.click();
    await fieldEditorPage.tagFilterDiv.last().click();
    await fieldEditorPage.lastTextbox.fill(tag2);
    await fieldEditorPage.defaultValueTab.click();
    await fieldEditorPage.setDefaultValueInput.click();
    await fieldEditorPage.tagOptionText(tag1).last().click();
    await fieldEditorPage.okButton.click();
    await contentPage.closeNotification();
    await page.waitForTimeout(300);
  });

  await test.step("Verify field in content and create item with default value", async () => {
    await schemaPage.menuItemByName("Content").click();
    await expect(contentPage.columnHeaderWithEdit(fieldName)).toBeVisible();
    await contentPage.newItemButton.click();
    await expect(contentPage.optionTextByName("Tag1")).toBeVisible();
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
    await page.waitForTimeout(300);
  });

  await test.step("Update metadata with multiple values, validations and new tag", async () => {
    await schemaPage.menuItemByName("Schema").click();
    await schemaPage.metaDataTab.click();
    await fieldEditorPage.ellipsisButton.click();
    await fieldEditorPage.displayNameInput.fill(newFieldName);
    await fieldEditorPage.fieldKeyInput.fill(newKey);
    await fieldEditorPage.fieldDescriptionInput.fill(newDescription);
    await fieldEditorPage.plusNewButton.click();
    await fieldEditorPage.tagFilterDiv.last().click();
    await fieldEditorPage.lastTextbox.fill(tag3);
    await fieldEditorPage.supportMultipleValuesCheckbox.check();
    await fieldEditorPage.validationTab.click();
    await fieldEditorPage.requiredFieldCheckbox.check();
    await fieldEditorPage.uniqueFieldCheckbox.check();
    await fieldEditorPage.defaultValueTab.click();
    await expect(fieldEditorPage.defaultValueExactLabel.getByText(tag1)).toBeVisible();
    await page.getByRole("dialog").getByRole("combobox").click({ force: true });
    await expect(fieldEditorPage.tagOptionText(tag1).last()).toBeVisible();
    await fieldEditorPage.tagOptionText(tag2).last().click();
    await fieldEditorPage.tagOptionText(tag3).last().click();
    await expect(fieldEditorPage.defaultValueExactLabel.getByText(tag1)).toBeVisible();
    await expect(fieldEditorPage.defaultValueExactLabel.getByText(tag2)).toBeVisible();
    await expect(fieldEditorPage.defaultValueExactLabel.getByText(tag3)).toBeVisible();
    await page.waitForTimeout(300);
  });

  await test.step("Delete tag option and verify default values update", async () => {
    await fieldEditorPage.settingsTab.click();
    await fieldEditorPage.updateTagLabel.getByRole("button", { name: "delete" }).first().click();
    await fieldEditorPage.defaultValueTab.click();
    await expect(fieldEditorPage.defaultValueExactLabel.getByText(tag1)).toBeHidden();
    await expect(fieldEditorPage.defaultValueExactLabel.getByText(tag2)).toBeVisible();
    await expect(fieldEditorPage.defaultValueExactLabel.getByText(tag3)).toBeVisible();
    await page.getByRole("dialog").getByRole("combobox").click({ force: true });
    await expect(fieldEditorPage.tagOptionText(tag1).last()).toBeHidden();
    await page.getByRole("dialog").getByRole("combobox").click({ force: true });
    await fieldEditorPage.okButton.click();
    await contentPage.closeNotification();
    await expect(contentPage.optionTextByName(`${newFieldName} *#${newKey}(unique)`)).toBeVisible();
    await page.waitForTimeout(300);
  });

  await test.step("Verify updated metadata in content and create new item", async () => {
    await schemaPage.menuItemByName("Content").click();
    await expect(contentPage.columnHeaderWithEdit(newFieldName)).toBeVisible();
    await expect(contentPage.optionTextByName(tag1)).toBeHidden();
    await contentPage.newItemButton.click();
    await expect(contentPage.optionTextByName(`${newFieldName}(unique)`)).toBeVisible();
    await expect(contentPage.optionTextByName(newDescription)).toBeVisible();
    await expect(contentPage.optionTextByName(tag2)).toBeVisible();
    await expect(contentPage.optionTextByName(tag3)).toBeVisible();
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
    await expect(contentPage.optionTextByName(tag2)).toBeVisible();
    await expect(contentPage.optionTextByName(tag3)).toBeVisible();
    await page.waitForTimeout(300);
  });
  await test.step("Update tag from table view", async () => {
    await contentPage.backButton.click();
    await contentPage.cellByTagNames(`${tag2} ${tag3}`).click();
    await fieldEditorPage.tagOptionText(tag2).last().click();
    await contentPage.closeNotification();
    await page.waitForTimeout(300);
  });

  await test.step("Verify tag removal and required field validation", async () => {
    await contentPage.editButton.first().click();
    await expect(contentPage.tabPanel.getByText(tag2)).toBeHidden();
    await expect(contentPage.tabPanel.getByText(tag3)).toBeVisible();
    await contentPage.closeCircleLabel.locator("svg").hover();
    await contentPage.closeCircleLabel.locator("svg").click();
    await expect(contentPage.pleaseInputFieldText).toBeVisible();
    await page.waitForTimeout(300);
  });

  await test.step("Add tag back and verify in table view", async () => {
    await page.getByRole("combobox").last().click({ force: true });
    await fieldEditorPage.tagOptionText(tag2).click();
    await contentPage.closeNotification();
    await contentPage.backButton.click();
    await expect(contentPage.optionTextByName(tag2).first()).toBeVisible();
    await page.waitForTimeout(300);
  });
});
