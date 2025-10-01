import { closeNotification } from "@reearth-cms/e2e/helpers/notification.helper";
import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";

test.beforeEach(async ({ reearth, projectPage }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await projectPage.createProject(getId());
  await projectPage.createModelFromOverview();
});

test.afterEach(async ({ projectPage }) => {
  await projectPage.deleteProject();
});

test("Option field creating and updating has succeeded", async ({
  page,
  fieldEditorPage,
  contentPage,
  schemaPage,
}) => {
  await fieldEditorPage.fieldTypeButton("Option").click();
  await fieldEditorPage.displayNameInput.click();
  await fieldEditorPage.displayNameInput.fill("option1");
  await fieldEditorPage.settingsKeyInput.click();
  await fieldEditorPage.settingsKeyInput.fill("option1");
  await fieldEditorPage.settingsDescriptionInput.click();
  await fieldEditorPage.settingsDescriptionInput.fill("option1 description");
  await fieldEditorPage.plusNewButton.click();
  await fieldEditorPage.valuesInput.nth(0).click();
  await fieldEditorPage.valuesInput.nth(0).fill("first");
  await fieldEditorPage.plusNewButton.click();
  await expect(contentPage.optionTextByName("Empty values are not allowed")).toBeVisible();
  await expect(fieldEditorPage.okButton).toBeDisabled();
  await fieldEditorPage.valuesInput.nth(1).click();
  await fieldEditorPage.valuesInput.nth(1).fill("first");
  await expect(contentPage.optionTextByName("Option must be unique")).toBeVisible();
  await expect(fieldEditorPage.okButton).toBeDisabled();
  await fieldEditorPage.valuesInput.nth(1).fill("second");
  await fieldEditorPage.okButton.click();
  await closeNotification(page);

  await expect(schemaPage.fieldsContainer.getByRole("paragraph")).toContainText("option1#option1");
  await contentPage.contentText.click();
  await contentPage.newItemButton.click();
  await expect(contentPage.locator("label")).toContainText("option1");
  await expect(contentPage.mainRole).toContainText("option1 description");
  await contentPage.fieldInput("option1").click();
  await expect(fieldEditorPage.optionDiv("first")).toBeVisible();
  await expect(fieldEditorPage.optionDiv("second")).toBeVisible();
  await fieldEditorPage.optionDiv("first").click();
  await expect(contentPage.rootElement.getByText("first").last()).toBeVisible();
  await contentPage.saveButton.click();
  await closeNotification(page);
  await contentPage.backButton.click();
  await expect(contentPage.optionTextByName("first")).toBeVisible();

  await contentPage.editButton.click();
  await contentPage.closeCircleLabel.locator("svg").click();
  await contentPage.fieldInput("option1").click();
  await fieldEditorPage.optionDiv("second").click();
  await expect(contentPage.rootElement.getByText("second").last()).toBeVisible();
  await contentPage.saveButton.click();
  await closeNotification(page);
  await contentPage.backButton.click();
  await expect(contentPage.optionTextByName("second")).toBeVisible();
});

