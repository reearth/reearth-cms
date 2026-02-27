import { SchemaFieldType } from "@reearth-cms/components/molecules/Schema/types";
import { expect, TAG, test } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";

const fieldName = "option1";
const fieldKey = "option1";
const fieldDescription = "option1 description";
const fieldHeader = "option1#option1";
const newFieldName = "new option1";
const newFieldKey = "new-option1";
const newFieldDescription = "new option1 description";
const optionFirst = "first";
const optionSecond = "second";
const optionThird = "third";
const optionForth = "forth";
const optionFifth = "fifth";

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
  "Option field creating and updating has succeeded",
  { tag: TAG.SMOKE },
  async ({ fieldEditorPage, contentPage, schemaPage }) => {
    await test.step("Create option field and validate duplicate/empty values", async () => {
      await fieldEditorPage.fieldTypeButton(SchemaFieldType.Select).click();
      await fieldEditorPage.displayNameInput.click();
      await fieldEditorPage.displayNameInput.fill(fieldName);
      await fieldEditorPage.fieldKeyInput.click();
      await fieldEditorPage.fieldKeyInput.fill(fieldKey);
      await fieldEditorPage.descriptionInput.click();
      await fieldEditorPage.descriptionInput.fill(fieldDescription);
      await fieldEditorPage.plusNewButton.click();
      await fieldEditorPage.valuesInput.nth(0).click();
      await fieldEditorPage.valuesInput.nth(0).fill(optionFirst);
      await fieldEditorPage.plusNewButton.click();
      await expect(contentPage.optionTextByName("Empty values are not allowed")).toBeVisible();
      await expect(fieldEditorPage.okButton).toBeDisabled();
      await fieldEditorPage.valuesInput.nth(1).click();
      await fieldEditorPage.valuesInput.nth(1).fill(optionFirst);
      await expect(contentPage.optionTextByName("Option must be unique")).toBeVisible();
      await expect(fieldEditorPage.okButton).toBeDisabled();
      await fieldEditorPage.valuesInput.nth(1).fill(optionSecond);
      await fieldEditorPage.okButton.click();
      await contentPage.closeNotification();
    });

    await test.step("Verify field created and navigate to new item", async () => {
      await expect(schemaPage.fieldsContainer.getByRole("paragraph")).toContainText(fieldHeader);
      await contentPage.contentText.click();
      await contentPage.newItemButton.click();
      await expect(contentPage.locator("label")).toContainText(fieldName);
      await expect(contentPage.mainRole).toContainText(fieldDescription);
    });

    await test.step("Select 'first' option and save item", async () => {
      await contentPage.fieldInput(fieldName).click();
      await expect(fieldEditorPage.optionDiv(optionFirst)).toBeVisible();
      await expect(fieldEditorPage.optionDiv(optionSecond)).toBeVisible();
      await fieldEditorPage.optionDiv(optionFirst).click();
      await expect(contentPage.rootElement.getByText(optionFirst).last()).toBeVisible();
      await contentPage.saveButton.click();
      await contentPage.closeNotification();
    });

    await test.step("Verify option saved correctly", async () => {
      await contentPage.backButton.click();
      await expect(contentPage.optionTextByName(optionFirst)).toBeVisible();
    });

    await test.step("Edit item and change option to 'second'", async () => {
      await contentPage.editButton.click();
      await contentPage.closeCircleLabel.locator("svg").click();
      await contentPage.fieldInput(fieldName).click();
      await fieldEditorPage.optionDiv(optionSecond).click();
      await expect(contentPage.rootElement.getByText(optionSecond).last()).toBeVisible();
      await contentPage.saveButton.click();
      await contentPage.closeNotification();
    });

    await test.step("Verify updated option", async () => {
      await contentPage.backButton.click();
      await expect(contentPage.optionTextByName(optionSecond)).toBeVisible();
    });
  },
);

