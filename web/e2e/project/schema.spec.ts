/* eslint-disable playwright/expect-expect */
import { expect } from "@playwright/test";

import { test } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/utils/mock";

import { handleFieldForm } from "./utils/field";

test.beforeEach(async ({ reearth, homePage, projectLayoutPage }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await homePage.createProject(getId());
  await projectLayoutPage.navigateToSchema();
});

test.afterEach(async ({ projectLayoutPage, projectSettingsPage }) => {
  await projectLayoutPage.navigateToSettings();
  await projectSettingsPage.deleteProject();
});

test("Model CRUD has succeeded", async ({ schemaPage }) => {
  const modelName = "model name";
  const modelKey = "model-key";
  await schemaPage.createModelFromSidebar(modelName, modelKey);
  await schemaPage.expectModelVisible(modelName);
  await schemaPage.expectModelKey(modelKey);
  await schemaPage.expectModelInSidebar(modelName);

  const newModelName = "new model name";
  const newModelKey = "new-model-key";
  await schemaPage.updateModel(newModelName, newModelKey);
  await schemaPage.expectModelVisible(newModelName);
  await schemaPage.expectModelKey(newModelKey);
  await schemaPage.expectModelInSidebar(newModelName);

  await schemaPage.deleteModel();
  await schemaPage.expectModelHidden(newModelName);
});

test("Model reordering has succeeded", async ({ schemaPage }) => {
  const modelName1 = "model1";
  const modelName2 = "model2";
  const modelName3 = "model3";

  await schemaPage.createModelFromSidebar(modelName1);
  await schemaPage.createModelFromSidebar(modelName2);
  await schemaPage.expectModelInPosition(0, modelName1);
  await schemaPage.expectModelInPosition(1, modelName2);

  await schemaPage.dragModel(modelName2, modelName1);
  await schemaPage.expectModelInPosition(0, modelName2);
  await schemaPage.expectModelInPosition(1, modelName1);

  await schemaPage.createModelFromSidebar(modelName3);
  await schemaPage.expectModelInPosition(0, modelName2);
  await schemaPage.expectModelInPosition(1, modelName1);
  await schemaPage.expectModelInPosition(2, modelName3);
});

test("Group CRUD has succeeded", async ({ schemaPage }) => {
  const groupName = "e2e group name";
  const groupKey = "e2e-group-key";
  const updateGroupName = "new e2e group name";
  const updateGroupKey = "new-e2e-group-key";

  await schemaPage.createGroup(groupName, groupKey);
  await schemaPage.expectModelVisible(groupName);
  await schemaPage.expectModelKey(groupKey);

  await schemaPage.updateGroup(updateGroupName, updateGroupKey);
  await schemaPage.expectModelVisible(updateGroupName);
  await schemaPage.expectModelKey(updateGroupKey);
  await schemaPage.expectGroupInSidebar(updateGroupName);

  await schemaPage.deleteGroup();
  await schemaPage.expectModelHidden(updateGroupName);
});

test("Group creating from adding field has succeeded", async ({ page, schemaPage }) => {
  const groupName = "e2e group name";
  const groupKey = "e2e-group-key";

  await schemaPage.createModelFromSidebar();
  await schemaPage.addGroupField();
  await schemaPage.createGroupFromFieldDialog();
  await expect(schemaPage.getByLabel("New Group")).toContainText("New Group");
  await schemaPage.expectCreateGroupOKDisabled();

  await schemaPage.fillGroupDialogForm(groupName, groupKey);
  await schemaPage.getByRole("button", { name: "OK" }).click();
  await schemaPage.closeNotification();

  await schemaPage.expectGroupInSidebar(groupName);
  await schemaPage.expectFieldVisible(groupName, groupKey);
  await schemaPage.expectFieldsMetaDataHidden();
  await schemaPage.expectReferenceFieldHidden();
  await schemaPage.expectGroupFieldHidden();

  await schemaPage.addTextField();
  await handleFieldForm(page, "text");
  await schemaPage.clickModelInSidebar("e2e model name");
  await schemaPage.clickCreateGroupField();
  await schemaPage.expectCreateGroupFieldDialog();
  await schemaPage.selectGroupInDropdown(groupName, groupKey);
  await schemaPage.cancelGroupFieldDialog();
});

test("Group reordering has succeeded", async ({ schemaPage }) => {
  await schemaPage.createGroup("group1", "group1");
  await schemaPage.createGroup("group2", "group2");
  await schemaPage.expectGroupInPosition(0, "group1");
  await schemaPage.expectGroupInPosition(1, "group2");

  await schemaPage.dragGroup(1, 0);
  await schemaPage.expectGroupInPosition(0, "group2");
  await schemaPage.expectGroupInPosition(1, "group1");

  await schemaPage.createGroup("group3", "group3");
  await schemaPage.expectGroupInPosition(0, "group2");
  await schemaPage.expectGroupInPosition(1, "group1");
  await schemaPage.expectGroupInPosition(2, "group3");
});

test("Text field CRUD has succeeded", async ({ page, schemaPage }) => {
  await schemaPage.createModelFromSidebar();
  await schemaPage.addTextField();
  await handleFieldForm(page, "text");
  await schemaPage.clickFieldEdit();
  await handleFieldForm(page, "new text", "new-text");
  await schemaPage.deleteField();
  await schemaPage.expectFieldHidden("new text", "new-text");
});

test("Schema reordering has succeeded", async ({ page, schemaPage }) => {
  await schemaPage.createModelFromSidebar();
  await schemaPage.addTextField();
  await handleFieldForm(page, "text1");
  await schemaPage.addTextField();
  await handleFieldForm(page, "text2");

  await schemaPage.expectFieldInPosition(0, "text1", "text1");
  await schemaPage.expectFieldInPosition(1, "text2", "text2");

  await schemaPage.dragField(1, 0);
  await schemaPage.expectFieldInPosition(0, "text2", "text2");
  await schemaPage.expectFieldInPosition(1, "text1", "text1");
});
