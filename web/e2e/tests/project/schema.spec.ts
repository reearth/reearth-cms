import { type Page, expect, test } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";
import { closeNotification } from "@reearth-cms/e2e/helpers/notification.helper";
import { FieldEditorPage } from "@reearth-cms/e2e/pages/field-editor.page";
import { SchemaPage } from "@reearth-cms/e2e/pages/schema.page";

async function deleteField(
  page: Page,
  name: string,
  key = name,
  fieldEditorPage: FieldEditorPage,
  schemaPage: SchemaPage,
) {
  await fieldEditorPage.deleteFieldButton.click();
  await fieldEditorPage.okButton.click();
  await closeNotification(page);
  await expect(schemaPage.fieldText(name, key)).toBeHidden();
}

test.beforeEach(async ({ reearth, projectPage }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  const projectName = getId();
  await projectPage.createProject(projectName);
  await projectPage.gotoProject(projectName);
  await projectPage.schemaMenuItem.click();
});

test.afterEach(async ({ projectPage }) => {
  await projectPage.deleteProject();
});

test("Model CRUD has succeeded", async ({ schemaPage, fieldEditorPage }) => {
  const modelName = "model name";
  const modelKey = "model-key";
  await schemaPage.createModelFromSidebar(modelName, modelKey);
  await expect(fieldEditorPage.titleByText(modelName, true)).toBeVisible();
  await expect(schemaPage.textByExact(`#${modelKey}`)).toBeVisible();
  await expect(schemaPage.modelMenuItem(modelName).locator("span")).toBeVisible();

  const newModelName = "new model name";
  const newModelKey = "new-model-key";
  await schemaPage.updateModel(newModelName, newModelKey);
  await expect(fieldEditorPage.titleByText(newModelName)).toBeVisible();
  await expect(schemaPage.textByExact(`#${newModelKey}`)).toBeVisible();
  await expect(schemaPage.modelMenuItem(newModelName).locator("span")).toBeVisible();

  await schemaPage.deleteModel();
  await expect(fieldEditorPage.titleByText(newModelName)).toBeHidden();
});

test("Model reordering has succeeded", async ({ page, schemaPage }) => {
  const modelName1 = "model1";
  const modelName2 = "model2";
  const modelName3 = "model3";

  await schemaPage.createModelFromSidebar(modelName1);
  await schemaPage.createModelFromSidebar(modelName2);
  await expect(schemaPage.modelMenuItems().nth(0)).toContainText(modelName1);
  await expect(schemaPage.modelMenuItems().nth(1)).toContainText(modelName2);

  await schemaPage.modelMenuItem(modelName2).dragTo(schemaPage.modelMenuItem(modelName1));
  await closeNotification(page);
  await expect(schemaPage.modelMenuItems().nth(0)).toContainText(modelName2);
  await expect(schemaPage.modelMenuItems().nth(1)).toContainText(modelName1);

  await schemaPage.createModelFromSidebar(modelName3);
  await expect(schemaPage.modelMenuItems().nth(0)).toContainText(modelName2);
  await expect(schemaPage.modelMenuItems().nth(1)).toContainText(modelName1);
  await expect(schemaPage.modelMenuItems().nth(2)).toContainText(modelName3);
});

test("Group CRUD has succeeded", async ({ schemaPage, fieldEditorPage }) => {
  const groupName = "e2e group name";
  const groupKey = "e2e-group-key";
  const updateGroupName = "new e2e group name";
  const updateGroupKey = "new-e2e-group-key";

  await schemaPage.createGroup(groupName, groupKey);
  await expect(fieldEditorPage.titleByText(groupName, true)).toBeVisible();
  await expect(schemaPage.textByExact(`#${groupKey}`)).toBeVisible();

  await schemaPage.updateGroup(updateGroupName, updateGroupKey);
  await expect(fieldEditorPage.titleByText(updateGroupName)).toBeVisible();
  await expect(schemaPage.textByExact(`#${updateGroupKey}`)).toBeVisible();
  await expect(schemaPage.menuItemByName(updateGroupName)).toBeVisible();

  await schemaPage.deleteGroup();
  await expect(fieldEditorPage.titleByText(updateGroupName)).toBeHidden();
});

