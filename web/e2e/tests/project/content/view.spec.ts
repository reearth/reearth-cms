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

test("View CRUD has succeeded", async ({
  fieldEditorPage,
  projectPage,
  contentPage,
  schemaPage,
}) => {
  test.slow();
  await fieldEditorPage.fieldTypeButton("Text").click();
  await schemaPage.handleFieldForm("text");
  await projectPage.contentMenuItem.click();
  await contentPage.createItemWithField("text", "text1");
  await contentPage.createItemWithField("text", "text2");
  await contentPage.createItemWithField("text", "sample1");
  await contentPage.createItemWithField("text", "sample2");
  await contentPage.saveAsNewViewButton.click();
  await contentPage.viewNameInput.fill("view1");
  await contentPage.okButton.click();
  await contentPage.closeNotification();
  await expect(contentPage.viewByName("view1")).toBeVisible();
  await expect(contentPage.tab(0)).toHaveAttribute("aria-selected", "true");

  await contentPage.moreButton.click();
  await contentPage.renameViewButton.click();
  await contentPage.viewNameInput.click();
  await contentPage.viewNameInput.fill("new view1");
  await contentPage.okButton.click();
  await contentPage.closeNotification();
  await expect(contentPage.viewByName("new view1")).toBeVisible();
  await contentPage.moreButton.click();
  await contentPage.removeViewButton.click();
  await contentPage.removeButton.click();
  await contentPage.closeNotification(false);
  await contentPage.cancelButton.click();

  await contentPage.textColumnHeader().click();
  await expect(contentPage.sortUpIcon).toHaveClass(/active/);
  await expect(contentPage.tableRow(0)).toContainText("sample1");
  await expect(contentPage.tableRow(1)).toContainText("sample2");

  await contentPage.addFilterButton.click();
  await contentPage.filterMenuItem("text").click();
  await expect(contentPage.filterCloseButton("text")).toBeVisible();
  await contentPage.isDropdown.click();
  await contentPage.containsOption.click();
  await contentPage.filterValueInput.click();
  await contentPage.filterValueInput.fill("text");
  await contentPage.confirmButton.click();

  await contentPage.settingsButton.click();
  await expect(contentPage.statusColumnHeader).toBeVisible();
  await contentPage.statusCheckbox.click();
  await expect(contentPage.statusColumnHeader).toBeHidden();

  await contentPage.saveAsNewViewButton.click();
  await contentPage.viewNameInput.click();
  await contentPage.viewNameInput.fill("view2");
  await contentPage.okButton.click();
  await contentPage.closeNotification();
  await expect(contentPage.tab(0)).toHaveAttribute("aria-selected", "false");
  await expect(contentPage.tab(1)).toHaveAttribute("aria-selected", "true");
  await expect(contentPage.sortUpIcon).toHaveClass(/active/);
  await expect(contentPage.tableRow(0)).toContainText("text1");
  await expect(contentPage.tableRow(1)).toContainText("text2");

  await contentPage.viewByName("new view1").click();
  await expect(contentPage.tab(0)).toHaveAttribute("aria-selected", "true");
  await expect(contentPage.tab(1)).toHaveAttribute("aria-selected", "false");
  await expect(contentPage.sortUpIcon).not.toHaveClass(/active/);
  await expect(contentPage.filterCloseButton("text")).toBeHidden();
  await expect(contentPage.tableRow(0)).toContainText("sample2");
  await expect(contentPage.tableRow(1)).toContainText("sample1");
  await expect(contentPage.statusColumnHeader).toBeVisible();

  await contentPage.textColumnHeader().first().click();
  await contentPage.textColumnHeader().first().click();
  await expect(contentPage.tableRow(0)).toContainText("text2");
  await contentPage.addFilterButton.click();
  await contentPage.filterMenuItem("text").click();
  await expect(contentPage.filterCloseButton("text")).toBeVisible();
  await contentPage.isDropdown.click();
  await contentPage.endWithOption.click();
  await contentPage.filterValueInput.click();
  await contentPage.filterValueInput.fill("1");
  await contentPage.confirmButton.click();

  await contentPage.viewTabMoreIcon("new view1").click();
  await contentPage.updateViewButton.click();
  await contentPage.closeNotification();

  await contentPage.viewByName("view2").click();
  await expect(contentPage.sortUpIcon).toHaveClass(/active/);
  await expect(contentPage.filterCloseButton("text")).toBeVisible();
  await expect(contentPage.tableRow(0)).toContainText("text1");
  await expect(contentPage.tableRow(1)).toContainText("text2");
  await expect(contentPage.statusColumnHeader).toBeHidden();
  await contentPage.settingsButton.click();
  await expect(contentPage.statusCheckbox).not.toHaveClass(/ant-tree-checkbox-checked/);
  await contentPage.settingsButton.click();

  await contentPage.viewByName("new view1").click();
  await expect(contentPage.sortDownIcon).toHaveClass(/active/);
  await expect(contentPage.tableRow(0)).toContainText("text1");
  await expect(contentPage.tableRow(1)).toContainText("sample1");

  await contentPage.viewTabWithMore("new view1").click();
  await contentPage.viewTabMoreIcon("new view1").click();
  await contentPage.removeViewButton.click();
  await contentPage.removeButton.click();
  await contentPage.closeNotification();
  await expect(contentPage.viewByName("new view1")).toBeHidden();
  await expect(contentPage.viewByName("view2")).toBeVisible();
  await expect(contentPage.tab(0)).toHaveAttribute("aria-selected", "true");
  await expect(contentPage.sortUpIcon).toHaveClass(/active/);
  await expect(contentPage.tableRow(0)).toContainText("text1");
  await expect(contentPage.tableRow(1)).toContainText("text2");
});

test("View reordering has succeeded", async ({ projectPage, contentPage }) => {
  await projectPage.contentMenuItem.click();
  await projectPage.modelMenuItemClick(projectPage.modelName).click();

  await contentPage.saveAsNewViewButton.click();
  await contentPage.viewNameInput.fill("view1");
  await contentPage.okButton.click();
  await contentPage.closeNotification();

  await contentPage.saveAsNewViewButton.click();
  await contentPage.viewNameInput.fill("view2");
  await contentPage.okButton.click();
  await contentPage.closeNotification();

  await expect(contentPage.viewTab(0)).toContainText("view1");
  await expect(contentPage.viewTab(1)).toContainText("view2");
  await contentPage.viewTab(0).dragTo(contentPage.viewTab(1));
  await contentPage.closeNotification();

  await expect(contentPage.viewTab(0)).toContainText("view2");
  await expect(contentPage.viewTab(1)).toContainText("view1");

  await contentPage.saveAsNewViewButton.click();
  await contentPage.viewNameInput.fill("view3");
  await contentPage.okButton.click();
  await contentPage.closeNotification();

  await expect(contentPage.viewTab(0)).toContainText("view2");
  await expect(contentPage.viewTab(1)).toContainText("view1");
  await expect(contentPage.viewTab(2)).toContainText("view3");
});
