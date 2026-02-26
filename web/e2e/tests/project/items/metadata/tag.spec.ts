import { SchemaFieldType } from "@reearth-cms/components/molecules/Schema/types";
import { expect, TAG, test } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";
import { t } from "@reearth-cms/e2e/support/i18n";

const fieldName = `tag-${getId()}`;
const description = `tag-desc-${getId()}`;
const tag1 = "Tag1";
const tag2 = "Tag2";

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

test(
  "Tag metadata creating and updating has succeeded",
  { tag: TAG.SMOKE },
  async ({ fieldEditorPage, contentPage, schemaPage }) => {
    await test.step("Create tag metadata field with validation checks", async () => {
      await schemaPage.metaDataTab.click();
      await schemaPage.tagListItem.click();
      await fieldEditorPage.displayNameInput.fill(fieldName);
      await fieldEditorPage.fieldKeyInput.fill(fieldName);
      await fieldEditorPage.descriptionInput.fill(description);
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
    });

    await test.step("Verify metadata field settings", async () => {
      await fieldEditorPage.ellipsisButton.click();
      await expect(fieldEditorPage.displayNameInput).toHaveValue(fieldName);
      await expect(fieldEditorPage.fieldKeyInput).toHaveValue(fieldName);
      await expect(fieldEditorPage.descriptionInput).toHaveValue(description);
      await expect(fieldEditorPage.tagOptionText(tag1)).toBeVisible();
      await expect(fieldEditorPage.tagOptionText(tag2)).toBeVisible();
      await expect(fieldEditorPage.supportMultipleValuesCheckbox).not.toBeChecked();
      await expect(fieldEditorPage.useAsTitleCheckbox).toBeHidden();
      await fieldEditorPage.validationTab.click();
      await expect(fieldEditorPage.requiredFieldCheckbox).not.toBeChecked();
      await expect(fieldEditorPage.uniqueFieldCheckbox).not.toBeChecked();
      await fieldEditorPage.defaultValueTab.click();
      await expect(fieldEditorPage.getByLabel(t("Set default value"))).toBeEmpty();
      await fieldEditorPage.cancelButton.click();
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
    });

    await test.step("Update tag from table view", async () => {
      await contentPage.backButtonRole.click();
      await contentPage.cellByText(tag1).locator("div").nth(1).click();
      await fieldEditorPage.tagOptionText(tag2).last().click();
      await contentPage.closeNotification();
      await expect(contentPage.cellByText(tag2)).toBeVisible();
    });

    await test.step("Update tag from edit view", async () => {
      await contentPage.editButton.click();
      await expect(contentPage.tabPanel.getByText(tag2)).toBeVisible();
      await fieldEditorPage.tagOptionText(tag2).click();
      await fieldEditorPage.tagOptionText(tag1).click();
      await contentPage.closeNotification();
      await expect(contentPage.tabPanel.getByText(tag1)).toBeVisible();
    });

    await test.step("Verify updated tag in table view", async () => {
      await contentPage.backButton.click();
      await expect(contentPage.cellByText(tag1)).toBeVisible();
    });
  },
);

