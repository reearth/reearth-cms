import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { handleFieldForm } from "@reearth-cms/e2e/project/utils/field";
import { createModelFromOverview } from "@reearth-cms/e2e/project/utils/model";
import { createProject, deleteProject } from "@reearth-cms/e2e/project/utils/project";

test.beforeEach(async ({ reearth, page, fieldEditorPage, projectPage, contentPage, schemaPage }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
  await createModelFromOverview(page);

  await fieldEditorPage.fieldTypeButton("Text").click();
  await handleFieldForm(page, "text");
  await projectPage.contentMenuItem.click();
  await contentPage.newItemButton.click();
  await contentPage.fieldInput("text").fill("test");
  await contentPage.saveButton.click();
  await closeNotification(page);
  await projectPage.schemaMenuItem.click();
  await schemaPage.metaDataTab.click();
  await schemaPage.booleanListItem.click();
  await handleFieldForm(page, "boolean");
  await projectPage.contentMenuItem.click();
});

test.afterEach(async ({ page }) => {
  await deleteProject(page);
});

test("Updating metadata added later from table has succeeded", async ({ page, contentPage }) => {
  await contentPage.allSwitches.click();
  await closeNotification(page);
  await contentPage.allSwitches.click();
  await closeNotification(page);
  await contentPage.allSwitches.click();
  await closeNotification(page);
  await contentPage.editButton.click();
  await expect(contentPage.fieldInput("boolean")).toHaveAttribute("aria-checked", "true");
});

test("Updating metadata added later from edit page has succeeded", async ({ page, contentPage }) => {
  await contentPage.editButton.click();
  await expect(contentPage.fieldInput("text")).toHaveValue("test");
  await contentPage.fieldInput("boolean").click();
  await closeNotification(page);
  await contentPage.backButtonRole.click();
  await expect(contentPage.allSwitches).toHaveAttribute("aria-checked", "true");
});
