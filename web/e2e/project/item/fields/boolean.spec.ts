import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { createModelFromOverview } from "@reearth-cms/e2e/project/utils/model";
import { createProject, deleteProject } from "@reearth-cms/e2e/project/utils/project";

test.beforeEach(async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
  await createModelFromOverview(page);
});

test.afterEach(async ({ page }) => {
  await deleteProject(page);
});

test("Boolean field creating and updating has succeeded", async ({
  page,
  fieldEditorPage,
  contentPage,
}) => {
  await fieldEditorPage.fieldTypeButton("Boolean").click();
  await fieldEditorPage.displayNameInput.click();
  await fieldEditorPage.displayNameInput.fill("boolean1");
  await fieldEditorPage.settingsKeyInput.click();
  await fieldEditorPage.settingsKeyInput.fill("boolean1");
  await fieldEditorPage.settingsDescriptionInput.click();
  await fieldEditorPage.settingsDescriptionInput.fill("boolean1 description");
  await fieldEditorPage.okButton.click();
  await closeNotification(page);

  await expect(fieldEditorPage.fieldsContainerParagraph).toContainText("boolean1#boolean1");
  await contentPage.contentText.click();
  await contentPage.newItemButton.click();
  await expect(contentPage.labelElement()).toContainText("boolean1");
  await expect(contentPage.mainElement).toContainText("boolean1 description");

  await contentPage.fieldInput("boolean1").click();
  await contentPage.saveButton.click();
  await closeNotification(page);
  await contentPage.backButton.click();
  await expect(contentPage.allSwitches).toHaveAttribute("aria-checked", "true");
  await contentPage.editButton.click();
  await expect(contentPage.allSwitches).toHaveAttribute("aria-checked", "true");
  await contentPage.fieldInput("boolean1").click();
  await contentPage.saveButton.click();
  await closeNotification(page);
  await contentPage.backButton.click();
  await expect(contentPage.allSwitches).toHaveAttribute("aria-checked", "false");
});

test("Boolean field editing has succeeded", async ({
  page,
  fieldEditorPage,
  contentPage,
  schemaPage,
}) => {
  await fieldEditorPage.fieldTypeListItem("Boolean").click();
  await fieldEditorPage.displayNameInput.click();
  await fieldEditorPage.displayNameInput.fill("boolean1");
  await fieldEditorPage.settingsKeyInput.click();
  await fieldEditorPage.settingsKeyInput.fill("boolean1");
  await fieldEditorPage.settingsDescriptionInput.click();
  await fieldEditorPage.settingsDescriptionInput.fill("boolean1 description");
  await fieldEditorPage.defaultValueTab.click();
  await fieldEditorPage.setDefaultValueSwitch.click();
  await fieldEditorPage.okButton.click();
  await closeNotification(page);
  await contentPage.contentText.click();
  await expect(contentPage.tableHead).toContainText("boolean1");
  await contentPage.newItemButton.click();
  await expect(contentPage.allSwitches).toHaveAttribute("aria-checked", "true");
  await contentPage.saveButton.click();
  await closeNotification(page);
  await contentPage.backButton.click();
  await expect(contentPage.allSwitches).toHaveAttribute("aria-checked", "true");
  await schemaPage.schemaText.click();
  await fieldEditorPage.ellipsisMenuButton.click();
  await fieldEditorPage.displayNameInput.click();
  await fieldEditorPage.displayNameInput.fill("new boolean1");
  await fieldEditorPage.fieldKeyInput.click();
  await fieldEditorPage.fieldKeyInput.fill("new-boolean1");
  await fieldEditorPage.descriptionOptionalInput.click();
  await fieldEditorPage.descriptionOptionalInput.fill("new boolean1 description");
  await fieldEditorPage.supportMultipleValuesCheckbox.check();
  await expect(fieldEditorPage.useAsTitleCheckbox).toBeHidden();
  await fieldEditorPage.validationTab.click();
  await expect(fieldEditorPage.makeFieldRequiredLabel.locator("span").nth(1)).toBeDisabled();
  await expect(fieldEditorPage.setFieldAsUniqueLabel.locator("span").nth(1)).toBeDisabled();
  await fieldEditorPage.defaultValueTab.click();
  await expect(fieldEditorPage.switchByIndex(0)).toHaveAttribute("aria-checked", "true");
  await fieldEditorPage.plusNewButton.click();
  await expect(fieldEditorPage.switchByIndex(1)).toHaveAttribute("aria-checked", "false");
  await fieldEditorPage.firstArrowDownButton.click();
  await expect(fieldEditorPage.switchByIndex(0)).toHaveAttribute("aria-checked", "false");
  await expect(fieldEditorPage.switchByIndex(1)).toHaveAttribute("aria-checked", "true");
  await fieldEditorPage.okButton.click();
  await closeNotification(page);
  await expect(schemaPage.fieldText("new boolean1", "new-boolean1")).toBeVisible();
  await contentPage.contentText.click();
  await expect(contentPage.tableHead).toContainText("new boolean1");
  await expect(contentPage.checkSwitch).toBeVisible();
  await contentPage.newItemButton.click();
  await expect(contentPage.switchByIndex(0)).toHaveAttribute("aria-checked", "false");
  await expect(contentPage.switchByIndex(1)).toHaveAttribute("aria-checked", "true");
  await fieldEditorPage.plusNewButton.click();
  await expect(contentPage.switchByIndex(2)).toHaveAttribute("aria-checked", "false");
  await fieldEditorPage.arrowUpButtonByIndex(2).click();
  await contentPage.saveButton.click();
  await closeNotification(page);
  await contentPage.backButton.click();
  await contentPage.x3Button.click();
  await expect(contentPage.tooltip).toContainText("new boolean1");
  await expect(contentPage.switchByIndex(1)).toHaveAttribute("aria-checked", "false");
  await expect(contentPage.switchByIndex(2)).toHaveAttribute("aria-checked", "false");
  await expect(contentPage.switchByIndex(3)).toHaveAttribute("aria-checked", "true");
});