test("Group creating from adding field has succeeded", async ({
  page,
  schemaPage,
  fieldEditorPage,
}) => {
  await schemaPage.createModelFromSidebar();
  await fieldEditorPage.fieldTypeListItem("Group").click();
  await schemaPage.addGroupButton.click();
  await expect(schemaPage.newGroupDialog).toContainText("New Group");
  await expect(fieldEditorPage.okButton).toBeDisabled();

  await schemaPage.groupNameInput.click();
  await schemaPage.groupNameInput.fill("e2e group name");
  await schemaPage.groupKeyInput.click();
  await schemaPage.groupKeyInput.fill("e2e-group-key");
  await fieldEditorPage.okButton.click();
  await closeNotification(page);
  await expect(schemaPage.menuItemByName("e2e group name").locator("span")).toBeVisible();
  await expect(schemaPage.groupNameByText("e2e group name#e2e-group-key")).toBeVisible();
  await expect(schemaPage.fieldsMetaDataText).toBeHidden();
  await expect(schemaPage.textByExact("Reference")).toBeHidden();
  await expect(schemaPage.textByExact("Group")).toBeHidden();
  await fieldEditorPage.fieldTypeListItem("Text").click();
  await schemaPage.handleFieldForm("text");
  await schemaPage.modelByText("e2e model name").click();
  await schemaPage.lastTextByExact("Group").click();
  await expect(schemaPage.createGroupFieldButton).toBeVisible();
  await schemaPage.groupSelectTrigger.click();
  await expect(schemaPage.groupNameByText("e2e group name #e2e-group-key")).toBeVisible();
  await fieldEditorPage.cancelButton.click();
});

test("Group reordering has succeeded", async ({ page, schemaPage }) => {
  await schemaPage.createGroup("group1", "group1");
  await schemaPage.createGroup("group2", "group2");
  await expect(schemaPage.groupMenuItems.nth(0)).toContainText("group1");
  await expect(schemaPage.groupMenuItems.nth(1)).toContainText("group2");
  await schemaPage.groupMenuItems.nth(1).dragTo(schemaPage.groupMenuItems.nth(0));
  await closeNotification(page);
  await expect(schemaPage.groupMenuItems.nth(0)).toContainText("group2");
  await expect(schemaPage.groupMenuItems.nth(1)).toContainText("group1");
  await schemaPage.createGroup("group3", "group3");
  await expect(schemaPage.groupMenuItems.nth(0)).toContainText("group2");
  await expect(schemaPage.groupMenuItems.nth(1)).toContainText("group1");
  await expect(schemaPage.groupMenuItems.nth(2)).toContainText("group3");
});

// eslint-disable-next-line playwright/expect-expect
test("Text field CRUD has succeeded", async ({ page, fieldEditorPage, schemaPage }) => {
  await schemaPage.createModelFromSidebar();
  await fieldEditorPage.fieldTypeListItem("Text").click();
  await schemaPage.handleFieldForm("text");
  await fieldEditorPage.ellipsisMenuButton.click();
  await schemaPage.handleFieldForm("new text", "new-text");
  await deleteField(page, "new text", "new-text", fieldEditorPage, schemaPage);
});

test("Schema reordering has succeeded", async ({ page, schemaPage, fieldEditorPage }) => {
  await schemaPage.createModelFromSidebar();
  await fieldEditorPage.fieldTypeListItem(/Text/).click();
  await schemaPage.handleFieldForm("text1");
  await fieldEditorPage.fieldTypeListItem(/Text/).click();
  await schemaPage.handleFieldForm("text2");
  await expect(schemaPage.draggableItems.nth(0)).toContainText("text1#text1");
  await expect(schemaPage.draggableItems.nth(1)).toContainText("text2#text2");
  await schemaPage.grabbableItems.nth(1).dragTo(schemaPage.draggableItems.nth(0));
  await closeNotification(page);
  await expect(schemaPage.draggableItems.nth(0)).toContainText("text2#text2");
  await expect(schemaPage.draggableItems.nth(1)).toContainText("text1#text1");
});
