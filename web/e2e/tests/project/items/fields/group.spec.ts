import { SchemaFieldType } from "@reearth-cms/components/molecules/Schema/types";
import { expect, TAG, test } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";

const innerFieldName = "text1";
const innerFieldKey = "text1";
const innerFieldDescription = "text1 description";
const innerFieldHeader = "text1#text1";
const groupFieldName = "group1";
const groupFieldKey = "group1";
const groupFieldDescription = "group1 description";
const groupFieldHeader = "group1#group1";
const newGroupFieldName = "new group1";
const newGroupFieldKey = "new-group1";
const newGroupFieldDescription = "new group1 description";
const newInnerFieldName = "new text1";
const newInnerFieldKey = "new-text1";
const newInnerFieldDescription = "new text1 description";
const testValue2 = "text2";

let modelName: string;

test.beforeEach(async ({ projectPage }) => {
  modelName = `model-${getId()}`;
  await projectPage.goto("/");
  const projectName = getId();
  await projectPage.createProject(projectName);
  await projectPage.gotoProject(projectName);
  await projectPage.createModelFromOverview(modelName);
});

test.afterEach(async ({ projectPage }) => {
  await projectPage.deleteProject();
});

test("Group field creating and updating has succeeded", { tag: TAG.FIELD_VARIANT }, async ({
  fieldEditorPage,
  contentPage,
  schemaPage,
}) => {
  const groupName = `group-${getId()}`;
  const groupKey = `gkey-${getId()}`;

  await test.step("Create group and add text field to group", async () => {
    await expect(schemaPage.textByExact("Reference")).toBeVisible();
    await expect(schemaPage.firstTextByExact("Group")).toBeVisible();

    await schemaPage.createGroup(groupName, groupKey);
    await expect(schemaPage.textByExact("Reference")).toBeHidden();
    await expect(schemaPage.firstTextByExact("Group")).toBeHidden();
    await fieldEditorPage.createField({
      type: SchemaFieldType.Text,
      name: innerFieldName,
      key: innerFieldKey,
      description: innerFieldDescription,
    });
    await expect(schemaPage.groupNameByText(innerFieldHeader)).toBeVisible();
  });

  await test.step("Add group field to model with validations disabled", async () => {
    await schemaPage.modelByText(modelName).click();
    await schemaPage.lastTextByExact("Group").click();
    await fieldEditorPage.displayNameInput.click();
    await fieldEditorPage.displayNameInput.fill(groupFieldName);
    await fieldEditorPage.fieldKeyInput.click();
    await fieldEditorPage.fieldKeyInput.fill(groupFieldKey);
    await fieldEditorPage.descriptionInput.click();
    await fieldEditorPage.descriptionInput.fill(groupFieldDescription);
    await fieldEditorPage.groupSelectTrigger.click();
    await schemaPage.groupNameByText(`${groupName} #${groupKey}`).click();
    await expect(fieldEditorPage.getByLabel("Settings")).toContainText(`${groupName} #${groupKey}`);
    await fieldEditorPage.validationTab.click();
    await expect(fieldEditorPage.requiredFieldCheckbox).toBeDisabled();
    await expect(fieldEditorPage.uniqueFieldCheckbox).toBeDisabled();
    await fieldEditorPage.defaultValueTab.click();
    await expect(fieldEditorPage.setDefaultValueInput).toBeDisabled();
    await fieldEditorPage.okButton.click();
    await contentPage.closeNotification();
    await expect(schemaPage.fieldsContainer.getByRole("paragraph")).toContainText(groupFieldHeader);
  });

  await test.step("Create item with group field value", async () => {
    await contentPage.contentText.click();
    await contentPage.newItemButton.click();
    await expect(contentPage.firstLabel).toContainText(groupFieldName);
    await expect(contentPage.mainRole).toContainText(groupFieldDescription);

    await contentPage.fieldInput(innerFieldName).click();
    await contentPage.fieldInput(innerFieldName).fill(innerFieldName);
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
    await contentPage.backButton.click();
    // TO DO: check if the group field shows correctly
  });

  await test.step("Edit item and update group field value", async () => {
    await contentPage.editButton.click();
    await expect(contentPage.fieldInput(innerFieldName)).toHaveValue(innerFieldName);
    await contentPage.fieldInput(innerFieldName).click();
    await contentPage.fieldInput(innerFieldName).fill(newInnerFieldName);
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
  });

  await test.step("Update group text field with validations and default value", async () => {
    await schemaPage.schemaText.click();
    await schemaPage.metaDataTab.click();
    await schemaPage.menuItemSpanByName(groupName).click();
    await schemaPage.fieldEditButton.click();
    await fieldEditorPage.displayNameInput.click();
    await fieldEditorPage.displayNameInput.fill(newInnerFieldName);
    await fieldEditorPage.fieldKeyInput.click();
    await fieldEditorPage.fieldKeyInput.fill(newInnerFieldKey);
    await fieldEditorPage.descriptionInput.click();
    await fieldEditorPage.descriptionInput.fill(newInnerFieldDescription);
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
    await fieldEditorPage.setDefaultValueInput.fill(innerFieldName);
    await fieldEditorPage.okButton.click();
    await contentPage.closeNotification();
  });

  await test.step("Verify field updates applied and validate max length", async () => {
    await contentPage.contentText.click();
    await schemaPage.modelByText(modelName).click();
    await contentPage.editButton.click();
    await expect(contentPage.mainRole).toContainText("new text1(unique)");
    await expect(contentPage.mainRole).toContainText(newInnerFieldDescription);
    await expect(contentPage.textBoxes).toHaveValue(newInnerFieldName);
    await expect(contentPage.characterCountText).toBeVisible();
    await expect(contentPage.saveButton).toBeDisabled();
    await contentPage.textBoxes.click();
    await contentPage.textBoxes.fill(innerFieldName);
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
    await contentPage.backButton.click();
  });

  await test.step("Verify default value appears in existing and new items", async () => {
    await contentPage.editButton.click();
    await expect(contentPage.textBoxes).toHaveValue(innerFieldName);
    await contentPage.backButton.click();
    await contentPage.newItemButton.click();
    await expect(contentPage.textBoxes).toHaveValue(innerFieldName);
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
      .fill(testValue2);
    await fieldEditorPage.plusNewButton.click();
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
    await contentPage.backButton.click();
    await contentPage.editButton.first().click();
    await expect(contentPage.textBoxByIndex(0)).toHaveValue(innerFieldName);
    await expect(contentPage.textBoxByIndex(1)).toHaveValue(testValue2);
    await fieldEditorPage.arrowDownButton.first().click();
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
    await contentPage.backButton.click();
  });

  await test.step("Verify reordered values persisted", async () => {
    await contentPage.editButton.first().click();
    await expect(contentPage.textBoxByIndex(0)).toHaveValue(testValue2);
    await expect(contentPage.textBoxByIndex(1)).toHaveValue(innerFieldName);
  });
});

