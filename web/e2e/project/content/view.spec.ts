import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { type Page, expect, test } from "@reearth-cms/e2e/fixtures/test"; // here
import { ContentPage } from "@reearth-cms/e2e/pages/content.page";
import { handleFieldForm } from "@reearth-cms/e2e/project/utils/field";
import { modelName, createModelFromOverview } from "@reearth-cms/e2e/project/utils/model";
import { createProject, deleteProject } from "@reearth-cms/e2e/project/utils/project";
import { createWorkspace, deleteWorkspace } from "@reearth-cms/e2e/project/utils/workspace";

test.beforeEach(async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createWorkspace(page);
  await createProject(page);
  await createModelFromOverview(page);
});

test.afterEach(async ({ page }) => {
  await deleteProject(page);
  await deleteWorkspace(page);
});

async function itemAdd(page: Page, contentPage: ContentPage, data: string) {
  await contentPage.newItemButton.click();
  await page.getByLabel("text").fill(data);
  await contentPage.saveButton.click();
  await closeNotification(page);
  await contentPage.backButton.click();
}

test("View CRUD has succeeded", async ({ page, contentPage }) => {
  test.slow();

  // add Text field to the model
  await page.locator("li").filter({ hasText: "Text" }).locator("div").first().click();
  await handleFieldForm(page, "text");

  // to Content & create items
  await contentPage.contentTab.click();
  await itemAdd(page, contentPage, "text1");
  await itemAdd(page, contentPage, "text2");
  await itemAdd(page, contentPage, "sample1");
  await itemAdd(page, contentPage, "sample2");

  // Save as new view: view1
  await contentPage.saveAsNewViewButton.click();
  await contentPage.viewNameInput.fill("view1");
  await contentPage.okButton.click();
  await closeNotification(page);

  await expect(contentPage.tabByName("view1")).toBeVisible();
  await expect(contentPage.tabNth(0)).toHaveAttribute("aria-selected", "true");

  // Rename view1 -> new view1
  await contentPage.viewMoreIcon.click();
  await contentPage.viewRenameMenuItem.click();
  await contentPage.viewNameInput.fill("new view1");
  await contentPage.okButton.click();
  await closeNotification(page);
  await expect(contentPage.tabByName("new view1")).toBeVisible();

  // Try remove view then cancel
  await contentPage.viewMoreIcon.click();
  await contentPage.viewRemoveMenuItem.click();
  await contentPage.removeButton.click();
  await closeNotification(page, false);
  await contentPage.cancelButton.click();

  // Sort asc by "text"
  await contentPage.tabByName("text").click(); // header cell text button
  await expect(contentPage.sortCaretUp("text")).toHaveClass(/active/);
  await expect(contentPage.tableRows.nth(0)).toContainText("sample1");
  await expect(contentPage.tableRows.nth(1)).toContainText("sample2");

  // Add filter: text contains "text"
  await contentPage.addFilterButton.click();
  await contentPage.filterFieldMenuItem("text").click();
  await expect(contentPage.filterChipCloseButton("text")).toBeVisible();
  await contentPage.firstConditionDropdown.click();
  await contentPage.conditionOption("contains").click();
  await contentPage.filterValueInput.fill("text");
  await contentPage.filterConfirmButton.click();

  // Column settings: hide Status
  await contentPage.columnSettingsButton.click();
  await expect(contentPage.statusColumnHeader).toBeVisible();
  await contentPage.firstColumnTreeCheckbox.click();
  await expect(contentPage.statusColumnHeader).toBeHidden();

  // Save as new view: view2
  await contentPage.saveAsNewViewButton.click();
  await contentPage.viewNameInput.fill("view2");
  await contentPage.okButton.click();
  await closeNotification(page);

  await expect(contentPage.tabNth(0)).toHaveAttribute("aria-selected", "false");
  await expect(contentPage.tabNth(1)).toHaveAttribute("aria-selected", "true");
  await expect(contentPage.sortCaretUp("text")).toHaveClass(/active/);
  await expect(contentPage.tableRows.nth(0)).toContainText("text1");
  await expect(contentPage.tableRows.nth(1)).toContainText("text2");

  // Switch back to "new view1" (no filter, different sort)
  await contentPage.tabByName("new view1").click();
  await expect(contentPage.tabNth(0)).toHaveAttribute("aria-selected", "true");
  await expect(contentPage.tabNth(1)).toHaveAttribute("aria-selected", "false");
  await expect(contentPage.sortCaretUp("text")).not.toHaveClass(/active/);
  await expect(contentPage.filterChipCloseButton("text")).toBeHidden();
  await expect(contentPage.tableRows.nth(0)).toContainText("sample2");
  await expect(contentPage.tableRows.nth(1)).toContainText("sample1");
  await expect(contentPage.statusColumnHeader).toBeVisible();

  // Toggle sort twice on "text"
  await contentPage.tabByName("text").first().click();
  await contentPage.tabByName("text").first().click();
  await expect(contentPage.tableRows.nth(0)).toContainText("text2");

  // Add filter: "text" end with "1"
  await contentPage.addFilterButton.click();
  await contentPage.filterFieldMenuItem("text").click();
  await expect(contentPage.filterChipCloseButton("text")).toBeVisible();
  await contentPage.firstConditionDropdown.click();
  await contentPage.conditionOption("end with").click();
  await contentPage.filterValueInput.fill("1");
  await contentPage.filterConfirmButton.click();

  // Update current view ("new view1")
  await contentPage.tabMoreIcon("new view1").click();
  await contentPage.updateViewMenuItem.click();
  await closeNotification(page);

  // Switch to "view2" and verify it stayed as saved
  await contentPage.tabByName("view2").click();
  await expect(contentPage.sortCaretUp("text")).toHaveClass(/active/);
  await expect(contentPage.filterChipCloseButton("text")).toBeVisible();
  await expect(contentPage.tableRows.nth(0)).toContainText("text1");
  await expect(contentPage.tableRows.nth(1)).toContainText("text2");
  await expect(contentPage.statusColumnHeader).toBeHidden();
  await contentPage.columnSettingsButton.click();
  await expect(contentPage.firstColumnTreeCheckbox).not.toHaveClass(/ant-tree-checkbox-checked/);
  await contentPage.columnSettingsButton.click();

  // Back to "new view1" and verify changes (desc sort + filter)
  await contentPage.tabByName("new view1").click();
  await expect(contentPage.sortCaretDown("text")).toHaveClass(/active/);
  await expect(contentPage.tableRows.nth(0)).toContainText("text1");
  await expect(contentPage.tableRows.nth(1)).toContainText("sample1");

  // Remove "new view1"
  await contentPage.tabMore("new view1").click();
  await contentPage.tabMoreIcon("new view1").click();
  await contentPage.viewRemoveMenuItem.click();
  await contentPage.removeButton.click();
  await closeNotification(page);

  await expect(contentPage.tabByName("new view1")).toBeHidden();
  await expect(contentPage.tabByName("view2")).toBeVisible();
  await expect(contentPage.tabNth(0)).toHaveAttribute("aria-selected", "true");
  await expect(contentPage.sortCaretUp("text")).toHaveClass(/active/);
  await expect(contentPage.tableRows.nth(0)).toContainText("text1");
  await expect(contentPage.tableRows.nth(1)).toContainText("text2");
});

