import { SchemaFieldType } from "@reearth-cms/components/molecules/Schema/types";
import { config } from "@reearth-cms/e2e/config/config";
import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { parseConfigBoolean } from "@reearth-cms/e2e/helpers/format.helper";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";

const disableWorkspaceUI = parseConfigBoolean(config.disableWorkspaceUi);

test.beforeEach(async ({ reearth, workspacePage, projectPage }) => {
  test.skip(disableWorkspaceUI, "Workspace UI is disabled in this configuration");
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await workspacePage.createWorkspace(`e2e-ws-${getId()}`);
  const projectName = getId();
  await projectPage.createProject(projectName);
  await projectPage.gotoProject(projectName);
  await projectPage.createModelFromOverview();
});

test.afterEach(async ({ projectPage, workspacePage }) => {
  test.skip(disableWorkspaceUI, "Workspace UI is disabled in this configuration");
  await projectPage.deleteProject();
  await workspacePage.deleteWorkspace();
});

test("Create a new view", async ({ fieldEditorPage, projectPage, contentPage }) => {
  await test.step("Setup: Create text field and content items", async () => {
    await fieldEditorPage.createField({ type: SchemaFieldType.Text, name: "text" });
    await projectPage.contentMenuItem.click();
    await contentPage.createItemWithField("text", "text1");
    await contentPage.createItemWithField("text", "text2");
  });

  await test.step("Create a new view named 'view1'", async () => {
    await contentPage.saveAsNewViewButton.click();
    await contentPage.viewNameInput.fill("view1");
    await contentPage.okButton.click();
    await contentPage.closeNotification();
  });

  await test.step("Verify view is created and selected", async () => {
    await expect(contentPage.viewByName("view1")).toBeVisible();
    await expect(contentPage.tab(0)).toHaveAttribute("aria-selected", "true");
  });
});

test("Rename an existing view", async ({ fieldEditorPage, projectPage, contentPage }) => {
  await test.step("Setup: Create text field and content item", async () => {
    await fieldEditorPage.createField({ type: SchemaFieldType.Text, name: "text" });
    await projectPage.contentMenuItem.click();
    await contentPage.createItemWithField("text", "text1");
  });

  await test.step("Create initial view", async () => {
    await contentPage.saveAsNewViewButton.click();
    await contentPage.viewNameInput.fill("view1");
    await contentPage.okButton.click();
    await contentPage.closeNotification();
  });

  await test.step("Rename view to 'renamed view'", async () => {
    await contentPage.moreButton.click();
    await contentPage.renameViewButton.click();
    await contentPage.viewNameInput.click();
    await contentPage.viewNameInput.fill("renamed view");
    await contentPage.okButton.click();
    await contentPage.closeNotification();
  });

  await test.step("Verify view was renamed", async () => {
    await expect(contentPage.viewByName("renamed view")).toBeVisible();
  });
});

test("Cancel view deletion", async ({ fieldEditorPage, projectPage, contentPage }) => {
  await test.step("Setup: Create text field and content item", async () => {
    await fieldEditorPage.createField({ type: SchemaFieldType.Text, name: "text" });
    await projectPage.contentMenuItem.click();
    await contentPage.createItemWithField("text", "text1");
  });

  await test.step("Create initial view", async () => {
    await contentPage.saveAsNewViewButton.click();
    await contentPage.viewNameInput.fill("view1");
    await contentPage.okButton.click();
    await contentPage.closeNotification();
  });

  await test.step("Attempt to delete view but cancel", async () => {
    await contentPage.moreButton.click();
    await contentPage.removeViewButton.click();
    await contentPage.cancelButton.click();
  });

  await test.step("Verify view still exists", async () => {
    await expect(contentPage.viewByName("view1")).toBeVisible();
  });
});

