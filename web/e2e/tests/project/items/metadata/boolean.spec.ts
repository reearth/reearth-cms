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
  "Boolean metadata creating and updating has succeeded",
  { tag: TAG.FIELD_VARIANT },
  async ({ fieldEditorPage, contentPage, schemaPage }) => {
    await test.step("Create boolean metadata field", async () => {
      await schemaPage.metaDataTab.click();
      await fieldEditorPage.createField({
        type: SchemaFieldType.Bool,
        name: "boolean1",
        key: "boolean1",
        description: "boolean1 description",
        metadata: true,
      });
      await expect(fieldEditorPage.fieldText("boolean1", "boolean1")).toBeVisible();
    });

    await test.step("Verify metadata field settings", async () => {
      await fieldEditorPage.ellipsisButton.click();
      await expect(fieldEditorPage.displayNameInput).toHaveValue("boolean1");
      await expect(fieldEditorPage.fieldKeyInput).toHaveValue("boolean1");
      await expect(fieldEditorPage.descriptionInput).toHaveValue("boolean1 description");
      await expect(fieldEditorPage.supportMultipleValuesCheckbox).not.toBeChecked();
      await expect(fieldEditorPage.useAsTitleCheckbox).toBeHidden();
      await fieldEditorPage.validationTab.click();
      await expect(fieldEditorPage.requiredFieldCheckbox).toBeDisabled();
      await expect(fieldEditorPage.uniqueFieldCheckbox).toBeDisabled();
      await fieldEditorPage.defaultValueTab.click();
      await expect(fieldEditorPage.setDefaultValueInput).toHaveAttribute("aria-checked", "false");
      await fieldEditorPage.cancelButton.click();
    });

    await test.step("Create item with default boolean value", async () => {
      await schemaPage.contentMenuItem.click();
      await contentPage.newItemButton.click();
      await expect(contentPage.fieldInput("boolean1")).toBeVisible();
      await expect(contentPage.fieldDescriptionText("boolean1 description")).toBeVisible();
      await contentPage.saveButton.click();
      await contentPage.closeNotification();
      await expect(contentPage.itemInformationHeading).toBeVisible();
      await expect(contentPage.fieldInput("boolean1")).toHaveAttribute("aria-checked", "false");
    });

    await test.step("Update boolean from table view to true", async () => {
      await contentPage.backButtonRole.click();
      await contentPage.closeSwitch.click();
      await contentPage.closeNotification();
      await expect(contentPage.checkSwitch).toBeVisible();
    });

    await test.step("Update boolean from edit view to false", async () => {
      await contentPage.cellEditButton.click();
      await expect(contentPage.fieldInput("boolean1")).toHaveAttribute("aria-checked", "true");
      await contentPage.fieldInput("boolean1").click();
      await contentPage.closeNotification();
      await expect(contentPage.fieldInput("boolean1")).toHaveAttribute("aria-checked", "false");
    });

    await test.step("Verify updated boolean in table view", async () => {
      await contentPage.backButtonRole.click();
      await expect(contentPage.closeSwitch).toBeVisible();
    });
  },
);

test(
  "Boolean metadata editing has succeeded",
  { tag: TAG.FIELD_VARIANT },
  async ({ fieldEditorPage, contentPage, schemaPage }) => {
    await test.step("Create boolean metadata with default true value", async () => {
      await schemaPage.metaDataTab.click();
      await fieldEditorPage.createField({
        type: SchemaFieldType.Bool,
        name: "boolean1",
        key: "boolean1",
        description: "boolean1 description",
        defaultValue: true,
        metadata: true,
      });
    });

    await test.step("Verify field in content and create item with default value", async () => {
      await schemaPage.contentMenuItem.click();
      await expect(contentPage.columnHeaderWithEdit("boolean1")).toBeVisible();
      await contentPage.newItemButton.click();
      await expect(contentPage.fieldInput("boolean1")).toHaveAttribute("aria-checked", "true");
      await contentPage.saveButton.click();
      await contentPage.closeNotification();
    });

    await test.step("Update metadata with multiple values", async () => {
      await schemaPage.schemaMenuItem.click();
      await schemaPage.metaDataTab.click();
      await fieldEditorPage.editField({
        type: SchemaFieldType.Bool,
        metadata: true,
        name: "new boolean1",
        key: "new-boolean1",
        description: "new boolean1 description",
        multiple: true,
        addDefaultValues: [true],
      });
      await expect(schemaPage.getByText("new boolean1")).toBeVisible();
      await expect(schemaPage.getByText("#new-boolean1")).toBeVisible();
    });

    await test.step("Verify updated metadata in content and create new item", async () => {
      await schemaPage.contentMenuItem.click();
      await expect(contentPage.columnHeaderWithEdit("new boolean1")).toBeVisible();
      await expect(contentPage.checkSwitch).toBeVisible();
      await contentPage.newItemButton.click();
      await expect(contentPage.getByText("new boolean1", { exact: true })).toBeVisible();
      await expect(contentPage.fieldDescriptionText("new boolean1 description")).toBeVisible();
      await expect(contentPage.switchByIndex(0)).toHaveAttribute("aria-checked", "true");
      await expect(contentPage.switchByIndex(1)).toHaveAttribute("aria-checked", "true");
      await contentPage.saveButton.click();
      await contentPage.closeNotification();
      await expect(contentPage.switchByIndex(0)).toHaveAttribute("aria-checked", "true");
      await expect(contentPage.switchByIndex(1)).toHaveAttribute("aria-checked", "true");
    });

    await test.step("Update boolean from tooltip in table view", async () => {
      await contentPage.backButtonRole.click();
      await contentPage.x2Button.click();
      await expect(contentPage.tooltipSwitchByIndex(0)).toHaveAttribute("aria-checked", "true");
      await expect(contentPage.tooltipSwitchByIndex(1)).toHaveAttribute("aria-checked", "true");
      await contentPage.tooltipSwitchByIndex(0).click();
      await contentPage.closeNotification();
    });

    await test.step("Add third value from edit view", async () => {
      await contentPage.cellEditButtonByIndex(0).click();
      await expect(contentPage.switchByIndex(0)).toHaveAttribute("aria-checked", "false");
      await expect(contentPage.switchByIndex(1)).toHaveAttribute("aria-checked", "true");
      await fieldEditorPage.plusNewButton.click();
      await contentPage.closeNotification();
      await expect(contentPage.switchByIndex(0)).toHaveAttribute("aria-checked", "false");
      await expect(contentPage.switchByIndex(1)).toHaveAttribute("aria-checked", "true");
      await expect(contentPage.switchByIndex(2)).toHaveAttribute("aria-checked", "false");
    });

    await test.step("Verify all three values in table view", async () => {
      await contentPage.backButtonLabel.click();
      await contentPage.x3Button.click();
      await expect(contentPage.tooltipSwitchByIndex(0)).toHaveAttribute("aria-checked", "false");
      await expect(contentPage.tooltipSwitchByIndex(1)).toHaveAttribute("aria-checked", "true");
      await expect(contentPage.tooltipSwitchByIndex(2)).toHaveAttribute("aria-checked", "false");
    });
  },
);
