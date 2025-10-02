import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";
import { closeNotification } from "@reearth-cms/e2e/helpers/notification.helper";

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

test("Boolean metadata creating and updating has succeeded", async ({
  page,
  fieldEditorPage,
  contentPage,
  schemaPage,
}) => {
  await schemaPage.metaDataTab.click();
  await schemaPage.booleanListItem.click();
  await fieldEditorPage.displayNameInput.fill("boolean1");
  await fieldEditorPage.fieldKeyInput.fill("boolean1");
  await fieldEditorPage.fieldDescriptionInput.fill("boolean1 description");
  await fieldEditorPage.okButton.click();
  await closeNotification(page);
  await expect(fieldEditorPage.fieldText("boolean1", "boolean1")).toBeVisible();

  await fieldEditorPage.ellipsisButton.click();
  await expect(fieldEditorPage.displayNameInput).toHaveValue("boolean1");
  await expect(fieldEditorPage.fieldKeyInput).toHaveValue("boolean1");
  await expect(fieldEditorPage.fieldDescriptionInput).toHaveValue("boolean1 description");
  await expect(fieldEditorPage.supportMultipleValuesCheckbox).not.toBeChecked();
  await expect(fieldEditorPage.useAsTitleCheckbox).toBeHidden();

  await fieldEditorPage.validationTab.click();
  await expect(fieldEditorPage.requiredFieldCheckbox).toBeDisabled();
  await expect(fieldEditorPage.uniqueFieldCheckbox).toBeDisabled();

  await fieldEditorPage.defaultValueTab.click();
  await expect(fieldEditorPage.setDefaultValueSwitch).toHaveAttribute("aria-checked", "false");

  await fieldEditorPage.cancelButton.click();
  await schemaPage.contentMenuItem.click();
  await contentPage.newItemButton.click();
  await expect(contentPage.fieldInput("boolean1")).toBeVisible();
  await expect(contentPage.fieldDescriptionText("boolean1 description")).toBeVisible();

  await contentPage.saveButton.click();
  await closeNotification(page);
  await expect(contentPage.itemInformationHeading).toBeVisible();
  await expect(contentPage.fieldInput("boolean1")).toHaveAttribute("aria-checked", "false");

  await contentPage.backButtonRole.click();
  await contentPage.closeSwitch.click();
  await closeNotification(page);
  await expect(contentPage.checkSwitch).toBeVisible();

  await contentPage.cellEditButton.click();
  await expect(contentPage.fieldInput("boolean1")).toHaveAttribute("aria-checked", "true");

  await contentPage.fieldInput("boolean1").click();
  await closeNotification(page);
  await expect(contentPage.fieldInput("boolean1")).toHaveAttribute("aria-checked", "false");

  await contentPage.backButtonRole.click();
  await expect(contentPage.closeSwitch).toBeVisible();
});

test("Boolean metadata editing has succeeded", async ({
  page,
  fieldEditorPage,
  contentPage,
  schemaPage,
}) => {
  await schemaPage.metaDataTab.click();
  await schemaPage.booleanListItem.click();
  await fieldEditorPage.displayNameInput.fill("boolean1");
  await fieldEditorPage.fieldKeyInput.fill("boolean1");
  await fieldEditorPage.fieldDescriptionInput.fill("boolean1 description");
  await fieldEditorPage.defaultValueTab.click();
  await fieldEditorPage.setDefaultValueSwitch.click();
  await fieldEditorPage.okButton.click();
  await closeNotification(page);

  await schemaPage.contentMenuItem.click();
  await expect(contentPage.columnHeaderWithEdit("boolean1")).toBeVisible();

  await contentPage.newItemButton.click();
  await expect(contentPage.fieldInput("boolean1")).toHaveAttribute("aria-checked", "true");

  await contentPage.saveButton.click();
  await closeNotification(page);
  await schemaPage.schemaMenuItem.click();
  await schemaPage.metaDataTab.click();
  await fieldEditorPage.ellipsisButton.click();
  await fieldEditorPage.displayNameInput.fill("new boolean1");
  await fieldEditorPage.fieldKeyInput.fill("new-boolean1");
  await fieldEditorPage.fieldDescriptionInput.fill("new boolean1 description");
  await fieldEditorPage.supportMultipleValuesCheckbox.check();
  await fieldEditorPage.defaultValueTab.click();
  await expect(fieldEditorPage.firstSwitch).toHaveAttribute("aria-checked", "true");

  await fieldEditorPage.plusNewButton.click();
  await expect(fieldEditorPage.switchByIndex(1)).toHaveAttribute("aria-checked", "false");
  await fieldEditorPage.switchByIndex(1).click();
  await fieldEditorPage.okButton.click();
  await closeNotification(page);
  await expect(schemaPage.getByText("new boolean1")).toBeVisible();
  await expect(schemaPage.getByText("#new-boolean1")).toBeVisible();

  await schemaPage.contentMenuItem.click();
  await expect(contentPage.columnHeaderWithEdit("new boolean1")).toBeVisible();
  await expect(contentPage.checkSwitch).toBeVisible();

  await contentPage.newItemButton.click();
  await expect(contentPage.getByText("new boolean1", { exact: true })).toBeVisible();
  await expect(contentPage.fieldDescriptionText("new boolean1 description")).toBeVisible();
  await expect(contentPage.switchByIndex(0)).toHaveAttribute("aria-checked", "true");
  await expect(contentPage.switchByIndex(1)).toHaveAttribute("aria-checked", "true");

  await contentPage.saveButton.click();
  await closeNotification(page);
  await expect(contentPage.switchByIndex(0)).toHaveAttribute("aria-checked", "true");
  await expect(contentPage.switchByIndex(1)).toHaveAttribute("aria-checked", "true");

  await contentPage.backButtonRole.click();
  await contentPage.x2Button.click();
  await expect(contentPage.tooltipSwitchByIndex(0)).toHaveAttribute("aria-checked", "true");
  await expect(contentPage.tooltipSwitchByIndex(1)).toHaveAttribute("aria-checked", "true");

  await contentPage.tooltipSwitchByIndex(0).click();
  await closeNotification(page);
  await contentPage.cellEditButtonByIndex(0).click();
  await expect(contentPage.switchByIndex(0)).toHaveAttribute("aria-checked", "false");
  await expect(contentPage.switchByIndex(1)).toHaveAttribute("aria-checked", "true");
  await fieldEditorPage.plusNewButton.click();
  await closeNotification(page);
  await expect(contentPage.switchByIndex(0)).toHaveAttribute("aria-checked", "false");
  await expect(contentPage.switchByIndex(1)).toHaveAttribute("aria-checked", "true");
  await expect(contentPage.switchByIndex(2)).toHaveAttribute("aria-checked", "false");

  await contentPage.backButtonLabel.click();
  await contentPage.x3Button.click();
  await expect(contentPage.tooltipSwitchByIndex(0)).toHaveAttribute("aria-checked", "false");
  await expect(contentPage.tooltipSwitchByIndex(1)).toHaveAttribute("aria-checked", "true");
  await expect(contentPage.tooltipSwitchByIndex(2)).toHaveAttribute("aria-checked", "false");
});