test("Apply sorting to view", async ({ fieldEditorPage, projectPage, contentPage }) => {
  await test.step("Setup: Create text field and content items", async () => {
    await fieldEditorPage.createField({ type: SchemaFieldType.Text, name: "text" });
    await projectPage.contentMenuItem.click();
    await contentPage.createItemWithField("text", "text2");
    await contentPage.createItemWithField("text", "sample1");
    await contentPage.createItemWithField("text", "sample2");
  });

  await test.step("Apply ascending sort to text column", async () => {
    await contentPage.textColumnHeader().click();
  });

  await test.step("Verify items are sorted alphabetically", async () => {
    await expect(contentPage.sortUpIcon).toHaveClass(/active/);
    await expect(contentPage.tableRow(0)).toContainText("sample1");
    await expect(contentPage.tableRow(1)).toContainText("sample2");
  });
});

test("Apply filter to view", async ({ fieldEditorPage, projectPage, contentPage }) => {
  await test.step("Setup: Create text field and content items", async () => {
    await fieldEditorPage.createField({ type: SchemaFieldType.Text, name: "text" });
    await projectPage.contentMenuItem.click();
    await contentPage.createItemWithField("text", "text1");
    await contentPage.createItemWithField("text", "sample1");
  });

  await test.step("Add filter: text contains 'text'", async () => {
    await contentPage.addFilterButton.click();
    await contentPage.filterMenuItem("text").click();
    await expect(contentPage.filterCloseButton("text")).toBeVisible();
    await contentPage.isDropdown.click();
    await contentPage.containsOption.click();
    await contentPage.filterValueInput.click();
    await contentPage.filterValueInput.fill("text");
    await contentPage.confirmButton.click();
  });

  await test.step("Verify filtered results", async () => {
    await expect(contentPage.tableRow(0)).toContainText("text1");
  });
});

test("Toggle column visibility in view settings", async ({
  fieldEditorPage,
  projectPage,
  contentPage,
}) => {
  await test.step("Setup: Create text field and content item", async () => {
    await fieldEditorPage.createField({ type: SchemaFieldType.Text, name: "text" });
    await projectPage.contentMenuItem.click();
    await contentPage.createItemWithField("text", "text1");
  });

  await test.step("Open settings and verify status column is visible", async () => {
    await contentPage.settingsButton.click();
    await expect(contentPage.statusColumnHeader).toBeVisible();
  });

  await test.step("Hide status column", async () => {
    await contentPage.statusCheckbox.click();
  });

  await test.step("Verify status column is hidden", async () => {
    await expect(contentPage.statusColumnHeader).toBeHidden();
  });
});

test("Save view with custom sorting and filtering", async ({
  fieldEditorPage,
  projectPage,
  contentPage,
}) => {
  await test.step("Setup: Create text field and content items", async () => {
    await fieldEditorPage.createField({ type: SchemaFieldType.Text, name: "text" });
    await projectPage.contentMenuItem.click();
    await contentPage.createItemWithField("text", "text1");
    await contentPage.createItemWithField("text", "text2");
    await contentPage.createItemWithField("text", "sample1");
  });

  await test.step("Apply sorting", async () => {
    await contentPage.textColumnHeader().click();
    await expect(contentPage.sortUpIcon).toHaveClass(/active/);
  });

  await test.step("Apply filter: text contains 'text'", async () => {
    await contentPage.addFilterButton.click();
    await contentPage.filterMenuItem("text").click();
    await contentPage.isDropdown.click();
    await contentPage.containsOption.click();
    await contentPage.filterValueInput.click();
    await contentPage.filterValueInput.fill("text");
    await contentPage.confirmButton.click();
  });

  await test.step("Hide status column", async () => {
    await contentPage.settingsButton.click();
    await contentPage.statusCheckbox.click();
  });

  await test.step("Save as new view", async () => {
    await contentPage.saveAsNewViewButton.click();
    await contentPage.viewNameInput.click();
    await contentPage.viewNameInput.fill("filtered view");
    await contentPage.okButton.click();
    await contentPage.closeNotification();
  });

  await test.step("Verify view saved with all customizations", async () => {
    await expect(contentPage.viewByName("filtered view")).toBeVisible();
    await expect(contentPage.sortUpIcon).toHaveClass(/active/);
    await expect(contentPage.tableRow(0)).toContainText("text1");
    await expect(contentPage.tableRow(1)).toContainText("text2");
    await expect(contentPage.statusColumnHeader).toBeHidden();
  });
});

