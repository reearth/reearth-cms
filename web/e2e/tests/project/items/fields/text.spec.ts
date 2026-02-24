import { SchemaFieldType } from "@reearth-cms/components/molecules/Schema/types";
import { expect, TAG, test } from "@reearth-cms/e2e/fixtures/test";
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

test(
  "Text field editing has succeeded",
  { tag: TAG.SMOKE },
  async ({ fieldEditorPage, contentPage, schemaPage }) => {
    await test.step("Create text field with settings and default value", async () => {
      await fieldEditorPage.createField({
        type: SchemaFieldType.Text,
        name: "text1",
        key: "text1",
        description: "text1 description",
        defaultValue: "text1 default value",
      });
      await expect(fieldEditorPage.fieldText("text1", "text1")).toBeVisible();
    });

    await test.step("Verify field settings and default value", async () => {
      await fieldEditorPage.ellipsisMenuButton.click();
      await expect(fieldEditorPage.displayNameInput).toBeVisible();
      await expect(fieldEditorPage.displayNameInput).toHaveValue("text1");
      await expect(fieldEditorPage.settingsKeyInput).toHaveValue("text1");
      await expect(fieldEditorPage.settingsDescriptionInput).toHaveValue("text1 description");
      await expect(fieldEditorPage.supportMultipleValuesCheckbox).not.toBeChecked();
      await expect(fieldEditorPage.useAsTitleCheckbox).not.toBeChecked();
      await fieldEditorPage.validationTab.click();
      await expect(fieldEditorPage.maxLengthInput).toBeEmpty();
      await expect(fieldEditorPage.requiredFieldCheckbox).not.toBeChecked();
      await expect(fieldEditorPage.uniqueFieldCheckbox).not.toBeChecked();
      await fieldEditorPage.defaultValueTab.click();
      await expect(fieldEditorPage.defaultValueTextInput).toHaveValue("text1 default value");
      await fieldEditorPage.cancelButton.click();
    });

    await test.step("Verify field appears in content page with default value", async () => {
      await schemaPage.contentText.click();
      await expect(contentPage.tableHead).toContainText("text1");
      await contentPage.newItemButton.click();
      await expect(contentPage.firstLabel).toContainText("text1");
      await contentPage.fieldDescriptionText("text1 description").click();
      await expect(contentPage.mainRole).toContainText("text1 description");
      await expect(contentPage.fieldInput("text1")).toHaveValue("text1 default value");
      await contentPage.saveButton.click();
      await contentPage.closeNotification();
      await contentPage.backButtonLabel.click();
      await expect(contentPage.tableBodyRows).toContainText("text1 default value");
    });

    await test.step("Update field with multiple values, validations and new settings", async () => {
      await schemaPage.schemaText.click();
      await fieldEditorPage.ellipsisMenuButton.click();
      await fieldEditorPage.supportMultipleValuesCheckbox.check();
      await fieldEditorPage.useAsTitleCheckbox.check();
      await fieldEditorPage.displayNameInput.click();
      await fieldEditorPage.displayNameInput.fill("new text1");
      await fieldEditorPage.fieldKeyInput.click();
      await fieldEditorPage.fieldKeyInput.fill("new-text1");
      await fieldEditorPage.descriptionInput.click();
      await fieldEditorPage.descriptionInput.fill("new text1 description");
      await fieldEditorPage.validationTab.click();
      await fieldEditorPage.maxLengthInput.click();
      await fieldEditorPage.maxLengthInput.fill("5");
      await fieldEditorPage.requiredFieldCheckbox.check();
      await fieldEditorPage.uniqueFieldCheckbox.check();
      await fieldEditorPage.defaultValueTab.click();
      await expect(fieldEditorPage.defaultValueTextInput).toHaveValue("text1 default value");
      await fieldEditorPage.plusNewButton.click();
      await fieldEditorPage.defaultValueInputByIndex(1).click();
      await fieldEditorPage.defaultValueInputByIndex(1).fill("text2");
      await fieldEditorPage.defaultValueInputByIndex(0).click();
      await fieldEditorPage.defaultValueInputByIndex(0).fill("text1");
      await fieldEditorPage.firstArrowDownButton.click();
      await expect(fieldEditorPage.defaultValueInputByIndex(1)).toHaveValue("text1");
      await fieldEditorPage.okButton.click();
      await contentPage.closeNotification();
      await expect(fieldEditorPage.uniqueFieldText("new text1", "new-text1")).toBeVisible();
    });

    await test.step("Verify updated field in content with multiple values", async () => {
      await schemaPage.contentText.click();
      await expect(contentPage.tableHead).toContainText("new text1");
      await expect(contentPage.cellByText("text1 default value")).toBeVisible();
      await contentPage.newItemButton.click();
      await expect(fieldEditorPage.uniqueFieldLabel("new text1")).toBeVisible();
      await contentPage.fieldDescriptionText("new text1 description").click();
      await expect(contentPage.fieldDescriptionText("new text1 description")).toBeVisible();
      await expect(contentPage.firstTextbox).toHaveValue("text2");
      await expect(contentPage.lastTextbox).toHaveValue("text1");
      await contentPage.saveButton.click();
      await contentPage.closeNotification();
      await contentPage.backButtonLabel.click();
      await contentPage.x2Button.click();
      await expect(contentPage.mainRole).toContainText("new text1text2text1");
    });

    await test.step("Test validation and field manipulation", async () => {
      await contentPage.cellByIndex(1).click();
      await expect(fieldEditorPage.uniqueFieldLabel("new text1")).toBeVisible();
      await fieldEditorPage.deleteButton.first().click();
      await expect(contentPage.pleaseInputFieldText).toBeVisible();
      await fieldEditorPage.plusNewButton.click();
      await expect(contentPage.characterCountText).toBeVisible();
      await expect(contentPage.saveButton).toBeDisabled();
      await contentPage.textBoxByIndex(0).click();
      await contentPage.textBoxByIndex(0).fill("text");
      await fieldEditorPage.plusNewButton.click();
      await contentPage.textBoxByIndex(1).click();
      await contentPage.textBoxByIndex(1).fill("text2");
      await fieldEditorPage.arrowUpButtonByIndex(1).click();
      await expect(contentPage.textBoxByIndex(0)).toHaveValue("text2");
      await expect(contentPage.textBoxByIndex(1)).toHaveValue("text");
      await contentPage.saveButton.click();
      await contentPage.closeNotification();
      await contentPage.backButtonLabel.click();
      await contentPage.getByRole("button", { name: "x2" }).nth(1).click();
      await expect(contentPage.mainRole).toContainText("new text1text2text");
    });
  },
);
