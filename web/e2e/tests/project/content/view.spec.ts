import { type Page, expect, test } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";
import { closeNotification } from "@reearth-cms/e2e/helpers/notification.helper";
import { ContentPage } from "@reearth-cms/e2e/pages/content.page";

test.beforeEach(async ({ reearth, workspacePage, projectPage }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await workspacePage.createWorkspace("e2e workspace name");
  const projectName = getId();
  await projectPage.createProject(projectName);
  await projectPage.gotoProject(projectName);
  await projectPage.createModelFromOverview();
});

test.afterEach(async ({ projectPage, workspacePage }) => {
  await projectPage.deleteProject();
  await workspacePage.deleteWorkspace();
});

async function itemAdd(page: Page, data: string, contentPage: ContentPage) {
  await contentPage.newItemButton.click();
  await contentPage.fieldInput("text").click();
  await contentPage.fieldInput("text").fill(data);
  await contentPage.saveButton.click();
  await closeNotification(page);
  await contentPage.backButton.click();
}

test("View CRUD has succeeded", async ({
  page,
  fieldEditorPage,
  projectPage,
  contentPage,
  schemaPage,
}) => {
  test.slow();
  await fieldEditorPage.fieldTypeButton("Text").click();
  await schemaPage.handleFieldForm("text");
  await projectPage.contentMenuItem.click();
  await itemAdd(page, "text1", contentPage);
  await itemAdd(page, "text2", contentPage);
  await itemAdd(page, "sample1", contentPage);
  await itemAdd(page, "sample2", contentPage);
  await contentPage.saveAsNewViewButton.click();
  await contentPage.viewNameInput.fill("view1");
  await contentPage.okButton.click();
  await closeNotification(page);
  await expect(contentPage.viewByName("view1")).toBeVisible();
  await expect(contentPage.tab(0)).toHaveAttribute("aria-selected", "true");

  await contentPage.moreButton.click();
  await contentPage.renameViewButton.click();
  await contentPage.viewNameInput.click();
  await contentPage.viewNameInput.fill("new view1");
  await contentPage.okButton.click();
  await closeNotification(page);
  await expect(contentPage.viewByName("new view1")).toBeVisible();
  await contentPage.moreButton.click();
  await contentPage.removeViewButton.click();
  await contentPage.removeButton.click();
  await closeNotification(page, false);
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
  await closeNotification(page);
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

  await contentPage.viewTabWithMore("new view1").locator("svg").click();
  await contentPage.updateViewButton.click();
  await closeNotification(page);

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
  await contentPage.viewTabWithMore("new view1").locator("svg").click();
  await contentPage.removeViewButton.click();
  await contentPage.removeButton.click();
  await closeNotification(page);
  await expect(contentPage.viewByName("new view1")).toBeHidden();
  await expect(contentPage.viewByName("view2")).toBeVisible();
  await expect(contentPage.tab(0)).toHaveAttribute("aria-selected", "true");
  await expect(contentPage.sortUpIcon).toHaveClass(/active/);
  await expect(contentPage.tableRow(0)).toContainText("text1");
  await expect(contentPage.tableRow(1)).toContainText("text2");
});

test("View reordering has succeeded", async ({ page, projectPage, contentPage }) => {
  await projectPage.contentMenuItem.click();
  await projectPage.modelMenuItemClick(projectPage.modelName).click();

  await contentPage.saveAsNewViewButton.click();
  await contentPage.viewNameInput.fill("view1");
  await contentPage.okButton.click();
  await closeNotification(page);

  await contentPage.saveAsNewViewButton.click();
  await contentPage.viewNameInput.fill("view2");
  await contentPage.okButton.click();
  await closeNotification(page);

  await expect(contentPage.tabList.getByRole("tab").nth(0)).toContainText("view1");
  await expect(contentPage.tabList.getByRole("tab").nth(1)).toContainText("view2");
  await contentPage.tabList
    .getByRole("tab")
    .nth(0)
    .dragTo(contentPage.tabList.getByRole("tab").nth(1));
  await closeNotification(page);

  await expect(contentPage.tabList.getByRole("tab").nth(0)).toContainText("view2");
  await expect(contentPage.tabList.getByRole("tab").nth(1)).toContainText("view1");

  await contentPage.saveAsNewViewButton.click();
  await contentPage.viewNameInput.fill("view3");
  await contentPage.okButton.click();
  await closeNotification(page);

  await expect(contentPage.tabList.getByRole("tab").nth(0)).toContainText("view2");
  await expect(contentPage.tabList.getByRole("tab").nth(1)).toContainText("view1");
  await expect(contentPage.tabList.getByRole("tab").nth(2)).toContainText("view3");
});
