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

test("Date metadata creating and updating has succeeded", async ({
  fieldEditorPage,
  contentPage,
  page,
}) => {
  await test.step("Create date metadata field", async () => {
    await fieldEditorPage.metaDataTab.click();
    await fieldEditorPage.fieldTypeListItem("Date").click();
    await fieldEditorPage.displayNameInput.fill("date1");
    await fieldEditorPage.fieldKeyInput.fill("date1");
    await fieldEditorPage.descriptionRequiredInput.fill("date1 description");
    await fieldEditorPage.okButton.click();
    await contentPage.closeNotification();
    await expect(fieldEditorPage.fieldText("date1", "date1")).toBeVisible();
  });

  await test.step("Verify field settings and validations", async () => {
    await fieldEditorPage.ellipsisButton.click();
    await expect(fieldEditorPage.displayNameInput).toHaveValue("date1");
    await expect(fieldEditorPage.fieldKeyInput).toHaveValue("date1");
    await expect(fieldEditorPage.descriptionRequiredInput).toHaveValue("date1 description");
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
});

test("Date metadata editing has succeeded", async ({ fieldEditorPage, contentPage, page }) => {
  await test.step("Create date metadata field with default value", async () => {
    await fieldEditorPage.metaDataTab.click();
    await fieldEditorPage.fieldTypeListItem("Date").click();
    await fieldEditorPage.displayNameInput.fill("date1");
    await fieldEditorPage.fieldKeyInput.fill("date1");
    await fieldEditorPage.descriptionRequiredInput.fill("date1 description");
    await fieldEditorPage.defaultValueTab.click();
    await fieldEditorPage.setDefaultValueInput.fill("2024-01-01");
    await fieldEditorPage.selectDatePlaceholder.press("Enter");
    await fieldEditorPage.okButton.click();
    await contentPage.closeNotification();
  });

  await test.step("Verify field created and create item with default value", async () => {
    await fieldEditorPage.menuItemByName("Content").click();
    await expect(fieldEditorPage.columnHeaderWithEdit("date1")).toBeVisible();

    await contentPage.newItemButton.click();
    await expect(contentPage.fieldInput("date1")).toHaveValue("2024-01-01");

    await contentPage.saveButton.click();
    await contentPage.closeNotification();
  });

  await test.step("Edit field: rename, enable multiple values and validations", async () => {
    await fieldEditorPage.menuItemByName("Schema").click();
    await fieldEditorPage.metaDataTab.click();
    await fieldEditorPage.ellipsisButton.click();
    await fieldEditorPage.displayNameInput.fill("new date1");
    await fieldEditorPage.fieldKeyInput.fill("new-date1");
    await fieldEditorPage.descriptionRequiredInput.fill("new date1 description");
    await fieldEditorPage.supportMultipleValuesCheckbox.check();
    await fieldEditorPage.validationTab.click();
    await fieldEditorPage.requiredFieldCheckbox.check();
    await fieldEditorPage.uniqueFieldCheckbox.check();
    await fieldEditorPage.defaultValueTab.click();
    await expect(fieldEditorPage.firstTextbox).toHaveValue("2024-01-01");
  });

  await test.step("Add second default date value", async () => {
    await fieldEditorPage.plusNewButton.click();
    await fieldEditorPage.textboxByIndex(1).fill("2024-01-02");
    await fieldEditorPage.textboxByIndex(1).press("Enter");
    await fieldEditorPage.okButton.click();
    await contentPage.closeNotification();
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
});