test("Tag metadata editing has succeeded", { tag: TAG.FIELD_VARIANT }, async ({ fieldEditorPage, contentPage, schemaPage }) => {
  const newFieldName = `new ${fieldName}`;
  const newKey = `new-${fieldName}`;
  const newDescription = `new ${description}`;
  const tag3 = "Tag3";

  await test.step("Create tag metadata with default value", async () => {
    await schemaPage.metaDataTab.click();
    await fieldEditorPage.createField({
      type: SchemaFieldType.Tag,
      name: fieldName,
      key: fieldName,
      description,
      tags: [tag1, tag2],
      defaultValue: tag1,
      metadata: true,
    });
  });

  await test.step("Verify field in content and create item with default value", async () => {
    await schemaPage.menuItemByName("Content").click();
    await expect(contentPage.columnHeaderWithEdit(fieldName)).toBeVisible();
    await contentPage.newItemButton.click();
    await expect(contentPage.optionTextByName("Tag1")).toBeVisible();
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
  });

  await test.step("Update metadata with multiple values, validations and new tag", async () => {
    await schemaPage.menuItemByName("Schema").click();
    await schemaPage.metaDataTab.click();
    // TODO(editField): cannot migrate — complex tag manipulation + interleaved assertions
    await fieldEditorPage.ellipsisButton.click();
    await fieldEditorPage.displayNameInput.fill(newFieldName);
    await fieldEditorPage.fieldKeyInput.fill(newKey);
    await fieldEditorPage.descriptionInput.fill(newDescription);
    await fieldEditorPage.plusNewButton.click();
    await fieldEditorPage.tagFilterDiv.last().click();
    await fieldEditorPage.lastTextbox.fill(tag3);
    await fieldEditorPage.supportMultipleValuesCheckbox.check();
    await fieldEditorPage.validationTab.click();
    await fieldEditorPage.requiredFieldCheckbox.check();
    await fieldEditorPage.uniqueFieldCheckbox.check();
    await fieldEditorPage.defaultValueTab.click();
    await expect(fieldEditorPage.defaultValueExactLabel.getByText(tag1)).toBeVisible();
    await fieldEditorPage.tagSelectTrigger.click();
    await expect(fieldEditorPage.tagOptionText(tag1).last()).toBeVisible();
    await fieldEditorPage.tagOptionText(tag2).last().click();
    await fieldEditorPage.tagOptionText(tag3).last().click();
    await expect(fieldEditorPage.defaultValueExactLabel.getByText(tag1)).toBeVisible();
    await expect(fieldEditorPage.defaultValueExactLabel.getByText(tag2)).toBeVisible();
    await expect(fieldEditorPage.defaultValueExactLabel.getByText(tag3)).toBeVisible();
  });

  await test.step("Delete tag option and verify default values update", async () => {
    await fieldEditorPage.settingsTab.click();
    await fieldEditorPage.updateTagLabel.getByRole("button", { name: "delete" }).first().click();
    await fieldEditorPage.defaultValueTab.click();
    await expect(fieldEditorPage.defaultValueExactLabel.getByText(tag1)).toBeHidden();
    await expect(fieldEditorPage.defaultValueExactLabel.getByText(tag2)).toBeVisible();
    await expect(fieldEditorPage.defaultValueExactLabel.getByText(tag3)).toBeVisible();
    await fieldEditorPage.tagSelectTrigger.click();
    await expect(fieldEditorPage.tagOptionText(tag1).last()).toBeHidden();
    await fieldEditorPage.tagSelectTrigger.click();
    await fieldEditorPage.okButton.click();
    await contentPage.closeNotification();
    // TODO(editField): end migration block
    await expect(contentPage.optionTextByName(`${newFieldName} *#${newKey}(unique)`)).toBeVisible();
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
  });
  await test.step("Update tag from table view", async () => {
    await contentPage.backButton.click();
    await contentPage.cellByTagNames(`${tag2} ${tag3}`).click();
    await fieldEditorPage.tagOptionText(tag2).last().click();
    await contentPage.closeNotification();
  });

  await test.step("Verify tag removal and required field validation", async () => {
    await contentPage.editButton.first().click();
    await expect(fieldEditorPage.tagOptionText(tag2)).toBeHidden();
    await expect(fieldEditorPage.tagOptionText(tag3)).toBeVisible();
    await contentPage.closeCircleLabel.locator("svg").hover();
    await contentPage.closeCircleLabel.locator("svg").click();
    await expect(contentPage.pleaseInputFieldText).toBeVisible();
  });

  await test.step("Add tag back and verify in table view", async () => {
    await contentPage.metadataTagSelect.click();
    await contentPage.getByText(tag2).click();
    await contentPage.closeNotification();
    await contentPage.backButton.click();
    await expect(contentPage.optionTextByName(tag2)).toBeVisible();
  });
});