test("Group field editing has succeeded", { tag: TAG.FIELD_VARIANT }, async ({ fieldEditorPage, contentPage, schemaPage }) => {
  const groupName = `group-${getId()}`;
  const groupKey = `gkey-${getId()}`;

  await test.step("Create group and add text field to group", async () => {
    await expect(schemaPage.textByExact("Reference")).toBeVisible();
    await expect(schemaPage.firstTextByExact("Group")).toBeVisible();

    await schemaPage.createGroup(groupName, groupKey);
    await expect(schemaPage.textByExact("Reference")).toBeHidden();
    await expect(schemaPage.firstTextByExact("Group")).toBeHidden();
    await fieldEditorPage.createField({
      type: SchemaFieldType.Text,
      name: innerFieldName,
      key: innerFieldKey,
      description: innerFieldDescription,
    });
    await expect(schemaPage.groupNameByText(innerFieldHeader)).toBeVisible();
  });

  await test.step("Add group field to model and create item", async () => {
    await expect(schemaPage.modelByText(modelName)).toBeVisible();
    await schemaPage.modelByText(modelName).click();

    await expect(schemaPage.lastTextByExact("Group")).toBeVisible();
    await schemaPage.lastTextByExact("Group").click();
    await expect(fieldEditorPage.displayNameInput).toBeVisible();
    await fieldEditorPage.displayNameInput.click();
    await fieldEditorPage.displayNameInput.fill(groupFieldName);
    await fieldEditorPage.fieldKeyInput.click();
    await fieldEditorPage.fieldKeyInput.fill(groupFieldKey);
    await fieldEditorPage.descriptionInput.click();
    await fieldEditorPage.descriptionInput.fill(groupFieldDescription);
    await expect(fieldEditorPage.groupSelectTrigger).toBeVisible();
    await fieldEditorPage.groupSelectTrigger.click();

    await expect(schemaPage.groupNameByText(`${groupName} #${groupKey}`)).toBeVisible();
    await schemaPage.groupNameByText(`${groupName} #${groupKey}`).click();
    await expect(fieldEditorPage.getByLabel("Settings")).toContainText(`${groupName} #${groupKey}`);
    await expect(fieldEditorPage.validationTab).toBeVisible();
    await fieldEditorPage.validationTab.click();
    await expect(fieldEditorPage.requiredFieldCheckbox).toBeDisabled();
    await expect(fieldEditorPage.uniqueFieldCheckbox).toBeDisabled();
    await expect(fieldEditorPage.defaultValueTab).toBeVisible();
    await fieldEditorPage.defaultValueTab.click();
    await expect(fieldEditorPage.setDefaultValueInput).toBeDisabled();
    await expect(fieldEditorPage.okButton).toBeVisible();
    await fieldEditorPage.okButton.click();
    await contentPage.closeNotification();
    await expect(schemaPage.fieldsContainer.getByRole("paragraph")).toContainText(groupFieldHeader);
    await expect(contentPage.contentText).toBeVisible();
    await contentPage.contentText.click();

    await expect(contentPage.tableHead).toContainText(groupFieldName);
    await expect(contentPage.newItemButton).toBeVisible();
    await contentPage.newItemButton.click();

    await expect(contentPage.firstLabel).toContainText(groupFieldName);
    await expect(contentPage.mainRole).toContainText(groupFieldDescription);

    await expect(contentPage.fieldInput(innerFieldName)).toBeVisible();
    await contentPage.fieldInput(innerFieldName).click();
    await contentPage.fieldInput(innerFieldName).fill(innerFieldName);
    await expect(contentPage.saveButton).toBeVisible();
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
  });

  await test.step("Enable multiple values for group field", async () => {
    await expect(schemaPage.schemaText).toBeVisible();
    await schemaPage.schemaText.click();

    await expect(schemaPage.fieldEditButton).toBeVisible();
    await schemaPage.fieldEditButton.click();

    await expect(fieldEditorPage.displayNameInput).toBeVisible();
    await fieldEditorPage.displayNameInput.click();
    await fieldEditorPage.displayNameInput.fill(newGroupFieldName);
    await fieldEditorPage.fieldKeyInput.click();
    await fieldEditorPage.fieldKeyInput.fill(newGroupFieldKey);
    await fieldEditorPage.descriptionInput.click();
    await fieldEditorPage.descriptionInput.fill(newGroupFieldDescription);
    await expect(fieldEditorPage.supportMultipleValuesCheckbox).toBeVisible();
    await fieldEditorPage.supportMultipleValuesCheckbox.check();
    await expect(fieldEditorPage.useAsTitleCheckbox).toBeHidden();
    await expect(fieldEditorPage.okButton).toBeVisible();
    await fieldEditorPage.okButton.click();
    await contentPage.closeNotification();
  });

  await test.step("Verify multiple values support and add second group instance", async () => {
    await expect(contentPage.contentText).toBeVisible();
    await contentPage.contentText.click();

    await expect(contentPage.tableHead).toContainText(newGroupFieldName);
    await expect(contentPage.editButton).toBeVisible();
    await contentPage.editButton.click();

    await expect(contentPage.mainRole).toContainText(newGroupFieldName);
    await expect(contentPage.mainRole).toContainText("new group1 (1)");
    await expect(contentPage.mainRole).toContainText(newGroupFieldDescription);
    await expect(contentPage.fieldInput(innerFieldName)).toHaveValue(innerFieldName);
    await expect(fieldEditorPage.plusNewButton).toBeVisible();
    await fieldEditorPage.plusNewButton.click();

    await expect(contentPage.mainRole).toContainText("new group1 (2)");
    await contentPage
      .divFilterByText(/^0text1 description$/)
      .getByLabel(innerFieldName)
      .click();
    await contentPage
      .divFilterByText(/^0text1 description$/)
      .getByLabel(innerFieldName)
      .fill("text1-2");
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
    await contentPage.backButton.click();
  });

  await test.step("Verify multiple group values persisted", async () => {
    await contentPage.editButton.click();
    await expect(
      contentPage.divFilterByText(/^5text1 description$/).getByLabel(innerFieldName),
    ).toHaveValue(innerFieldName);
    await expect(
      contentPage.divFilterByText(/^7text1 description$/).getByLabel(innerFieldName),
    ).toHaveValue("text1-2");
    await contentPage.backButton.click();
  });

  await test.step("Create new item with single group value", async () => {
    await contentPage.newItemButton.click();
    await fieldEditorPage.plusNewButton.click();
    await contentPage.fieldInput(innerFieldName).click();
    await contentPage.fieldInput(innerFieldName).fill(innerFieldName);
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
    await contentPage.backButton.click();
    await contentPage.editButton.first().click();
    await expect(contentPage.fieldInput(innerFieldName)).toHaveValue(innerFieldName);
  });

  await test.step("Add multiple default values to group text field", async () => {
    await schemaPage.schemaText.click();
    await schemaPage.menuItemSpanByName(groupName).click();
    await schemaPage.fieldEditButton.click();
    await fieldEditorPage.supportMultipleValuesCheckbox.check();
    await fieldEditorPage.defaultValueTab.click();
    await fieldEditorPage.plusNewButton.click();
    await fieldEditorPage.defaultValueInput.nth(0).click();
    await fieldEditorPage.defaultValueInput.nth(0).fill(innerFieldName);
    await fieldEditorPage.plusNewButton.click();
    await fieldEditorPage.defaultValueInput.nth(1).click();
    await fieldEditorPage.defaultValueInput.nth(1).fill(testValue2);
    await fieldEditorPage.okButton.click();
    await contentPage.closeNotification();
  });

  await test.step("Create item with multiple group instances and test default values with reordering", async () => {
    await contentPage.contentText.click();
    await schemaPage.modelByText(modelName).click();
    await contentPage.newItemButton.click();
    await fieldEditorPage.plusNewButton.click();
    await expect(contentPage.textBoxByIndex(0)).toHaveValue(innerFieldName);
    await expect(contentPage.textBoxByIndex(1)).toHaveValue(testValue2);
    await fieldEditorPage.plusNewButton.nth(1).click();
    await expect(contentPage.textBoxByIndex(2)).toHaveValue(innerFieldName);
    await expect(contentPage.textBoxByIndex(3)).toHaveValue(testValue2);
    await fieldEditorPage.arrowDownButton.nth(2).click();
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
    await contentPage.backButton.click();
  });

  await test.step("Verify reordered group instance values persisted", async () => {
    await contentPage.editButton.first().click();
    await expect(contentPage.textBoxByIndex(0)).toHaveValue(innerFieldName);
    await expect(contentPage.textBoxByIndex(1)).toHaveValue(testValue2);
    await expect(contentPage.textBoxByIndex(2)).toHaveValue(testValue2);
    await expect(contentPage.textBoxByIndex(3)).toHaveValue(innerFieldName);
  });
});
