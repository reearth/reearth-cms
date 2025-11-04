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

test("Date field creating and updating has succeeded", async ({
  fieldEditorPage,
  contentPage,
}) => {
  await fieldEditorPage.fieldTypeButton("Date").click();
  await fieldEditorPage.displayNameInput.click();
  await fieldEditorPage.displayNameInput.fill("date1");
  await fieldEditorPage.settingsKeyInput.click();
  await fieldEditorPage.settingsKeyInput.fill("date1");
  await fieldEditorPage.settingsDescriptionInput.click();
  await fieldEditorPage.settingsDescriptionInput.fill("date1 description");
  await fieldEditorPage.okButton.click();
  await contentPage.closeNotification();

  await expect(fieldEditorPage.fieldsContainerParagraph).toContainText("date1#date1");
  await contentPage.contentText.click();
  await contentPage.newItemButton.click();
  await expect(contentPage.labelElement()).toContainText("date1");
  await expect(contentPage.mainElement).toContainText("date1 description");

  await contentPage.selectDatePlaceholder.click();
  await contentPage.selectDatePlaceholder.fill("2024-01-01");
  await contentPage.selectDatePlaceholder.press("Enter");
  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  await contentPage.backButton.click();
  await expect(contentPage.tableBody).toContainText("2024-01-01");
  await contentPage.editButton.click();
  await contentPage.closeDateButton.click();
  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  await contentPage.backButton.click();
  await expect(contentPage.tableBody).not.toContainText("2024-01-01");
});

test("Date field editing has succeeded", async ({
  fieldEditorPage,
  contentPage,
  schemaPage,
}) => {
  await fieldEditorPage.fieldTypeListItem("Date").click();
  await fieldEditorPage.displayNameInput.click();
  await fieldEditorPage.displayNameInput.fill("date1");
  await fieldEditorPage.settingsKeyInput.click();
  await fieldEditorPage.settingsKeyInput.fill("date1");
  await fieldEditorPage.settingsDescriptionInput.click();
  await fieldEditorPage.settingsDescriptionInput.fill("date1 description");
  await fieldEditorPage.defaultValueTab.click();
  await fieldEditorPage.selectDatePlaceholder.click();
  await fieldEditorPage.selectDatePlaceholder.fill("2024-01-01");
  await fieldEditorPage.selectDatePlaceholder.press("Enter");
  await fieldEditorPage.okButton.click();
  await contentPage.closeNotification();
  await contentPage.contentText.click();
  await expect(contentPage.tableHead).toContainText("date1");
  await contentPage.newItemButton.click();
  await expect(contentPage.selectDatePlaceholder).toHaveValue("2024-01-01");
  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  await contentPage.backButton.click();
  await expect(contentPage.tableBody).toContainText("2024-01-01");
  await schemaPage.schemaText.click();
  await fieldEditorPage.ellipsisMenuButton.click();
  await fieldEditorPage.displayNameInput.click();
  await fieldEditorPage.displayNameInput.fill("new date1");
  await fieldEditorPage.fieldKeyInput.click();
  await fieldEditorPage.fieldKeyInput.fill("new-date1");
  await fieldEditorPage.descriptionOptionalInput.click();
  await fieldEditorPage.descriptionOptionalInput.fill("new date1 description");
  await fieldEditorPage.supportMultipleValuesCheckbox.check();
  await expect(fieldEditorPage.useAsTitleCheckbox).toBeHidden();
  await fieldEditorPage.validationTab.click();
  await fieldEditorPage.requiredFieldCheckbox.check();
  await fieldEditorPage.uniqueFieldCheckbox.check();
  await fieldEditorPage.defaultValueTab.click();
  await expect(fieldEditorPage.selectDatePlaceholder).toHaveValue("2024-01-01");
  await fieldEditorPage.textboxByIndex(0).click();
  await fieldEditorPage.titleDiv("2024-01-02").click();
  await fieldEditorPage.plusNewButton.click();
  await fieldEditorPage.textboxByIndex(1).click();
  await fieldEditorPage.textboxByIndex(1).fill("2024-01-03");
  await fieldEditorPage.textboxByIndex(1).press("Enter");
  await fieldEditorPage.firstArrowDownButton.click();
  await expect(fieldEditorPage.selectDatePlaceholder.nth(0)).toHaveValue("2024-01-03");
  await fieldEditorPage.okButton.click();
  await contentPage.closeNotification();
  await expect(schemaPage.uniqueFieldText("new date1", "new-date1")).toBeVisible();
  await contentPage.contentText.click();
  await expect(contentPage.tableHead).toContainText("new date1");
  await expect(contentPage.tableBody).toContainText("2024-01-01");
  await contentPage.newItemButton.click();
  await expect(contentPage.labelElement()).toContainText("new date1(unique)");
  await expect(contentPage.textBoxByIndex(0)).toHaveValue("2024-01-03");
  await expect(contentPage.textBoxByIndex(1)).toHaveValue("2024-01-02");
  await fieldEditorPage.plusNewButton.click();
  await contentPage.textBoxByIndex(2).click();
  await contentPage.textBoxByIndex(2).fill("2024-01-04");
  await contentPage.textBoxByIndex(2).press("Enter");
  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  await contentPage.backButton.click();
  await contentPage.x3Button.click();
  await expect(contentPage.tooltipParagraphByIndex(0)).toContainText("2024-01-03");
  await expect(contentPage.tooltipParagraphByIndex(1)).toContainText("2024-01-02");
  await expect(contentPage.tooltipParagraphByIndex(2)).toContainText("2024-01-04");
});
