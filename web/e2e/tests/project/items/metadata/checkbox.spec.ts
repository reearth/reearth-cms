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
  "Checkbox metadata creating and updating has succeeded",
  { tag: TAG.SMOKE },
  async ({ fieldEditorPage, contentPage, schemaPage }) => {
    await test.step("Create checkbox metadata field", async () => {
      await schemaPage.metaDataTab.click();
      await fieldEditorPage.createField({
        type: SchemaFieldType.Checkbox,
        name: "checkbox1",
        key: "checkbox1",
        description: "checkbox1 description",
        metadata: true,
      });
      await expect(fieldEditorPage.fieldText("checkbox1", "checkbox1")).toBeVisible();
    });

    await test.step("Verify metadata field settings", async () => {
      await fieldEditorPage.ellipsisButton.click();
      await expect(fieldEditorPage.displayNameInput).toHaveValue("checkbox1");
      await expect(fieldEditorPage.fieldKeyInput).toHaveValue("checkbox1");
      await expect(fieldEditorPage.descriptionInput).toHaveValue("checkbox1 description");
      await expect(fieldEditorPage.supportMultipleValuesCheckbox).not.toBeChecked();
      await expect(fieldEditorPage.useAsTitleCheckbox).toBeHidden();
      await fieldEditorPage.validationTab.click();
      await expect(fieldEditorPage.requiredFieldCheckbox).toBeDisabled();
      await expect(fieldEditorPage.uniqueFieldCheckbox).toBeDisabled();
      await fieldEditorPage.defaultValueTab.click();
      await expect(fieldEditorPage.setDefaultValueInput).not.toBeChecked();
      await fieldEditorPage.cancelButton.click();
    });

    await test.step("Create item with default checkbox value", async () => {
      await schemaPage.contentMenuItem.click();
      await contentPage.newItemButton.click();
      await expect(contentPage.fieldInput("checkbox1")).toBeVisible();
      await expect(contentPage.fieldDescriptionText("checkbox1 description")).toBeVisible();
      await contentPage.saveButton.click();
      await contentPage.closeNotification();
      await expect(contentPage.itemInformationHeading).toBeVisible();
      await expect(contentPage.fieldInput("checkbox1")).not.toBeChecked();
    });

    await test.step("Update checkbox from table view to checked", async () => {
      await contentPage.backButtonRole.click();
      await contentPage.lastCellCheckbox.check();
      await contentPage.closeNotification();
      await expect(contentPage.lastCellCheckbox).toBeChecked();
    });

    await test.step("Update checkbox from edit view to unchecked", async () => {
      await contentPage.cellEditButton.click();
      await expect(contentPage.fieldInput("checkbox1")).toBeChecked();
      await contentPage.fieldInput("checkbox1").uncheck();
      await contentPage.closeNotification();
      await expect(contentPage.fieldInput("checkbox1")).not.toBeChecked();
    });

    await test.step("Verify updated checkbox in table view", async () => {
      await contentPage.backButtonRole.click();
      await expect(contentPage.lastCellCheckbox).not.toBeChecked();
    });
  },
);

test(
  "Checkbox metadata editing has succeeded",
  { tag: TAG.FIELD_VARIANT },
  async ({ fieldEditorPage, contentPage, schemaPage }) => {
    await test.step("Create checkbox metadata with default checked value", async () => {
      await schemaPage.metaDataTab.click();
      await fieldEditorPage.createField({
        type: SchemaFieldType.Checkbox,
        name: "checkbox1",
        key: "checkbox1",
        description: "checkbox1 description",
        defaultValue: true,
        metadata: true,
      });
    });

    await test.step("Verify field in content and create item with default value", async () => {
      await schemaPage.contentMenuItem.click();
      await expect(contentPage.columnHeaderWithEdit("checkbox1")).toBeVisible();
      await contentPage.newItemButton.click();
      await expect(contentPage.fieldInput("checkbox1")).toBeChecked();
      await contentPage.saveButton.click();
      await contentPage.closeNotification();
    });

    await test.step("Update metadata with multiple values", async () => {
      await schemaPage.schemaMenuItem.click();
      await schemaPage.metaDataTab.click();
      await fieldEditorPage.editField({
        type: SchemaFieldType.Checkbox,
        metadata: true,
        name: "new checkbox1",
        key: "new-checkbox1",
        description: "new checkbox1 description",
        multiple: true,
        addDefaultValues: [true],
      });
      await expect(schemaPage.getByText("new checkbox1")).toBeVisible();
      await expect(schemaPage.getByText("#new-checkbox1")).toBeVisible();
    });

    await test.step("Verify updated metadata in content and create new item", async () => {
      await schemaPage.contentMenuItem.click();
      await expect(contentPage.columnHeaderWithEdit("new checkbox1")).toBeVisible();
      await expect(contentPage.lastCellCheckbox).toBeChecked();
      await contentPage.newItemButton.click();
      await expect(contentPage.getByText("new checkbox1", { exact: true })).toBeVisible();
      await expect(contentPage.fieldDescriptionText("new checkbox1 description")).toBeVisible();
      await expect(contentPage.checkboxByIndex(0)).toBeChecked();
      await expect(contentPage.checkboxByIndex(1)).toBeChecked();
      await contentPage.saveButton.click();
      await contentPage.closeNotification();
      await expect(contentPage.checkboxByIndex(0)).toBeChecked();
      await expect(contentPage.checkboxByIndex(1)).toBeChecked();
    });

    await test.step("Update checkbox from tooltip in table view", async () => {
      await contentPage.backButtonRole.click();
      await contentPage.x2Button.click();
      await expect(contentPage.tooltipCheckboxByIndex(0)).toBeChecked();
      await expect(contentPage.tooltipCheckboxByIndex(1)).toBeChecked();
      await contentPage.tooltipCheckboxByIndex(0).uncheck();
      await contentPage.closeNotification();
    });

    await test.step("Add third value from edit view", async () => {
      await contentPage.cellEditButtonByIndex(0).click();
      await expect(contentPage.checkboxByIndex(0)).not.toBeChecked();
      await expect(contentPage.checkboxByIndex(1)).toBeChecked();
      await fieldEditorPage.plusNewButton.click();
      await contentPage.closeNotification();
      await expect(contentPage.checkboxByIndex(0)).not.toBeChecked();
      await expect(contentPage.checkboxByIndex(1)).toBeChecked();
      await expect(contentPage.checkboxByIndex(2)).not.toBeChecked();
    });

    await test.step("Verify all three values in table view", async () => {
      await contentPage.backButtonLabel.click();
      await contentPage.x3Button.click();
      await expect(contentPage.tooltipCheckboxByIndex(0)).not.toBeChecked();
      await expect(contentPage.tooltipCheckboxByIndex(1)).toBeChecked();
      await expect(contentPage.tooltipCheckboxByIndex(2)).not.toBeChecked();
    });
  },
);
