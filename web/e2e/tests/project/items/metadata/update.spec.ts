import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";

test.beforeEach(async ({ reearth, fieldEditorPage, projectPage, contentPage, schemaPage }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  const projectName = getId();
  await projectPage.createProject(projectName);
  await projectPage.gotoProject(projectName);
  await projectPage.createModelFromOverview();

  await fieldEditorPage.fieldTypeButton("Text").click();
  await schemaPage.handleFieldForm("text");
  await projectPage.contentMenuItem.click();
  await contentPage.newItemButton.click();
  await contentPage.fieldInput("text").fill("test");
  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  await projectPage.schemaMenuItem.click();
  await schemaPage.metaDataTab.click();
  await schemaPage.booleanListItem.click();
  await schemaPage.handleFieldForm("boolean");
  await projectPage.contentMenuItem.click();
});

test.afterEach(async ({ projectPage }) => {
  await projectPage.deleteProject();
});

test("Updating metadata added later from table has succeeded", async ({ contentPage }) => {
  await contentPage.allSwitches.click();
  await contentPage.closeNotification();
  await contentPage.allSwitches.click();
  await contentPage.closeNotification();
  await contentPage.allSwitches.click();
  await contentPage.closeNotification();
  await contentPage.editButton.click();
  await expect(contentPage.fieldInput("boolean")).toHaveAttribute("aria-checked", "true");
});

test("Updating metadata added later from edit page has succeeded", async ({ contentPage }) => {
  await contentPage.editButton.click();
  await expect(contentPage.fieldInput("text")).toHaveValue("test");
  await contentPage.fieldInput("boolean").click();
  await contentPage.closeNotification();
  await contentPage.backButtonRole.click();
  await expect(contentPage.allSwitches).toHaveAttribute("aria-checked", "true");
});