test("Option field editing has succeeded", async ({
  page,
  fieldEditorPage,
  contentPage,
  schemaPage,
}) => {
  await schemaPage.fieldTypeButton("Option").click();
  await fieldEditorPage.displayNameInput.click();
  await fieldEditorPage.displayNameInput.fill("option1");
  await fieldEditorPage.settingsKeyInput.click();
  await fieldEditorPage.settingsKeyInput.fill("option1");
  await fieldEditorPage.settingsDescriptionInput.click();
  await fieldEditorPage.settingsDescriptionInput.fill("option1 description");
  await fieldEditorPage.plusNewButton.click();
  await fieldEditorPage.valuesInput.nth(0).click();
  await fieldEditorPage.valuesInput.nth(0).fill("first");
  await fieldEditorPage.plusNewButton.click();
  await fieldEditorPage.valuesInput.nth(1).click();
  await fieldEditorPage.valuesInput.nth(1).fill("second");
  await fieldEditorPage.plusNewButton.click();
  await fieldEditorPage.valuesInput.nth(2).click();
  await fieldEditorPage.valuesInput.nth(2).fill("third");
  await fieldEditorPage.defaultValueTab.click();
  await fieldEditorPage.setDefaultValueInput.click();
  await expect(fieldEditorPage.optionDiv("first")).toBeVisible();
  await expect(fieldEditorPage.optionDiv("second")).toBeVisible();
  await expect(fieldEditorPage.optionDiv("third")).toBeVisible();
  await fieldEditorPage.optionDiv("second").click();
  await fieldEditorPage.settingsTab.click();
  await fieldEditorPage.deleteButton.nth(1).click();
  await fieldEditorPage.plusNewButton.click();
  await fieldEditorPage.valuesInput.nth(2).click();
  await fieldEditorPage.valuesInput.nth(2).fill("forth");
  await fieldEditorPage.defaultValueTab.click();
  await fieldEditorPage.setDefaultValueInput.click();
  await expect(fieldEditorPage.optionDiv("first")).toBeVisible();
  await expect(fieldEditorPage.optionDiv("second")).toBeHidden();
  await expect(fieldEditorPage.optionDiv("third")).toBeVisible();
  await expect(fieldEditorPage.optionDiv("forth")).toBeVisible();
  await fieldEditorPage.optionDiv("third").click();
  await fieldEditorPage.okButton.click();
  await closeNotification(page);

  await contentPage.contentText.click();
  await expect(contentPage.tableHead).toContainText("option1");
  await contentPage.newItemButton.click();
  await expect(contentPage.optionTextByName("third")).toBeVisible();
  await contentPage.optionTextByName("third").click();
  await expect(fieldEditorPage.optionDiv("first")).toBeVisible();
  await expect(fieldEditorPage.optionDiv("third")).toBeVisible();
  await expect(fieldEditorPage.optionDiv("forth")).toBeVisible();
  await contentPage.saveButton.click();
  await closeNotification(page);
  await contentPage.backButton.click();
  await expect(contentPage.optionTextByName("third")).toBeVisible();

  await schemaPage.schemaText.click();
  await schemaPage.fieldEditButton.click();
  await fieldEditorPage.displayNameInput.click();
  await fieldEditorPage.displayNameInput.press("Home");
  await fieldEditorPage.displayNameInput.fill("new option1");
  await fieldEditorPage.fieldKeyInput.click();
  await fieldEditorPage.fieldKeyInput.press("Home");
  await fieldEditorPage.fieldKeyInput.fill("new-option1");
  await fieldEditorPage.descriptionInput.click();
  await fieldEditorPage.descriptionInput.press("Home");
  await fieldEditorPage.descriptionInput.fill("new option1 description");
  await fieldEditorPage.plusNewButton.click();
  await fieldEditorPage.valuesInput.nth(3).click();
  await fieldEditorPage.valuesInput.nth(3).fill("fifth");
  await fieldEditorPage.supportMultipleValuesCheckbox.check();
  await expect(fieldEditorPage.useAsTitleCheckbox).toBeHidden();
  await fieldEditorPage.validationTab.click();
  await fieldEditorPage.requiredFieldCheckbox.check();
  await fieldEditorPage.uniqueFieldCheckbox.check();
  await fieldEditorPage.defaultValueTab.click();
  await expect(contentPage.optionTextByName("third")).toBeVisible();
  await fieldEditorPage.plusNewButton.click();
  await fieldEditorPage.antSelectSelectionItem.nth(1).click();
  await expect(fieldEditorPage.optionDiv("first")).toBeVisible();
  await expect(fieldEditorPage.optionDiv("third")).toBeVisible();
  await expect(fieldEditorPage.optionDiv("forth")).toBeVisible();
  await expect(fieldEditorPage.optionDiv("fifth")).toBeVisible();
  await fieldEditorPage.settingsTab.click();
  await fieldEditorPage.setOptionsLabel.click();
  await fieldEditorPage.setOptionsLabel.fill("new first");
  await fieldEditorPage.valuesInput.nth(1).click();
  await fieldEditorPage.valuesInput.nth(1).fill("new third");
  await fieldEditorPage.valuesInput.nth(2).click();
  await fieldEditorPage.valuesInput.nth(2).fill("new forth");
  await fieldEditorPage.valuesInput.nth(3).click();
  await fieldEditorPage.valuesInput.nth(3).fill("new fifth");
  await fieldEditorPage.defaultValueTab.click();
  await expect(contentPage.optionTextByName("third")).toBeHidden();

  await fieldEditorPage.plusNewButton.click();
  await fieldEditorPage.antSelectSelectionItem.nth(0).click();
  await expect(fieldEditorPage.optionDiv("new first")).toBeVisible();
  await expect(fieldEditorPage.optionDiv("new third")).toBeVisible();
  await expect(fieldEditorPage.optionDiv("new forth")).toBeVisible();
  await expect(fieldEditorPage.optionDiv("new fifth")).toBeVisible();
  await fieldEditorPage.optionDiv("new first").click();
  await fieldEditorPage.plusNewButton.click();
  await fieldEditorPage.antSelectSelectionItem.nth(1).click();
  await fieldEditorPage.optionDiv("new third").last().click();
  await fieldEditorPage.updateOptionLabel.getByRole("button", { name: "delete" }).last().click();
  await fieldEditorPage.plusNewButton.click();
  await fieldEditorPage.antSelectSelectionItem.nth(1).click();
  await fieldEditorPage.optionDiv("new third").last().click();
  await fieldEditorPage.okButton.click();
  await closeNotification(page);
  await expect(contentPage.optionTextByName("new option1 *#new-option1(unique)")).toBeVisible();
  await contentPage.contentText.click();
  await expect(contentPage.tableHead).toContainText("option1");
  await expect(contentPage.optionTextByName("third")).toBeVisible();
  await contentPage.newItemButton.click();
  await expect(contentPage.optionTextByName("new option1(unique)")).toBeVisible();
  await expect(contentPage.optionTextByName("new first")).toBeVisible();
  await expect(contentPage.optionTextByName("new third")).toBeVisible();
  await contentPage.saveButton.click();
  await closeNotification(page);
  await contentPage.backButton.click();
  await expect(contentPage.cellByComplexName("new first new third")).toBeVisible();
});
