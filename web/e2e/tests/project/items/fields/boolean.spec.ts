import { SchemaFieldType } from "@reearth-cms/components/molecules/Schema/types";
import { expect, TAG, test } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";

const fieldName = "boolean1";
const fieldKey = "boolean1";
const fieldDescription = "boolean1 description";
const fieldHeader = "boolean1#boolean1";
const newFieldName = "new boolean1";
const newFieldKey = "new-boolean1";
const newFieldDescription = "new boolean1 description";

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
  "Boolean field creating and updating has succeeded",
  { tag: TAG.SMOKE },
  async ({ fieldEditorPage, contentPage }) => {
    await fieldEditorPage.createField({
      type: SchemaFieldType.Bool,
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
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
    await contentPage.backButton.click();
    await expect(contentPage.allSwitches).toHaveAttribute("aria-checked", "true");
    await contentPage.editButton.click();
    await expect(contentPage.allSwitches).toHaveAttribute("aria-checked", "true");
    await contentPage.fieldInput(fieldName).click();
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
    await contentPage.backButton.click();
    await expect(contentPage.allSwitches).toHaveAttribute("aria-checked", "false");
  },
);

test(
  "Boolean field editing has succeeded",
  { tag: TAG.FIELD_VARIANT },
  async ({ fieldEditorPage, contentPage, schemaPage }) => {
    await fieldEditorPage.createField({
      type: SchemaFieldType.Bool,
      name: fieldName,
      key: fieldKey,
      description: fieldDescription,
      defaultValue: true,
    });
    await contentPage.contentText.click();
    await expect(contentPage.tableHead).toContainText(fieldName);
    await contentPage.newItemButton.click();
    await expect(contentPage.allSwitches).toHaveAttribute("aria-checked", "true");
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
    await contentPage.backButton.click();
    await expect(contentPage.allSwitches).toHaveAttribute("aria-checked", "true");
    await schemaPage.schemaText.click();
    // TODO(editField): cannot migrate — interleaved reorder + validation disabled assertions
    await fieldEditorPage.ellipsisMenuButton.click();
    await fieldEditorPage.displayNameInput.click();
    await fieldEditorPage.displayNameInput.fill(newFieldName);
    await fieldEditorPage.fieldKeyInput.click();
    await fieldEditorPage.fieldKeyInput.fill(newFieldKey);
    await fieldEditorPage.descriptionInput.click();
    await fieldEditorPage.descriptionInput.fill(newFieldDescription);
    await fieldEditorPage.supportMultipleValuesCheckbox.check();
    await expect(fieldEditorPage.useAsTitleCheckbox).toBeHidden();
    await fieldEditorPage.validationTab.click();
    await expect(fieldEditorPage.requiredFieldCheckbox).toBeDisabled();
    await expect(fieldEditorPage.uniqueFieldCheckbox).toBeDisabled();
    await fieldEditorPage.defaultValueTab.click();
    await expect(fieldEditorPage.switchByIndex(0)).toHaveAttribute("aria-checked", "true");
    await fieldEditorPage.plusNewButton.click();
    await expect(fieldEditorPage.switchByIndex(1)).toHaveAttribute("aria-checked", "false");
    await fieldEditorPage.firstArrowDownButton.click();
    await expect(fieldEditorPage.switchByIndex(0)).toHaveAttribute("aria-checked", "false");
    await expect(fieldEditorPage.switchByIndex(1)).toHaveAttribute("aria-checked", "true");
    await fieldEditorPage.okButton.click();
    await contentPage.closeNotification();
    // TODO(editField): end migration block
    await expect(schemaPage.fieldText(newFieldName, newFieldKey)).toBeVisible();
    await contentPage.contentText.click();
    await expect(contentPage.tableHead).toContainText(newFieldName);
    await expect(contentPage.checkSwitch).toBeVisible();
    await contentPage.newItemButton.click();
    await expect(contentPage.switchByIndex(0)).toHaveAttribute("aria-checked", "false");
    await expect(contentPage.switchByIndex(1)).toHaveAttribute("aria-checked", "true");
    await fieldEditorPage.plusNewButton.click();
    await expect(contentPage.switchByIndex(2)).toHaveAttribute("aria-checked", "false");
    await fieldEditorPage.arrowUpButtonByIndex(2).click();
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
    await contentPage.backButton.click();
    await contentPage.x3Button.click();
    await expect(contentPage.tooltip).toContainText(newFieldName);
    await expect(contentPage.switchByIndex(1)).toHaveAttribute("aria-checked", "false");
    await expect(contentPage.switchByIndex(2)).toHaveAttribute("aria-checked", "false");
    await expect(contentPage.switchByIndex(3)).toHaveAttribute("aria-checked", "true");
  },
);
