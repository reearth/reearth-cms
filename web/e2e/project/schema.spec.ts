import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { type Page, expect, test } from "@reearth-cms/e2e/fixtures/test";

import { FieldEditorPage } from "../pages/field-editor.page";
import { SchemaPage } from "../pages/schema.page";

import { handleFieldForm } from "./utils/field";
import { createGroup, updateGroup, deleteGroup } from "./utils/group";
import { createModelFromSidebar, updateModel, deleteModel } from "./utils/model";
import { createProject, deleteProject } from "./utils/project";

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

test.beforeEach(async ({ reearth, page, projectPage }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
  await projectPage.schemaMenuItem.click();
});

test.afterEach(async ({ page }) => {
  await deleteProject(page);
});

test("Model CRUD has succeeded", async ({ page, schemaPage, fieldEditorPage }) => {
  const modelName = "model name";
  const modelKey = "model-key";
  await createModelFromSidebar(page, modelName, modelKey);
  await expect(fieldEditorPage.titleByText(modelName, true)).toBeVisible();
  await expect(schemaPage.textByExact(`#${modelKey}`)).toBeVisible();
  await expect(schemaPage.modelMenuItem(modelName).locator("span")).toBeVisible();

  const newModelName = "new model name";
  const newModelKey = "new-model-key";
  await updateModel(page, newModelName, newModelKey);
  await expect(fieldEditorPage.titleByText(newModelName)).toBeVisible();
  await expect(schemaPage.textByExact(`#${newModelKey}`)).toBeVisible();
  await expect(schemaPage.modelMenuItem(newModelName).locator("span")).toBeVisible();

  await deleteModel(page);
  await expect(fieldEditorPage.titleByText(newModelName)).toBeHidden();
});

test("Model reordering has succeeded", async ({ page, schemaPage }) => {
  const modelName1 = "model1";
  const modelName2 = "model2";
  const modelName3 = "model3";

  await createModelFromSidebar(page, modelName1);
  await createModelFromSidebar(page, modelName2);
  await expect(schemaPage.modelMenuItems().nth(0)).toContainText(modelName1);
  await expect(schemaPage.modelMenuItems().nth(1)).toContainText(modelName2);

  await schemaPage.modelMenuItem(modelName2).dragTo(schemaPage.modelMenuItem(modelName1));
  await closeNotification(page);
  await expect(schemaPage.modelMenuItems().nth(0)).toContainText(modelName2);
  await expect(schemaPage.modelMenuItems().nth(1)).toContainText(modelName1);

  await createModelFromSidebar(page, modelName3);
  await expect(schemaPage.modelMenuItems().nth(0)).toContainText(modelName2);
  await expect(schemaPage.modelMenuItems().nth(1)).toContainText(modelName1);
  await expect(schemaPage.modelMenuItems().nth(2)).toContainText(modelName3);
});

test("Group CRUD has succeeded", async ({ page, schemaPage, fieldEditorPage }) => {
  const groupName = "e2e group name";
  const groupKey = "e2e-group-key";
  const updateGroupName = "new e2e group name";
  const updateGroupKey = "new-e2e-group-key";

  await createGroup(page, groupName, groupKey);
  await expect(fieldEditorPage.titleByText(groupName, true)).toBeVisible();
  await expect(schemaPage.textByExact(`#${groupKey}`)).toBeVisible();

  await updateGroup(page, updateGroupName, updateGroupKey);
  await expect(fieldEditorPage.titleByText(updateGroupName)).toBeVisible();
  await expect(schemaPage.textByExact(`#${updateGroupKey}`)).toBeVisible();
  await expect(schemaPage.menuItemByName(updateGroupName)).toBeVisible();

  await deleteGroup(page);
  await expect(fieldEditorPage.titleByText(updateGroupName)).toBeHidden();
});

test("Group creating from adding field has succeeded", async ({
  page,
  schemaPage,
  fieldEditorPage,
}) => {
  await createModelFromSidebar(page);
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
  await handleFieldForm(page, "text");
  await schemaPage.modelByText("e2e model name").click();
  await schemaPage.lastTextByExact("Group").click();
  await expect(schemaPage.createGroupFieldButton).toBeVisible();
  await schemaPage.groupSelectTrigger.click();
  await expect(schemaPage.groupNameByText("e2e group name #e2e-group-key")).toBeVisible();
  await fieldEditorPage.cancelButton.click();
});

test("Group reordering has succeeded", async ({ page, schemaPage }) => {
  await createGroup(page, "group1", "group1");
  await createGroup(page, "group2", "group2");
  await expect(schemaPage.groupMenuItems.nth(0)).toContainText("group1");
  await expect(schemaPage.groupMenuItems.nth(1)).toContainText("group2");
  await schemaPage.groupMenuItems.nth(1).dragTo(schemaPage.groupMenuItems.nth(0));
  await closeNotification(page);
  await expect(schemaPage.groupMenuItems.nth(0)).toContainText("group2");
  await expect(schemaPage.groupMenuItems.nth(1)).toContainText("group1");
  await createGroup(page, "group3", "group3");
  await expect(schemaPage.groupMenuItems.nth(0)).toContainText("group2");
  await expect(schemaPage.groupMenuItems.nth(1)).toContainText("group1");
  await expect(schemaPage.groupMenuItems.nth(2)).toContainText("group3");
});

// eslint-disable-next-line playwright/expect-expect
test("Text field CRUD has succeeded", async ({ page, fieldEditorPage, schemaPage }) => {
  await createModelFromSidebar(page);
  await fieldEditorPage.fieldTypeListItem("Text").click();
  await handleFieldForm(page, "text");
  await fieldEditorPage.ellipsisMenuButton.click();
  await handleFieldForm(page, "new text", "new-text");
  await deleteField(page, "new text", "new-text", fieldEditorPage, schemaPage);
});

test("Schema reordering has succeeded", async ({ page, schemaPage, fieldEditorPage }) => {
  await createModelFromSidebar(page);
  await fieldEditorPage.fieldTypeListItem(/Text/).click();
  await handleFieldForm(page, "text1");
  await fieldEditorPage.fieldTypeListItem(/Text/).click();
  await handleFieldForm(page, "text2");
  await expect(schemaPage.draggableItems.nth(0)).toContainText("text1#text1");
  await expect(schemaPage.draggableItems.nth(1)).toContainText("text2#text2");
  await schemaPage.grabbableItems.nth(1).dragTo(schemaPage.draggableItems.nth(0));
  await closeNotification(page);
  await expect(schemaPage.draggableItems.nth(0)).toContainText("text2#text2");
  await expect(schemaPage.draggableItems.nth(1)).toContainText("text1#text1");
});
