import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";

test.beforeEach(async ({ projectPage }) => {
  await projectPage.goto("/", { waitUntil: "domcontentloaded" });
  const projectName = getId();
  await projectPage.createProject(projectName);
  await projectPage.gotoProject(projectName);
  await projectPage.createModelFromOverview();
});

test.afterEach(async ({ projectPage }) => {
  await projectPage.deleteProject();
});

test("Boolean metadata creating and updating has succeeded", async ({
  fieldEditorPage,
  contentPage,
  schemaPage,
}) => {
  await test.step("Create boolean metadata field", async () => {
    await schemaPage.metaDataTab.click();
    await schemaPage.booleanListItem.click();
    await fieldEditorPage.displayNameInput.fill("boolean1");
    await fieldEditorPage.fieldKeyInput.fill("boolean1");
    await fieldEditorPage.descriptionRequiredInput.fill("boolean1 description");
    await fieldEditorPage.okButton.click();
    await contentPage.closeNotification();
    await expect(fieldEditorPage.fieldText("boolean1", "boolean1")).toBeVisible();
  });

  await test.step("Verify metadata field settings", async () => {
    await fieldEditorPage.ellipsisButton.click();
    await expect(fieldEditorPage.displayNameInput).toHaveValue("boolean1");
    await expect(fieldEditorPage.fieldKeyInput).toHaveValue("boolean1");
    await expect(fieldEditorPage.descriptionRequiredInput).toHaveValue("boolean1 description");
    await expect(fieldEditorPage.supportMultipleValuesCheckbox).not.toBeChecked();
    await expect(fieldEditorPage.useAsTitleCheckbox).toBeHidden();
    await fieldEditorPage.validationTab.click();
    await expect(fieldEditorPage.requiredFieldCheckbox).toBeDisabled();
    await expect(fieldEditorPage.uniqueFieldCheckbox).toBeDisabled();
    await fieldEditorPage.defaultValueTab.click();
    await expect(fieldEditorPage.setDefaultValueSwitch).toHaveAttribute("aria-checked", "false");
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
});

test("Boolean metadata editing has succeeded", async ({
  fieldEditorPage,
  contentPage,
  schemaPage,
}) => {
  await test.step("Create boolean metadata with default true value", async () => {
    await schemaPage.metaDataTab.click();
    await schemaPage.booleanListItem.click();
    await fieldEditorPage.displayNameInput.fill("boolean1");
    await fieldEditorPage.fieldKeyInput.fill("boolean1");
    await fieldEditorPage.descriptionRequiredInput.fill("boolean1 description");
    await fieldEditorPage.defaultValueTab.click();
    await fieldEditorPage.setDefaultValueSwitch.click();
    await fieldEditorPage.okButton.click();
    await contentPage.closeNotification();
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
    await fieldEditorPage.ellipsisButton.click();
    await fieldEditorPage.displayNameInput.fill("new boolean1");
    await fieldEditorPage.fieldKeyInput.fill("new-boolean1");
    await fieldEditorPage.descriptionRequiredInput.fill("new boolean1 description");
    await fieldEditorPage.supportMultipleValuesCheckbox.check();
    await fieldEditorPage.defaultValueTab.click();
    await expect(fieldEditorPage.firstSwitch).toHaveAttribute("aria-checked", "true");
    await fieldEditorPage.plusNewButton.click();
    await expect(fieldEditorPage.switchByIndex(1)).toHaveAttribute("aria-checked", "false");
    await fieldEditorPage.switchByIndex(1).click();
    await fieldEditorPage.okButton.click();
    await contentPage.closeNotification();
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
});
