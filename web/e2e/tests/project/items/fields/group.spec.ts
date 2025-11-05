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

test("Group field creating and updating has succeeded", async ({
  fieldEditorPage,
  contentPage,
  schemaPage,
}) => {
  test.slow();
  const groupName = "e2e group name";
  const groupKey = "e2e-group-key";

  await test.step("Create group and add text field to group", async () => {
    await expect(schemaPage.textByExact("Reference")).toBeVisible();
    await expect(schemaPage.firstTextByExact("Group")).toBeVisible();

    await schemaPage.createGroup(groupName, groupKey);
    await expect(schemaPage.textByExact("Reference")).toBeHidden();
    await expect(schemaPage.firstTextByExact("Group")).toBeHidden();
    await fieldEditorPage.fieldTypeButton("Text").click();
    await fieldEditorPage.displayNameInput.click();
    await fieldEditorPage.displayNameInput.fill("text1");
    await fieldEditorPage.settingsKeyInput.click();
    await fieldEditorPage.settingsKeyInput.fill("text1");
    await fieldEditorPage.settingsDescriptionInput.click();
    await fieldEditorPage.settingsDescriptionInput.fill("text1 description");
    await fieldEditorPage.okButton.click();
    await contentPage.closeNotification();
    await expect(schemaPage.groupNameByText("text1#text1")).toBeVisible();
  });

  await test.step("Add group field to model with validations disabled", async () => {
    await schemaPage.modelByText("e2e model name").click();
    await schemaPage.lastTextByExact("Group").click();
    await fieldEditorPage.displayNameInput.click();
    await fieldEditorPage.displayNameInput.fill("group1");
    await fieldEditorPage.settingsKeyInput.click();
    await fieldEditorPage.settingsKeyInput.fill("group1");
    await fieldEditorPage.settingsDescriptionInput.click();
    await fieldEditorPage.settingsDescriptionInput.fill("group1 description");
    await fieldEditorPage.antSelectSelector.click();
    await schemaPage.groupNameByText(`${groupName} #${groupKey}`).click();
    await expect(fieldEditorPage.getByLabel("Settings")).toContainText(`${groupName} #${groupKey}`);
    await fieldEditorPage.validationTab.click();
    await expect(fieldEditorPage.makeFieldRequiredLabel.locator("span").nth(1)).toBeDisabled();
    await expect(fieldEditorPage.setFieldAsUniqueLabel.locator("span").nth(1)).toBeDisabled();
    await fieldEditorPage.defaultValueTab.click();
    await expect(fieldEditorPage.setDefaultValueInput).toBeDisabled();
    await fieldEditorPage.okButton.click();
    await contentPage.closeNotification();
    await expect(schemaPage.fieldsContainer.getByRole("paragraph")).toContainText("group1#group1");
  });

  await test.step("Create item with group field value", async () => {
    await contentPage.contentText.click();
    await contentPage.newItemButton.click();
    await expect(contentPage.firstLabel).toContainText("group1");
    await expect(contentPage.mainRole).toContainText("group1 description");

    await contentPage.fieldInput("text1").click();
    await contentPage.fieldInput("text1").fill("text1");
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
    await contentPage.backButton.click();
    // TO DO: check if the group field shows correctly
  });

  await test.step("Edit item and update group field value", async () => {
    await contentPage.editButton.click();
    await expect(contentPage.fieldInput("text1")).toHaveValue("text1");
    await contentPage.fieldInput("text1").click();
    await contentPage.fieldInput("text1").fill("new text1");
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
  });

  await test.step("Update group text field with validations and default value", async () => {
    await schemaPage.schemaSpanText.click();
    await schemaPage.metaDataTab.click();
    await schemaPage.groupMenuItem("e2e group name").locator("span").click();
    await schemaPage.fieldEditButton.click();
    await fieldEditorPage.displayNameInput.click();
    await fieldEditorPage.displayNameInput.fill("new text1");
    await fieldEditorPage.fieldKeyInput.click();
    await fieldEditorPage.fieldKeyInput.fill("new-text1");
    await fieldEditorPage.descriptionInput.click();
    await fieldEditorPage.descriptionInput.fill("new text1 description");
    await fieldEditorPage.supportMultipleValuesCheckbox.check();
    await fieldEditorPage.useAsTitleCheckbox.check();
    await fieldEditorPage.validationTab.click();
    await fieldEditorPage.maxLengthInput.click();
    await fieldEditorPage.maxLengthInput.fill("5");
    await fieldEditorPage.requiredFieldCheckbox.check();
    await fieldEditorPage.uniqueFieldCheckbox.check();
    await fieldEditorPage.defaultValueTab.click();
    await fieldEditorPage.plusNewButton.click();
    await fieldEditorPage.setDefaultValueInput.click();
    await fieldEditorPage.setDefaultValueInput.fill("text12");
    await expect(fieldEditorPage.okButton).toBeDisabled();
    await fieldEditorPage.setDefaultValueInput.click();
    await fieldEditorPage.setDefaultValueInput.fill("text1");
    await fieldEditorPage.okButton.click();
    await contentPage.closeNotification();
  });

  await test.step("Verify field updates applied and validate max length", async () => {
    await contentPage.contentText.click();
    await schemaPage.modelByText("e2e model name").click();
    await contentPage.editButton.click();
    await expect(contentPage.mainRole).toContainText("new text1(unique)");
    await expect(contentPage.mainRole).toContainText("new text1 description");
    await expect(contentPage.textBoxes).toHaveValue("new text1");
    await expect(contentPage.characterCountText).toBeVisible();
    await expect(contentPage.saveButton).toBeDisabled();
    await contentPage.textBoxes.click();
    await contentPage.textBoxes.fill("text1");
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
    await contentPage.backButton.click();
  });

  await test.step("Verify default value appears in existing and new items", async () => {
    await contentPage.editButton.click();
    await expect(contentPage.textBoxes).toHaveValue("text1");
    await contentPage.backButton.click();
    await contentPage.newItemButton.click();
    await expect(contentPage.textBoxes).toHaveValue("text1");
  });

  await test.step("Add multiple values to group field and test reordering", async () => {
    await fieldEditorPage.plusNewButton.click();
    await contentPage
      .divFilterByText(/^0 \/ 5$/)
      .getByRole("textbox")
      .click();
    await contentPage
      .divFilterByText(/^0 \/ 5$/)
      .getByRole("textbox")
      .fill("text2");
    await fieldEditorPage.plusNewButton.click();
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
    await contentPage.backButton.click();
    await contentPage.editButton.first().click();
    await expect(contentPage.textBoxByIndex(0)).toHaveValue("text1");
    await expect(contentPage.textBoxByIndex(1)).toHaveValue("text2");
    await fieldEditorPage.arrowDownButton.first().click();
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
    await contentPage.backButton.click();
  });

  await test.step("Verify reordered values persisted", async () => {
    await contentPage.editButton.first().click();
    await expect(contentPage.textBoxByIndex(0)).toHaveValue("text2");
    await expect(contentPage.textBoxByIndex(1)).toHaveValue("text1");
  });
});