test("Switch between views preserves individual view settings", async ({
  fieldEditorPage,
  projectPage,
  contentPage,
}) => {
  await test.step("Setup: Create text field and content items", async () => {
    await fieldEditorPage.createField({ type: SchemaFieldType.Text, name: "text" });
    await projectPage.contentMenuItem.click();
    await contentPage.createItemWithField("text", "text1");
    await contentPage.createItemWithField("text", "text2");
    await contentPage.createItemWithField("text", "sample1");
    await contentPage.createItemWithField("text", "sample2");
  });

  await test.step("Create first view with no customization", async () => {
    await contentPage.saveAsNewViewButton.click();
    await contentPage.viewNameInput.fill("view1");
    await contentPage.okButton.click();
    await contentPage.closeNotification();
  });

  await test.step("Apply sorting, filtering, and hide column", async () => {
    await contentPage.textColumnHeader().click();
    await contentPage.addFilterButton.click();
    await contentPage.filterMenuItem("text").click();
    await contentPage.isDropdown.click();
    await contentPage.containsOption.click();
    await contentPage.filterValueInput.click();
    await contentPage.filterValueInput.fill("text");
    await contentPage.confirmButton.click();
    await contentPage.settingsButton.click();
    await contentPage.statusCheckbox.click();
  });

  await test.step("Save as second view with customizations", async () => {
    await contentPage.saveAsNewViewButton.click();
    await contentPage.viewNameInput.click();
    await contentPage.viewNameInput.fill("view2");
    await contentPage.okButton.click();
    await contentPage.closeNotification();
  });

  await test.step("Verify view2 has customizations", async () => {
    await expect(contentPage.tab(1)).toHaveAttribute("aria-selected", "true");
    await expect(contentPage.sortUpIcon).toHaveClass(/active/);
    await expect(contentPage.tableRow(0)).toContainText("text1");
    await expect(contentPage.statusColumnHeader).toBeHidden();
  });

  await test.step("Switch to view1 and verify it has no customizations", async () => {
    await contentPage.viewByName("view1").click();
    await expect(contentPage.tab(0)).toHaveAttribute("aria-selected", "true");
    await expect(contentPage.sortUpIcon).not.toHaveClass(/active/);
    await expect(contentPage.filterCloseButton("text")).toBeHidden();
    await expect(contentPage.tableRow(0)).toContainText("sample2");
    await expect(contentPage.statusColumnHeader).toBeVisible();
  });
});

test("Update view settings", async ({ fieldEditorPage, projectPage, contentPage }) => {
  await test.step("Setup: Create text field and content items", async () => {
    await fieldEditorPage.createField({ type: SchemaFieldType.Text, name: "text" });
    await projectPage.contentMenuItem.click();
    await contentPage.createItemWithField("text", "text1");
    await contentPage.createItemWithField("text", "sample1");
  });

  await test.step("Create initial view", async () => {
    await contentPage.saveAsNewViewButton.click();
    await contentPage.viewNameInput.fill("view1");
    await contentPage.okButton.click();
    await contentPage.closeNotification();
  });

  await test.step("Apply descending sort", async () => {
    await contentPage.textColumnHeader().first().click();
    await contentPage.textColumnHeader().first().click();
    await expect(contentPage.tableRow(0)).toContainText("text1");
  });

  await test.step("Apply filter: text ends with '1'", async () => {
    await contentPage.addFilterButton.click();
    await contentPage.filterMenuItem("text").click();
    await contentPage.isDropdown.click();
    await contentPage.endWithOption.click();
    await contentPage.filterValueInput.click();
    await contentPage.filterValueInput.fill("1");
    await contentPage.confirmButton.click();
  });

  await test.step("Update the view with new settings", async () => {
    await contentPage.viewTabMoreIcon("view1").click();
    await contentPage.updateViewButton.click();
    await contentPage.closeNotification();
  });

  await test.step("Create another view to switch context", async () => {
    await contentPage.saveAsNewViewButton.click();
    await contentPage.viewNameInput.fill("view2");
    await contentPage.okButton.click();
    await contentPage.closeNotification();
  });

  await test.step("Switch back to view1 and verify updated settings persisted", async () => {
    await contentPage.viewByName("view1").click();
    await expect(contentPage.sortDownIcon).toHaveClass(/active/);
    await expect(contentPage.tableRow(0)).toContainText("text1");
    await expect(contentPage.tableRow(1)).toContainText("sample1");
  });
});

