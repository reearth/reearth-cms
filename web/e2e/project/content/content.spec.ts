import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { crudComment } from "@reearth-cms/e2e/project/utils/comment";
import { handleFieldForm } from "@reearth-cms/e2e/project/utils/field";
import { createModelFromOverview } from "@reearth-cms/e2e/project/utils/model";
import { createProject, deleteProject } from "@reearth-cms/e2e/project/utils/project";

test.beforeEach(async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
  await createModelFromOverview(page);
});

test.afterEach(async ({ page }) => {
  await deleteProject(page);
});

test("Item CRUD and searching has succeeded", async ({
  page,
  contentPage,
  fieldEditorPage,
  projectPage,
}) => {
  await fieldEditorPage.fieldTypeButton("Text").click();
  await handleFieldForm(page, "text");
  await projectPage.contentMenuItem.click();
  await contentPage.newItemButton.click();
  await contentPage.fieldInput("text").click();
  await contentPage.fieldInput("text").fill("text");
  await contentPage.saveButton.click();
  await closeNotification(page);
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
  await closeNotification(page);
  await contentPage.backButtonLabel.click();
  await expect(contentPage.cellByText("new text")).toBeVisible();
  await contentPage.selectAllCheckbox.check();
  await contentPage.deleteButton.click();
  await closeNotification(page);
  await expect(contentPage.cellByText("new text")).toBeHidden();
});

test("Publishing and Unpublishing item from edit page has succeeded", async ({
  page,
  contentPage,
  fieldEditorPage,
}) => {
  await fieldEditorPage.fieldTypeListItem("Text").click();
  await handleFieldForm(page, "text");
  await contentPage.contentTextFirst.click();
  await contentPage.newItemButton.click();
  await contentPage.fieldInput("text").click();
  await contentPage.fieldInput("text").fill("text");
  await contentPage.saveButton.click();
  await closeNotification(page);
  await expect(contentPage.draftStatus).toBeVisible();
  await contentPage.publishButton.click();
  await closeNotification(page);
  await expect(contentPage.publishedStatus).toBeVisible();
  await contentPage.backButtonLabel.click();
  await expect(contentPage.publishedStatus).toBeVisible();
  await contentPage.cellEditButton.click();
  await expect(contentPage.publishedStatus).toBeVisible();
  await contentPage.ellipsisMenuButton.click();
  await contentPage.unpublishButton.click();
  await closeNotification(page);
  await expect(contentPage.draftStatus).toBeVisible();
  await contentPage.backButtonLabel.click();
  await expect(contentPage.draftStatus).toBeVisible();
});

test("Publishing and Unpublishing item from table has succeeded", async ({
  page,
  contentPage,
  fieldEditorPage,
}) => {
  await fieldEditorPage.fieldTypeListItem("Text").click();
  await handleFieldForm(page, "text");
  await contentPage.contentTextFirst.click();
  await contentPage.newItemButton.click();
  await contentPage.fieldInput("text").click();
  await contentPage.fieldInput("text").fill("text");
  await contentPage.saveButton.click();
  await closeNotification(page);
  await expect(contentPage.draftStatus).toBeVisible();
  await contentPage.backButtonLabel.click();
  await expect(contentPage.draftStatus).toBeVisible();
  await contentPage.selectAllCheckbox.check();
  await contentPage.publishFromTableButton.click();
  await contentPage.yesButton.click();
  await closeNotification(page);
  await expect(contentPage.publishedStatus).toBeVisible();
  await contentPage.unpublishButton.click();
  await closeNotification(page);
  await expect(contentPage.draftStatus).toBeVisible();
  await contentPage.cellEditButton.click();
  await expect(contentPage.draftStatus).toBeVisible();
});

test("Showing item title has succeeded", async ({
  page,
  contentPage,
  fieldEditorPage,
  schemaPage,
}) => {
  await fieldEditorPage.fieldTypeListItem("Text").click();
  await handleFieldForm(page, "text");
  await contentPage.contentText.click();
  await contentPage.newItemButton.click();
  await expect(contentPage.titleByText("e2e model name", true)).toBeVisible();
  await contentPage.fieldInput("text").click();
  await contentPage.fieldInput("text").fill("text");
  await contentPage.saveButton.click();
  await closeNotification(page);
  const itemId = page.url().split("/").at(-1);
  await expect(contentPage.titleByText(`e2e model name / ${itemId}`, true)).toBeVisible();

  await schemaPage.schemaText.click();
  await fieldEditorPage.ellipsisMenuButton.click();
  await fieldEditorPage.useAsTitleCheckbox.check();
  await fieldEditorPage.defaultValueTab.click();
  await fieldEditorPage.setDefaultValueInput.click();
  await fieldEditorPage.defaultValueTextInput.fill("default text");
  await fieldEditorPage.okButton.click();
  await closeNotification(page);

  await contentPage.contentText.click();
  await contentPage.cellEditButton.click();
  await expect(contentPage.titleByText(`e2e model name / text`, true)).toBeVisible();
  await contentPage.backButtonLabel.click();

  await contentPage.newItemButton.click();
  await expect(contentPage.titleByText("e2e model name", true)).toBeVisible();
  await contentPage.saveButton.click();
  await closeNotification(page);
  await expect(contentPage.titleByText(`e2e model name / default text`, true)).toBeVisible();
});

// eslint-disable-next-line playwright/expect-expect
test("Comment CRUD on Content page has succeeded", async ({
  page,
  contentPage,
  fieldEditorPage,
}) => {
  await fieldEditorPage.fieldTypeListItem("Text").click();
  await handleFieldForm(page, "text");
  await contentPage.contentText.click();
  await contentPage.newItemButton.click();
  await contentPage.fieldInput("text").click();
  await contentPage.fieldInput("text").fill("text");
  await contentPage.saveButton.click();
  await closeNotification(page);

  await contentPage.backButtonLabel.click();

  await contentPage.commentsCountButton("0").click();
  await crudComment(page);
});

// eslint-disable-next-line playwright/expect-expect
test("Comment CRUD on edit page has succeeded", async ({ page, contentPage, fieldEditorPage }) => {
  await fieldEditorPage.fieldTypeListItem("Text").click();
  await handleFieldForm(page, "text");
  await contentPage.contentText.click();
  await contentPage.newItemButton.click();
  await contentPage.fieldInput("text").click();
  await contentPage.fieldInput("text").fill("text");
  await contentPage.saveButton.click();
  await closeNotification(page);
  await contentPage.commentButton.click();
  await crudComment(page);
});