test("View reordering has succeeded", async ({ page, contentPage }) => {
  await contentPage.contentTab.click();
  await contentPage.modelMenuItem(modelName).click();

  // Create view1
  await contentPage.saveAsNewViewButton.click();
  await contentPage.viewNameInput.fill("view1");
  await contentPage.okButton.click();
  await closeNotification(page);

  // Create view2
  await contentPage.saveAsNewViewButton.click();
  await contentPage.viewNameInput.fill("view2");
  await contentPage.okButton.click();
  await closeNotification(page);

  await expect(contentPage.tabNth(0)).toContainText("view1");
  await expect(contentPage.tabNth(1)).toContainText("view2");

  // Drag view1 -> after view2
  await contentPage.tabNth(0).dragTo(contentPage.tabNth(1));
  await closeNotification(page);

  await expect(contentPage.tabNth(0)).toContainText("view2");
  await expect(contentPage.tabNth(1)).toContainText("view1");

  // Create view3
  await contentPage.saveAsNewViewButton.click();
  await contentPage.viewNameInput.fill("view3");
  await contentPage.okButton.click();
  await closeNotification(page);

  await expect(contentPage.tabNth(0)).toContainText("view2");
  await expect(contentPage.tabNth(1)).toContainText("view1");
  await expect(contentPage.tabNth(2)).toContainText("view3");
});