test("Delete view and switch to remaining view", async ({
  fieldEditorPage,
  projectPage,
  contentPage,
}) => {
  await test.step("Setup: Create text field and content items", async () => {
    await fieldEditorPage.createField({ type: SchemaFieldType.Text, name: "text" });
    await projectPage.contentMenuItem.click();
    await contentPage.createItemWithField("text", "text1");
    await contentPage.createItemWithField("text", "text2");
  });

  await test.step("Create first view", async () => {
    await contentPage.saveAsNewViewButton.click();
    await contentPage.viewNameInput.fill("view1");
    await contentPage.okButton.click();
    await contentPage.closeNotification();
  });

  await test.step("Apply customizations for second view", async () => {
    await contentPage.textColumnHeader().click();
    await contentPage.addFilterButton.click();
    await contentPage.filterMenuItem("text").click();
    await contentPage.isDropdown.click();
    await contentPage.containsOption.click();
    await contentPage.filterValueInput.click();
    await contentPage.filterValueInput.fill("text");
    await contentPage.confirmButton.click();
    await contentPage.settingsButton.click();
    await contentPage.statusCheckbox.click();
  });

  await test.step("Save as second view", async () => {
    await contentPage.saveAsNewViewButton.click();
    await contentPage.viewNameInput.fill("view2");
    await contentPage.okButton.click();
    await contentPage.closeNotification();
  });

  await test.step("Delete view1", async () => {
    await contentPage.viewTabWithMore("view1").click();
    await contentPage.viewTabMoreIcon("view1").click();
    await contentPage.removeViewButton.click();
    await contentPage.removeButton.click();
    await contentPage.closeNotification();
  });

  await test.step("Verify view1 is deleted and view2 is active with settings preserved", async () => {
    await expect(contentPage.viewByName("view1")).toBeHidden();
    await expect(contentPage.viewByName("view2")).toBeVisible();
    await expect(contentPage.tab(0)).toHaveAttribute("aria-selected", "true");
    await expect(contentPage.sortUpIcon).toHaveClass(/active/);
    await expect(contentPage.tableRow(0)).toContainText("text1");
    await expect(contentPage.tableRow(1)).toContainText("text2");
  });
});

test("View reordering has succeeded", async ({ projectPage, contentPage }) => {
  await test.step("Navigate to content page", async () => {
    await projectPage.contentMenuItem.click();
    await projectPage.modelMenuItemClick(projectPage.modelName).click();
  });

  await test.step("Create view1", async () => {
    await contentPage.saveAsNewViewButton.click();
    await contentPage.viewNameInput.fill("view1");
    await contentPage.okButton.click();
    await contentPage.closeNotification();
  });

  await test.step("Create view2", async () => {
    await contentPage.saveAsNewViewButton.click();
    await contentPage.viewNameInput.fill("view2");
    await contentPage.okButton.click();
    await contentPage.closeNotification();
  });

  await test.step("Verify initial view order", async () => {
    await expect(contentPage.viewTab(0)).toContainText("view1");
    await expect(contentPage.viewTab(1)).toContainText("view2");
  });

  await test.step("Drag view1 to position after view2", async () => {
    await contentPage.viewTab(0).dragTo(contentPage.viewTab(1));
    await contentPage.closeNotification();
  });

  await test.step("Verify view order changed", async () => {
    await expect(contentPage.viewTab(0)).toContainText("view2");
    await expect(contentPage.viewTab(1)).toContainText("view1");
  });

  await test.step("Create view3", async () => {
    await contentPage.saveAsNewViewButton.click();
    await contentPage.viewNameInput.fill("view3");
    await contentPage.okButton.click();
    await contentPage.closeNotification();
  });

  await test.step("Verify final view order with view3 at end", async () => {
    await expect(contentPage.viewTab(0)).toContainText("view2");
    await expect(contentPage.viewTab(1)).toContainText("view1");
    await expect(contentPage.viewTab(2)).toContainText("view3");
  });
});
