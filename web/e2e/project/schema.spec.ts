import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { handleFieldForm } from "@reearth-cms/e2e/project/utils/field";
import { createProject, deleteProject } from "@reearth-cms/e2e/project/utils/project";

test.beforeEach(async ({ reearth, page, projectLayoutPage }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
  await projectLayoutPage.navigateToSchema();
});

test.afterEach(async ({ page }) => {
  await deleteProject(page);
});

async function createModelFromSidebar(schemaPage: any, name: string, key?: string) {
  await schemaPage.addModelButton.first().click();
  await schemaPage.modelNameInput.fill(name);
  if (key) await schemaPage.modelKeyInput.fill(key);
  await schemaPage.okButton.click();
  await closeNotification(schemaPage["page"]);
}
async function updateModel(schemaPage: any, name: string, key: string) {
  await schemaPage.moreButton.hover();
  await schemaPage.editMenuItem.click();
  const dlg = schemaPage.updateModelDialog;
  await dlg.locator("#name").fill(name);
  await dlg.locator("#key").fill(key);
  await schemaPage.okButton.click();
  await closeNotification(schemaPage["page"]);
}
async function deleteModel(schemaPage: any) {
  await schemaPage.moreButton.hover();
  await schemaPage.deleteMenuItem.click();
  await schemaPage.deleteModelConfirmButton.click();
  await closeNotification(schemaPage["page"]);
}
async function createGroup(schemaPage: any, name: string, key: string) {
  await schemaPage.addGroupButton.click();
  await schemaPage.groupNameInput.fill(name);
  await schemaPage.groupKeyInput.fill(key);
  await schemaPage.okButton.click();
  await closeNotification(schemaPage["page"]);
}
async function updateGroup(schemaPage: any, name: string, key: string) {
  await schemaPage.moreButton.hover();
  await schemaPage.editMenuItem.click();
  await schemaPage.groupNameInput.clear();
  await schemaPage.groupNameInput.fill(name);
  await schemaPage.groupKeyInput.clear();
  await schemaPage.groupKeyInput.fill(key);
  await schemaPage.okButton.click();
  await closeNotification(schemaPage["page"]);
}
async function deleteGroup(schemaPage: any) {
  await schemaPage.moreButton.hover();
  await schemaPage.deleteMenuItem.click();
  await schemaPage.deleteGroupConfirmButton.click();
  await closeNotification(schemaPage["page"]);
}

test("Model CRUD has succeeded", async ({ schemaPage }) => {
  const modelName = "model name";
  const modelKey = "model-key";

  await createModelFromSidebar(schemaPage, modelName, modelKey);

  await expect(schemaPage.getByTitle(modelName, { exact: true })).toBeVisible();
  await expect(schemaPage.getByText(`#${modelKey}`)).toBeVisible();
  await expect(schemaPage.getByRole("menuitem", { name: modelName }).locator("span")).toBeVisible();

  const newName = "new model name";
  const newKey = "new-model-key";
  await updateModel(schemaPage, newName, newKey);

  await expect(schemaPage.getByTitle(newName)).toBeVisible();
  await expect(schemaPage.getByText(`#${newKey}`)).toBeVisible();
  await expect(schemaPage.getByRole("menuitem", { name: newName }).locator("span")).toBeVisible();

  await deleteModel(schemaPage);
  await expect(schemaPage.getByTitle(newName)).toBeHidden();
});

test("Model reordering has succeeded", async ({ schemaPage }) => {
  const m1 = "model1";
  const m2 = "model2";
  const m3 = "model3";

  await createModelFromSidebar(schemaPage, m1);
  await createModelFromSidebar(schemaPage, m2);

  await expect(schemaPage.mainMenu.getByRole("menuitem").nth(0)).toContainText(m1);
  await expect(schemaPage.mainMenu.getByRole("menuitem").nth(1)).toContainText(m2);

  await schemaPage
    .getByRole("menuitem", { name: m2 })
    .dragTo(schemaPage.getByRole("menuitem", { name: m1 }));
  await closeNotification(schemaPage["page"]);

  await expect(schemaPage.mainMenu.getByRole("menuitem").nth(0)).toContainText(m2);
  await expect(schemaPage.mainMenu.getByRole("menuitem").nth(1)).toContainText(m1);

  await createModelFromSidebar(schemaPage, m3);
  await expect(schemaPage.mainMenu.getByRole("menuitem").nth(0)).toContainText(m2);
  await expect(schemaPage.mainMenu.getByRole("menuitem").nth(1)).toContainText(m1);
  await expect(schemaPage.mainMenu.getByRole("menuitem").nth(2)).toContainText(m3);
});

test("Group CRUD has succeeded", async ({ schemaPage }) => {
  const g = "e2e group name";
  const k = "e2e-group-key";
  const g2 = "new e2e group name";
  const k2 = "new-e2e-group-key";

  await createGroup(schemaPage, g, k);
  await expect(schemaPage.getByTitle(g, { exact: true })).toBeVisible();
  await expect(schemaPage.getByText(`#${k}`)).toBeVisible();

  await updateGroup(schemaPage, g2, k2);
  await expect(schemaPage.getByTitle(g2)).toBeVisible();
  await expect(schemaPage.getByText(`#${k2}`)).toBeVisible();
  await expect(schemaPage.getByRole("menuitem", { name: g2 })).toBeVisible();

  await deleteGroup(schemaPage);
  await expect(schemaPage.getByTitle(g2)).toBeHidden();
});