test(
  "Option field editing has succeeded",
  { tag: TAG.FIELD_VARIANT },
  async ({ fieldEditorPage, contentPage, schemaPage }) => {
    await test.step("Create option field with three values and default", async () => {
      await schemaPage.fieldTypeButton("Option").click();
      await fieldEditorPage.displayNameInput.click();
      await fieldEditorPage.displayNameInput.fill(fieldName);
      await fieldEditorPage.fieldKeyInput.click();
      await fieldEditorPage.fieldKeyInput.fill(fieldKey);
      await fieldEditorPage.descriptionInput.click();
      await fieldEditorPage.descriptionInput.fill(fieldDescription);
      await fieldEditorPage.plusNewButton.click();
      await fieldEditorPage.valuesInput.nth(0).click();
      await fieldEditorPage.valuesInput.nth(0).fill(optionFirst);
      await fieldEditorPage.plusNewButton.click();
      await fieldEditorPage.valuesInput.nth(1).click();
      await fieldEditorPage.valuesInput.nth(1).fill(optionSecond);
      await fieldEditorPage.plusNewButton.click();
      await fieldEditorPage.valuesInput.nth(2).click();
      await fieldEditorPage.valuesInput.nth(2).fill(optionThird);
      await fieldEditorPage.defaultValueTab.click();
      await fieldEditorPage.setDefaultValueInput.click();
      await expect(fieldEditorPage.optionDiv(optionFirst)).toBeVisible();
      await expect(fieldEditorPage.optionDiv(optionSecond)).toBeVisible();
      await expect(fieldEditorPage.optionDiv(optionThird)).toBeVisible();
      await fieldEditorPage.optionDiv(optionSecond).click();
    });

    await test.step("Delete 'second' option and add 'forth' option", async () => {
      await fieldEditorPage.settingsTab.click();
      await fieldEditorPage.deleteButton.nth(1).click();
      await fieldEditorPage.plusNewButton.click();
      await fieldEditorPage.valuesInput.nth(2).click();
      await fieldEditorPage.valuesInput.nth(2).fill(optionForth);
    });

    await test.step("Verify deleted option removed from default and set new default", async () => {
      await fieldEditorPage.defaultValueTab.click();
      await fieldEditorPage.setDefaultValueInput.click();
      await expect(fieldEditorPage.optionDiv(optionFirst)).toBeVisible();
      await expect(fieldEditorPage.optionDiv(optionSecond)).toBeHidden();
      await expect(fieldEditorPage.optionDiv(optionThird)).toBeVisible();
      await expect(fieldEditorPage.optionDiv(optionForth)).toBeVisible();
      await fieldEditorPage.optionDiv(optionThird).click();
      await fieldEditorPage.okButton.click();
      await contentPage.closeNotification();
    });

    await test.step("Create new item and verify default value applied", async () => {
      await contentPage.contentText.click();
      await expect(contentPage.tableHead).toContainText(fieldName);
      await contentPage.newItemButton.click();
      await expect(contentPage.optionTextByName(optionThird)).toBeVisible();
      await contentPage.optionTextByName(optionThird).click();
      await expect(fieldEditorPage.optionDiv(optionFirst)).toBeVisible();
      await expect(fieldEditorPage.optionDiv(optionThird)).toBeVisible();
      await expect(fieldEditorPage.optionDiv(optionForth)).toBeVisible();
      await contentPage.saveButton.click();
      await contentPage.closeNotification();
    });

    await test.step("Verify item saved with default option", async () => {
      await contentPage.backButton.click();
      await expect(contentPage.optionTextByName(optionThird)).toBeVisible();
    });

    await test.step("Edit field: rename, add fifth option, enable multiple values and validations", async () => {
      await schemaPage.schemaText.click();
      // TODO(editField): cannot migrate — different open pattern + complex option manipulation
      await schemaPage.fieldEditButton.click();
      await fieldEditorPage.displayNameInput.click();
      await fieldEditorPage.displayNameInput.press("Home");
      await fieldEditorPage.displayNameInput.fill(newFieldName);
      await fieldEditorPage.fieldKeyInput.click();
      await fieldEditorPage.fieldKeyInput.press("Home");
      await fieldEditorPage.fieldKeyInput.fill(newFieldKey);
      await fieldEditorPage.descriptionInput.click();
      await fieldEditorPage.descriptionInput.press("Home");
      await fieldEditorPage.descriptionInput.fill(newFieldDescription);
      await fieldEditorPage.plusNewButton.click();
      await fieldEditorPage.valuesInput.nth(3).click();
      await fieldEditorPage.valuesInput.nth(3).fill(optionFifth);
      await fieldEditorPage.supportMultipleValuesCheckbox.check();
      await expect(fieldEditorPage.useAsTitleCheckbox).toBeHidden();
      await fieldEditorPage.validationTab.click();
      await fieldEditorPage.requiredFieldCheckbox.check();
      await fieldEditorPage.uniqueFieldCheckbox.check();
    });

    await test.step("Add second default value", async () => {
      await fieldEditorPage.defaultValueTab.click();
      await expect(contentPage.optionTextByName(optionThird)).toBeVisible();
      await fieldEditorPage.plusNewButton.click();
      await fieldEditorPage.selectValueItem.nth(1).click();
      await expect(fieldEditorPage.optionDiv(optionFirst)).toBeVisible();
      await expect(fieldEditorPage.optionDiv(optionThird)).toBeVisible();
      await expect(fieldEditorPage.optionDiv(optionForth)).toBeVisible();
      await expect(fieldEditorPage.optionDiv(optionFifth)).toBeVisible();
    });

    await test.step("Rename all option values", async () => {
      await fieldEditorPage.settingsTab.click();
      await fieldEditorPage.setOptionsLabel.click();
      await fieldEditorPage.setOptionsLabel.fill("new first");
      await fieldEditorPage.valuesInput.nth(1).click();
      await fieldEditorPage.valuesInput.nth(1).fill("new third");
      await fieldEditorPage.valuesInput.nth(2).click();
      await fieldEditorPage.valuesInput.nth(2).fill("new forth");
      await fieldEditorPage.valuesInput.nth(3).click();
      await fieldEditorPage.valuesInput.nth(3).fill("new fifth");
    });

    await test.step("Update default values with renamed options", async () => {
      await fieldEditorPage.defaultValueTab.click();
      await expect(contentPage.optionTextByName(optionThird)).toBeHidden();

      await fieldEditorPage.plusNewButton.click();
      await fieldEditorPage.selectValueItem.nth(0).click();
      await expect(fieldEditorPage.optionDiv("new first")).toBeVisible();
      await expect(fieldEditorPage.optionDiv("new third")).toBeVisible();
      await expect(fieldEditorPage.optionDiv("new forth")).toBeVisible();
      await expect(fieldEditorPage.optionDiv("new fifth")).toBeVisible();
      await fieldEditorPage.optionDiv("new first").click();
      await fieldEditorPage.plusNewButton.click();
      await fieldEditorPage.selectValueItem.nth(1).click();
      await fieldEditorPage.optionDiv("new third").last().click();
      await fieldEditorPage.updateOptionLabel
        .getByRole("button", { name: "delete" })
        .last()
        .click();
      await fieldEditorPage.plusNewButton.click();
      await fieldEditorPage.selectValueItem.nth(1).click();
      await fieldEditorPage.optionDiv("new third").last().click();
      await fieldEditorPage.okButton.click();
      await contentPage.closeNotification();
      // TODO(editField): end migration block
    });

    await test.step("Verify updated field in schema", async () => {
      await expect(contentPage.optionTextByName("new option1 *#new-option1(unique)")).toBeVisible();
    });

    await test.step("Verify existing item retains old option value", async () => {
      await contentPage.contentText.click();
      await expect(contentPage.tableHead).toContainText(fieldName);
      await expect(contentPage.optionTextByName(optionThird)).toBeVisible();
    });

    await test.step("Create new item with multiple default values", async () => {
      await contentPage.newItemButton.click();
      await expect(contentPage.optionTextByName("new option1(unique)")).toBeVisible();
      await expect(contentPage.optionTextByName("new first")).toBeVisible();
      await expect(contentPage.optionTextByName("new third")).toBeVisible();
      await contentPage.saveButton.click();
      await contentPage.closeNotification();
    });

    await test.step("Verify multiple options displayed in list view", async () => {
      await contentPage.backButton.click();
      await expect(contentPage.cellByComplexName("new first new third")).toBeVisible();
    });
  },
);
