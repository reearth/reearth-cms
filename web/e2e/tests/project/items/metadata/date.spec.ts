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
  "Date metadata creating and updating has succeeded",
  { tag: TAG.FIELD_VARIANT },
  async ({ fieldEditorPage, contentPage }) => {
    await test.step("Create date metadata field", async () => {
      await fieldEditorPage.metaDataTab.click();
      await fieldEditorPage.createField({
        type: SchemaFieldType.Date,
        name: "date1",
        key: "date1",
        description: "date1 description",
        metadata: true,
      });
      await expect(fieldEditorPage.fieldText("date1", "date1")).toBeVisible();
    });

    await test.step("Verify field settings and validations", async () => {
      await fieldEditorPage.ellipsisButton.click();
      await expect(fieldEditorPage.displayNameInput).toHaveValue("date1");
      await expect(fieldEditorPage.fieldKeyInput).toHaveValue("date1");
      await expect(fieldEditorPage.descriptionInput).toHaveValue("date1 description");
      await expect(fieldEditorPage.supportMultipleValuesCheckbox).not.toBeChecked();
      await expect(fieldEditorPage.useAsTitleCheckbox).toBeHidden();

      await fieldEditorPage.validationTab.click();
      await expect(fieldEditorPage.requiredFieldCheckbox).not.toBeChecked();
      await expect(fieldEditorPage.uniqueFieldCheckbox).not.toBeChecked();

      await fieldEditorPage.defaultValueTab.click();
      await expect(fieldEditorPage.selectDatePlaceholder).toBeEmpty();
      await fieldEditorPage.cancelButton.click();
    });

    await test.step("Create new item with date value", async () => {
      await fieldEditorPage.menuItemByName("Content").click();
      await contentPage.newItemButton.click();
      await expect(contentPage.fieldInput("date1")).toBeVisible();
      await expect(contentPage.fieldDescriptionText("date1 description")).toBeVisible();

      await contentPage.fieldInput("date1").fill("2024-01-01");
      await contentPage.fieldInput("date1").press("Enter");
      await contentPage.saveButton.click();
      await contentPage.closeNotification();
      await expect(contentPage.itemInformationHeading).toBeVisible();
      await expect(contentPage.fieldInput("date1")).toHaveValue("2024-01-01");
    });

    await test.step("Update date value inline in list view", async () => {
      await contentPage.backButtonRole.click();
      await expect(contentPage.textBoxes).toHaveValue("2024-01-01");
      await contentPage.textBoxes.fill("2024-01-02");
      await contentPage.textBoxes.press("Enter");
      await contentPage.closeNotification();
      await expect(contentPage.textBoxes).toHaveValue("2024-01-02");
    });

    await test.step("Update date value in item edit view", async () => {
      await contentPage.cellEditButton.click();
      await expect(contentPage.fieldInput("date1")).toHaveValue("2024-01-02");

      await contentPage.fieldInput("date1").fill("2024-01-03");
      await contentPage.fieldInput("date1").press("Enter");
      await contentPage.closeNotification();
      await expect(contentPage.fieldInput("date1")).toHaveValue("2024-01-03");
    });

    await test.step("Verify final date value in list view", async () => {
      await contentPage.backButtonRole.click();
      await expect(contentPage.textBoxes).toHaveValue("2024-01-03");
    });
  },
);

test(
  "Date metadata editing has succeeded",
  { tag: TAG.FIELD_VARIANT },
  async ({ fieldEditorPage, contentPage }) => {
    await test.step("Create date metadata field with default value", async () => {
      await fieldEditorPage.metaDataTab.click();
      await fieldEditorPage.createField({
        type: SchemaFieldType.Date,
        name: "date1",
        key: "date1",
        description: "date1 description",
        defaultValue: "2024-01-01",
        metadata: true,
      });
    });

    await test.step("Verify field created and create item with default value", async () => {
      await fieldEditorPage.menuItemByName("Content").click();
      await expect(fieldEditorPage.columnHeaderWithEdit("date1")).toBeVisible();

      await contentPage.newItemButton.click();
      await expect(contentPage.fieldInput("date1")).toHaveValue("2024-01-01");

      await contentPage.saveButton.click();
      await contentPage.closeNotification();
    });

    await test.step("Edit field: rename, enable multiple values, validations and defaults", async () => {
      await fieldEditorPage.menuItemByName("Schema").click();
      await fieldEditorPage.metaDataTab.click();
      await fieldEditorPage.editField({
        type: SchemaFieldType.Date,
        metadata: true,
        name: "new date1",
        key: "new-date1",
        description: "new date1 description",
        multiple: true,
        required: true,
        unique: true,
        addDefaultValues: ["2024-01-02"],
      });
      await expect(fieldEditorPage.uniqueFieldText("new date1", "new-date1")).toBeVisible();
    });

    await test.step("Verify existing item and create new item with multiple defaults", async () => {
      await fieldEditorPage.menuItemByName("Content").click();
      await expect(fieldEditorPage.columnHeaderWithEdit("new date1")).toBeVisible();
      await expect(contentPage.textBoxes).toHaveValue("2024-01-01");

      await contentPage.newItemButton.click();
      await expect(fieldEditorPage.uniqueFieldLabel("new date1")).toBeVisible();
      await expect(contentPage.fieldDescriptionText("new date1 description")).toBeVisible();
      await expect(contentPage.textBoxByIndex(0)).toHaveValue("2024-01-01");
      await expect(contentPage.textBoxByIndex(1)).toHaveValue("2024-01-02");

      await contentPage.saveButton.click();
      await contentPage.closeNotification();
      await expect(contentPage.textBoxByIndex(0)).toHaveValue("2024-01-01");
      await expect(contentPage.textBoxByIndex(1)).toHaveValue("2024-01-02");
    });

    await test.step("Update second date value inline in list view tooltip", async () => {
      await contentPage.backButtonRole.click();
      await contentPage.x2Button.click();
      await expect(fieldEditorPage.tooltipTextbox(0)).toHaveValue("2024-01-01");
      await expect(fieldEditorPage.tooltipTextbox(1)).toHaveValue("2024-01-02");

      await fieldEditorPage.tooltipTextbox(1).fill("2024-01-03");
      await fieldEditorPage.tooltipTextbox(1).press("Enter");
      await contentPage.closeNotification();
    });

    await test.step("Add third date value in item edit view", async () => {
      await contentPage.cellEditButtonByIndex(0).click();
      await expect(contentPage.textBoxByIndex(0)).toHaveValue("2024-01-01");
      await expect(contentPage.textBoxByIndex(1)).toHaveValue("2024-01-03");
      await fieldEditorPage.plusNewButton.click();
      await fieldEditorPage.lastTextbox.fill("2024-01-02");
      await fieldEditorPage.lastTextbox.press("Enter");
      await contentPage.closeNotification();
    });

    await test.step("Verify all three date values in list view tooltip", async () => {
      await contentPage.backButtonLabel.click();
      await fieldEditorPage.x3Button.click();
      await expect(fieldEditorPage.tooltipTextbox(0)).toHaveValue("2024-01-01");
      await expect(fieldEditorPage.tooltipTextbox(1)).toHaveValue("2024-01-03");
      await expect(fieldEditorPage.tooltipTextbox(2)).toHaveValue("2024-01-02");
    });
  },
);