test("Group creating from adding field has succeeded", async ({ page, schemaPage }) => {
  await createModelFromSidebar(schemaPage, "e2e model name");

  await schemaPage.paletteListItems.filter({ hasText: "Group" }).locator("div").first().click();
  await schemaPage.createGroupFromFieldButton.click();
  await expect(schemaPage.newGroupDialog).toContainText("New Group");
  await expect(schemaPage.okButton).toBeDisabled();

  await schemaPage.newGroupDialog.locator("#name").fill("e2e group name");
  await schemaPage.newGroupDialog.locator("#key").fill("e2e-group-key");
  await schemaPage.okButton.click();
  await closeNotification(page);

  await expect(
    schemaPage.getByRole("menuitem", { name: "e2e group name" }).locator("span"),
  ).toBeVisible();
  await expect(schemaPage.getByText("e2e group name#e2e-group-key")).toBeVisible();
  await expect(schemaPage.fieldsMetaDataText).toBeHidden();
  await expect(schemaPage.paletteListItems.getByText("Reference", { exact: true })).toBeHidden();
  await expect(schemaPage.paletteListItems.getByText("Group", { exact: true })).toBeHidden();

  // Add a Text field and open "Create Group Field"
  await schemaPage.paletteListItems.filter({ hasText: "Text" }).locator("div").first().click();
  await handleFieldForm(page, "text");
  await schemaPage.getByText("e2e model name").click();
  await schemaPage.paletteListItems.getByText("Group", { exact: true }).click();
  await expect(schemaPage.createGroupFieldDialogTitle).toBeVisible();
  await schemaPage.groupSelectTrigger.click();
  await expect(schemaPage.getByText("e2e group name #e2e-group-key")).toBeVisible();
  await schemaPage.cancelButton.click();
});

test("Group reordering has succeeded", async ({ schemaPage }) => {
  await createGroup(schemaPage, "group1", "group1");
  await createGroup(schemaPage, "group2", "group2");

  await expect(schemaPage.lastMenu.getByRole("menuitem").nth(0)).toContainText("group1");
  await expect(schemaPage.lastMenu.getByRole("menuitem").nth(1)).toContainText("group2");

  await schemaPage
    .lastMenu.getByRole("menuitem")
    .nth(1)
    .dragTo(schemaPage.lastMenu.getByRole("menuitem").nth(0));
  await closeNotification(schemaPage["page"]);

  await expect(schemaPage.lastMenu.getByRole("menuitem").nth(0)).toContainText("group2");
  await expect(schemaPage.lastMenu.getByRole("menuitem").nth(1)).toContainText("group1");

  await createGroup(schemaPage, "group3", "group3");
  await expect(schemaPage.lastMenu.getByRole("menuitem").nth(0)).toContainText("group2");
  await expect(schemaPage.lastMenu.getByRole("menuitem").nth(1)).toContainText("group1");
  await expect(schemaPage.lastMenu.getByRole("menuitem").nth(2)).toContainText("group3");
});

test("Text field CRUD has succeeded", async ({ page, schemaPage }) => {
  await createModelFromSidebar(schemaPage, "e2e model name");

  await schemaPage.paletteListItems.filter({ hasText: /Text/ }).locator("div").first().click();
  await handleFieldForm(page, "text");

  await schemaPage.fieldRowEllipsis.click();
  await handleFieldForm(page, "new text", "new-text");

  await schemaPage.fieldDeleteIcon.click();
  await schemaPage.okButton.click();
  await closeNotification(page);
  await expect(schemaPage.getByText("new text #new-text")).toBeHidden();
});

test("Schema reordering has succeeded", async ({ page, schemaPage }) => {
  await createModelFromSidebar(schemaPage, "e2e model name");

  await schemaPage.paletteListItems.filter({ hasText: /Text/ }).locator("div").first().click();
  await handleFieldForm(page, "text1");
  await schemaPage.paletteListItems.filter({ hasText: /Text/ }).locator("div").first().click();
  await handleFieldForm(page, "text2");

  await expect(schemaPage.fieldsContainer.locator(".draggable-item").nth(0)).toContainText(
    "text1#text1",
  );
  await expect(schemaPage.fieldsContainer.locator(".draggable-item").nth(1)).toContainText(
    "text2#text2",
  );

  await schemaPage
    .fieldsContainer.locator(".grabbable")
    .nth(1)
    .dragTo(schemaPage.fieldsContainer.locator(".draggable-item").nth(0));
  await closeNotification(page);

  await expect(schemaPage.fieldsContainer.locator(".draggable-item").nth(0)).toContainText(
    "text2#text2",
  );
  await expect(schemaPage.fieldsContainer.locator(".draggable-item").nth(1)).toContainText(
    "text1#text1",
  );
});