test("Group field editing has succeeded", async ({ fieldEditorPage, contentPage, schemaPage }) => {
  test.slow();
  const groupName = "e2e group name";
  const groupKey = "e2e-group-key";

  await test.step("Create group and add text field to group", async () => {
    await expect(schemaPage.textByExact("Reference")).toBeVisible();
    await expect(schemaPage.firstTextByExact("Group")).toBeVisible();

    await schemaPage.createGroup(groupName, groupKey);
    await expect(schemaPage.textByExact("Reference")).toBeHidden();
    await expect(schemaPage.firstTextByExact("Group")).toBeHidden();
    await schemaPage.fieldTypeButton("Text").click();
    await fieldEditorPage.displayNameInput.click();
    await fieldEditorPage.displayNameInput.fill("text1");
    await fieldEditorPage.settingsKeyInput.click();
    await fieldEditorPage.settingsKeyInput.fill("text1");
    await fieldEditorPage.settingsDescriptionInput.click();
    await fieldEditorPage.settingsDescriptionInput.fill("text1 description");
    await fieldEditorPage.okButton.click();
    await contentPage.closeNotification();
    await expect(schemaPage.groupNameByText("text1#text1")).toBeVisible();
  });

  await test.step("Add group field to model and create item", async () => {
    await schemaPage.modelByText("e2e model name").click();
    await schemaPage.lastTextByExact("Group").click();
    await fieldEditorPage.displayNameInput.click();
    await fieldEditorPage.displayNameInput.fill("group1");
    await fieldEditorPage.settingsKeyInput.click();
    await fieldEditorPage.settingsKeyInput.fill("group1");
    await fieldEditorPage.settingsDescriptionInput.click();
    await fieldEditorPage.settingsDescriptionInput.fill("group1 description");
    await fieldEditorPage.antSelectSelector.click();
    await schemaPage.groupNameByText(`${groupName} #${groupKey}`).click();
    await expect(fieldEditorPage.getByLabel("Settings")).toContainText(`${groupName} #${groupKey}`);
    await fieldEditorPage.validationTab.click();
    await expect(fieldEditorPage.makeFieldRequiredLabel.locator("span").nth(1)).toBeDisabled();
    await expect(fieldEditorPage.setFieldAsUniqueLabel.locator("span").nth(1)).toBeDisabled();
    await fieldEditorPage.defaultValueTab.click();
    await expect(fieldEditorPage.setDefaultValueInput).toBeDisabled();
    await fieldEditorPage.okButton.click();
    await contentPage.closeNotification();
    await expect(schemaPage.fieldsContainer.getByRole("paragraph")).toContainText("group1#group1");
    await contentPage.contentText.click();
    await expect(contentPage.tableHead).toContainText("group1");
    await contentPage.newItemButton.click();
    await expect(contentPage.firstLabel).toContainText("group1");
    await expect(contentPage.mainRole).toContainText("group1 description");

    await contentPage.fieldInput("text1").click();
    await contentPage.fieldInput("text1").fill("text1");
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
  });

  await test.step("Enable multiple values for group field", async () => {
    await schemaPage.schemaText.click();
    await schemaPage.fieldEditButton.click();
    await fieldEditorPage.displayNameInput.click();
    await fieldEditorPage.displayNameInput.fill("new group1");
    await fieldEditorPage.fieldKeyInput.click();
    await fieldEditorPage.fieldKeyInput.fill("new-group1");
    await fieldEditorPage.descriptionInput.click();
    await fieldEditorPage.descriptionInput.fill("new group1 description");
    await fieldEditorPage.supportMultipleValuesCheckbox.check();
    await expect(fieldEditorPage.useAsTitleCheckbox).toBeHidden();
    await fieldEditorPage.okButton.click();
    await contentPage.closeNotification();
  });

  await test.step("Verify multiple values support and add second group instance", async () => {
    await contentPage.contentText.click();
    await expect(contentPage.tableHead).toContainText("new group1");
    await contentPage.editButton.click();
    await expect(contentPage.mainRole).toContainText("new group1");
    await expect(contentPage.mainRole).toContainText("new group1 (1)");
    await expect(contentPage.mainRole).toContainText("new group1 description");
    await expect(contentPage.fieldInput("text1")).toHaveValue("text1");
    await fieldEditorPage.plusNewButton.click();
    await expect(contentPage.mainRole).toContainText("new group1 (2)");
    await contentPage
      .divFilterByText(/^0text1 description$/)
      .getByLabel("text1")
      .click();
    await contentPage
      .divFilterByText(/^0text1 description$/)
      .getByLabel("text1")
      .fill("text1-2");
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
    await contentPage.backButton.click();
  });

  await test.step("Verify multiple group values persisted", async () => {
    await contentPage.editButton.click();
    await expect(contentPage.divFilterByText(/^5text1 description$/).getByLabel("text1")).toHaveValue(
      "text1",
    );
    await expect(contentPage.divFilterByText(/^7text1 description$/).getByLabel("text1")).toHaveValue(
      "text1-2",
    );
    await contentPage.backButton.click();
  });

  await test.step("Create new item with single group value", async () => {
    await contentPage.newItemButton.click();
    await fieldEditorPage.plusNewButton.click();
    await contentPage.fieldInput("text1").click();
    await contentPage.fieldInput("text1").fill("text1");
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
    await contentPage.backButton.click();
    await contentPage.editButton.first().click();
    await expect(contentPage.fieldInput("text1")).toHaveValue("text1");
  });

  await test.step("Add multiple default values to group text field", async () => {
    await schemaPage.schemaSpanText.click();
    await schemaPage.groupMenuItem("e2e group name").locator("span").click();
    await schemaPage.fieldEditButton.click();
    await fieldEditorPage.supportMultipleValuesCheckbox.check();
    await fieldEditorPage.defaultValueTab.click();
    await fieldEditorPage.plusNewButton.click();
    await fieldEditorPage.defaultValueInput.nth(0).click();
    await fieldEditorPage.defaultValueInput.nth(0).fill("text1");
    await fieldEditorPage.plusNewButton.click();
    await fieldEditorPage.defaultValueInput.nth(1).click();
    await fieldEditorPage.defaultValueInput.nth(1).fill("text2");
    await fieldEditorPage.okButton.click();
    await contentPage.closeNotification();
  });

  await test.step("Create item with multiple group instances and test default values with reordering", async () => {
    await contentPage.contentText.click();
    await schemaPage.modelByText("e2e model name").click();
    await contentPage.newItemButton.click();
    await fieldEditorPage.plusNewButton.click();
    await expect(contentPage.textBoxByIndex(0)).toHaveValue("text1");
    await expect(contentPage.textBoxByIndex(1)).toHaveValue("text2");
    await fieldEditorPage.plusNewButton.nth(1).click();
    await expect(contentPage.textBoxByIndex(2)).toHaveValue("text1");
    await expect(contentPage.textBoxByIndex(3)).toHaveValue("text2");
    await fieldEditorPage.arrowDownButton.nth(3).click();
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
    await contentPage.backButton.click();
  });

  await test.step("Verify reordered group instance values persisted", async () => {
    await contentPage.editButton.first().click();
    await expect(contentPage.textBoxByIndex(0)).toHaveValue("text1");
    await expect(contentPage.textBoxByIndex(1)).toHaveValue("text2");
    await expect(contentPage.textBoxByIndex(2)).toHaveValue("text2");
    await expect(contentPage.textBoxByIndex(3)).toHaveValue("text1");
  });
});
