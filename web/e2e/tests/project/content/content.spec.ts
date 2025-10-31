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

test("Item CRUD and searching has succeeded", async ({
  contentPage,
  fieldEditorPage,
  projectPage,
  schemaPage,
}) => {
  await fieldEditorPage.fieldTypeButton("Text").click();
  await schemaPage.handleFieldForm("text");
  await projectPage.contentMenuItem.click();
  await contentPage.newItemButton.click();
  await contentPage.fieldInput("text").click();
  await contentPage.fieldInput("text").fill("text");
  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  await contentPage.backButton.click();
  await expect(contentPage.cellByText("text", true)).toBeVisible();
  await contentPage.searchInput.click();
  await contentPage.searchInput.fill("no field");
  await contentPage.searchButton.click();
  await expect(contentPage.cellByText("text", true)).toBeHidden();
  await contentPage.searchInput.fill("");
  await contentPage.searchButton.click();
  await expect(contentPage.cellByText("text", true)).toBeVisible();
  await contentPage.cellEditButton.click();
  await contentPage.fieldInput("text").click();

  await expect(contentPage.fieldInput("text")).toHaveValue("text");
  await contentPage.fieldInput("text").click();
  await contentPage.fieldInput("text").fill("new text");
  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  await contentPage.backButtonLabel.click();
  await expect(contentPage.cellByText("new text")).toBeVisible();
  await contentPage.selectAllCheckbox.check();
  await contentPage.deleteButton.click();
  await contentPage.closeNotification();
  await expect(contentPage.cellByText("new text")).toBeHidden();
});

test("Publishing and Unpublishing item from edit page has succeeded", async ({
  contentPage,
  fieldEditorPage,
  schemaPage,
}) => {
  await fieldEditorPage.fieldTypeListItem("Text").click();
  await schemaPage.handleFieldForm("text");
  await contentPage.contentTextFirst.click();
  await contentPage.newItemButton.click();
  await contentPage.fieldInput("text").click();
  await contentPage.fieldInput("text").fill("text");
  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  await expect(contentPage.draftStatus).toBeVisible();
  await contentPage.publishButton.click();
  await contentPage.closeNotification();
  await expect(contentPage.publishedStatus).toBeVisible();
  await contentPage.backButtonLabel.click();
  await expect(contentPage.publishedStatus).toBeVisible();
  await contentPage.cellEditButton.click();
  await expect(contentPage.publishedStatus).toBeVisible();
  await contentPage.ellipsisMenuButton.click();
  await contentPage.unpublishButton.click();
  await contentPage.closeNotification();
  await expect(contentPage.draftStatus).toBeVisible();
  await contentPage.backButtonLabel.click();
  await expect(contentPage.draftStatus).toBeVisible();
});

test("@important Publishing and Unpublishing item from table has succeeded", async ({
  contentPage,
  fieldEditorPage,
  schemaPage,
}) => {
  await fieldEditorPage.fieldTypeListItem("Text").click();
  await schemaPage.handleFieldForm("text");
  await contentPage.contentTextFirst.click();
  await contentPage.newItemButton.click();
  await contentPage.fieldInput("text").click();
  await contentPage.fieldInput("text").fill("text");
  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  await expect(contentPage.draftStatus).toBeVisible();
  await contentPage.backButtonLabel.click();
  await expect(contentPage.draftStatus).toBeVisible();
  await contentPage.selectAllCheckbox.check();
  await contentPage.publishFromTableButton.click();
  await contentPage.yesButton.click();
  await contentPage.closeNotification();
  await expect(contentPage.publishedStatus).toBeVisible();
  await contentPage.unpublishButton.click();
  await contentPage.closeNotification();
  await expect(contentPage.draftStatus).toBeVisible();
  await contentPage.cellEditButton.click();
  await expect(contentPage.draftStatus).toBeVisible();
});

test("@important Showing item title has succeeded", async ({
  contentPage,
  fieldEditorPage,
  schemaPage,
}) => {
  await fieldEditorPage.fieldTypeListItem("Text").click();
  await schemaPage.handleFieldForm("text");
  await contentPage.contentText.click();
  await contentPage.newItemButton.click();
  await expect(contentPage.titleByText("e2e model name", true)).toBeVisible();
  await contentPage.fieldInput("text").click();
  await contentPage.fieldInput("text").fill("text");
  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  const itemId = contentPage.getCurrentItemId();
  await expect(contentPage.titleByText(`e2e model name / ${itemId}`, true)).toBeVisible();

  await schemaPage.schemaText.click();
  await fieldEditorPage.ellipsisMenuButton.click();
  await fieldEditorPage.useAsTitleCheckbox.check();
  await fieldEditorPage.defaultValueTab.click();
  await fieldEditorPage.setDefaultValueInput.click();
  await fieldEditorPage.defaultValueTextInput.fill("default text");
  await fieldEditorPage.okButton.click();
  await contentPage.closeNotification();

  await contentPage.contentText.click();
  await contentPage.cellEditButton.click();
  await expect(contentPage.titleByText(`e2e model name / text`, true)).toBeVisible();
  await contentPage.backButtonLabel.click();

  await contentPage.newItemButton.click();
  await expect(contentPage.titleByText("e2e model name", true)).toBeVisible();
  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  await expect(contentPage.titleByText(`e2e model name / default text`, true)).toBeVisible();
});

test("@important Comment CRUD on Content page has succeeded", async ({
  contentPage,
  fieldEditorPage,
  schemaPage,
}) => {
  await fieldEditorPage.fieldTypeListItem("Text").click();
  await schemaPage.handleFieldForm("text");
  await contentPage.contentText.click();
  await contentPage.newItemButton.click();
  await contentPage.fieldInput("text").click();
  await contentPage.fieldInput("text").fill("text");
  await contentPage.saveButton.click();
  await contentPage.closeNotification();

  await contentPage.backButtonLabel.click();

  await contentPage.commentsCountButton("0").click();
  await contentPage.createComment("comment");
  await contentPage.updateComment("comment", "new comment");
  await contentPage.deleteComment();
});

test("@important Comment CRUD on edit page has succeeded", async ({
  contentPage,
  fieldEditorPage,
  schemaPage,
}) => {
  await fieldEditorPage.fieldTypeListItem("Text").click();
  await schemaPage.handleFieldForm("text");
  await contentPage.contentText.click();
  await contentPage.newItemButton.click();
  await contentPage.fieldInput("text").click();
  await contentPage.fieldInput("text").fill("text");
  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  await contentPage.commentButton.click();
  await contentPage.createComment("comment");
  await contentPage.updateComment("comment", "new comment");
  await contentPage.deleteComment();
});
