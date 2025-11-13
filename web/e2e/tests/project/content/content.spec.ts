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

test("@smoke Item CRUD and searching has succeeded", async ({
  page,
  contentPage,
  fieldEditorPage,
  projectPage,
  schemaPage,
}) => {
  await test.step("Create text field and navigate to content", async () => {
    await fieldEditorPage.fieldTypeButton("Text").click();
    await schemaPage.handleFieldForm("text");
    await projectPage.navContentMenuItem.click();
    await page.waitForTimeout(300);
  });

  await test.step("Create new item with text value", async () => {
    await contentPage.newItemButton.click();
    await contentPage.fieldInput("text").click();
    await contentPage.fieldInput("text").fill("text");
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
    await contentPage.backButton.click();
    await expect(contentPage.cellByText("text", true)).toBeVisible();
    await page.waitForTimeout(300);
  });

  await test.step("Search for non-existent item", async () => {
    await contentPage.searchInput.click();
    await contentPage.searchInput.fill("no field");
    await contentPage.searchButton.click();
    await expect(contentPage.cellByText("text", true)).toBeHidden();
    await page.waitForTimeout(300);
  });

  await test.step("Clear search to show item again", async () => {
    await contentPage.searchInput.fill("");
    await contentPage.searchButton.click();
    await expect(contentPage.cellByText("text", true)).toBeVisible();
    await page.waitForTimeout(300);
  });

  await test.step("Edit item with new text value", async () => {
    await contentPage.cellEditButton.click();
    await contentPage.fieldInput("text").click();
    await expect(contentPage.fieldInput("text")).toHaveValue("text");
    await contentPage.fieldInput("text").click();
    await contentPage.fieldInput("text").fill("new text");
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
    await contentPage.backButtonLabel.click();
    await expect(contentPage.cellByText("new text")).toBeVisible();
    await page.waitForTimeout(300);
  });

  await test.step("Delete item", async () => {
    await contentPage.selectAllCheckbox.check();
    await contentPage.deleteButton.click();
    await contentPage.closeNotification();
    await expect(contentPage.cellByText("new text")).toBeHidden();
    await page.waitForTimeout(300);
  });
});

test("@smoke Publishing and Unpublishing item from edit page has succeeded", async ({
  page,
  contentPage,
  fieldEditorPage,
  schemaPage,
}) => {
  await test.step("Create text field and new item", async () => {
    await fieldEditorPage.fieldTypeListItem("Text").click();
    await schemaPage.handleFieldForm("text");
    await contentPage.contentTextFirst.click();
    await contentPage.newItemButton.click();
    await contentPage.fieldInput("text").click();
    await contentPage.fieldInput("text").fill("text");
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
    await expect(contentPage.draftStatus).toBeVisible();
    await page.waitForTimeout(300);
  });

  await test.step("Publish item from edit page", async () => {
    await contentPage.publishButton.click();
    await contentPage.closeNotification();
    await expect(contentPage.publishedStatus).toBeVisible();
    await page.waitForTimeout(300);
  });

  await test.step("Verify published status persists", async () => {
    await contentPage.backButtonLabel.click();
    await expect(contentPage.publishedStatus).toBeVisible();
    await contentPage.cellEditButton.click();
    await expect(contentPage.publishedStatus).toBeVisible();
    await page.waitForTimeout(300);
  });

  await test.step("Unpublish item from edit page", async () => {
    await contentPage.ellipsisMenuButton.click();
    await contentPage.unpublishButton.click();
    await contentPage.closeNotification();
    await expect(contentPage.draftStatus).toBeVisible();
    await page.waitForTimeout(300);
  });

  await test.step("Verify draft status persists", async () => {
    await contentPage.backButtonLabel.click();
    await expect(contentPage.draftStatus).toBeVisible();
    await page.waitForTimeout(300);
  });
});

test("Publishing and Unpublishing item from table has succeeded", async ({
  page,
  contentPage,
  fieldEditorPage,
  schemaPage,
}) => {
  await test.step("Create text field and new item", async () => {
    await fieldEditorPage.fieldTypeListItem("Text").click();
    await schemaPage.handleFieldForm("text");
    await contentPage.contentTextFirst.click();
    await contentPage.newItemButton.click();
    await contentPage.fieldInput("text").click();
    await contentPage.fieldInput("text").fill("text");
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
    await expect(contentPage.draftStatus).toBeVisible();
    await page.waitForTimeout(300);
  });

  await test.step("Navigate to table and verify draft status", async () => {
    await contentPage.backButtonLabel.click();
    await expect(contentPage.draftStatus).toBeVisible();
    await page.waitForTimeout(300);
  });

  await test.step("Publish item from table", async () => {
    await contentPage.selectAllCheckbox.check();
    await contentPage.publishFromTableButton.click();
    await contentPage.yesButton.click();
    await contentPage.closeNotification();
    await expect(contentPage.publishedStatus).toBeVisible();
    await page.waitForTimeout(300);
  });

  await test.step("Unpublish item from table", async () => {
    await contentPage.unpublishButton.click();
    await contentPage.closeNotification();
    await expect(contentPage.draftStatus).toBeVisible();
    await page.waitForTimeout(300);
  });

  await test.step("Verify draft status in edit page", async () => {
    await contentPage.cellEditButton.click();
    await expect(contentPage.draftStatus).toBeVisible();
    await page.waitForTimeout(300);
  });
});

test("Showing item title has succeeded", async ({
  page,
  contentPage,
  fieldEditorPage,
  schemaPage,
}) => {
  await test.step("Create text field and new item", async () => {
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
    await page.waitForTimeout(300);
  });

  await test.step("Configure field to use as title with default value", async () => {
    await schemaPage.schemaText.click();
    await fieldEditorPage.ellipsisMenuButton.click();
    await fieldEditorPage.useAsTitleCheckbox.check();
    await fieldEditorPage.defaultValueTab.click();
    await fieldEditorPage.setDefaultValueInput.click();
    await fieldEditorPage.defaultValueTextInput.fill("default text");
    await fieldEditorPage.okButton.click();
    await contentPage.closeNotification();
    await page.waitForTimeout(300);
  });

  await test.step("Verify title shows field value", async () => {
    await contentPage.contentText.click();
    await contentPage.cellEditButton.click();
    await expect(contentPage.titleByText(`e2e model name / text`, true)).toBeVisible();
    await contentPage.backButtonLabel.click();
    await page.waitForTimeout(300);
  });

  await test.step("Verify title shows default value for new item", async () => {
    await contentPage.newItemButton.click();
    await expect(contentPage.titleByText("e2e model name", true)).toBeVisible();
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
    await expect(contentPage.titleByText(`e2e model name / default text`, true)).toBeVisible();
    await page.waitForTimeout(300);
  });
});

test("@smoke Comment CRUD on Content page has succeeded", async ({
  page,
  contentPage,
  fieldEditorPage,
  schemaPage,
}) => {
  await test.step("Create text field and new item", async () => {
    await fieldEditorPage.fieldTypeListItem("Text").click();
    await schemaPage.handleFieldForm("text");
    await contentPage.contentText.click();
    await contentPage.newItemButton.click();
    await contentPage.fieldInput("text").click();
    await contentPage.fieldInput("text").fill("text");
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
    await contentPage.backButtonLabel.click();
    await page.waitForTimeout(300);
  });

  await test.step("Open comments panel", async () => {
    await contentPage.commentsCountButton("0").click();
    await page.waitForTimeout(300);
  });

  await test.step("Create comment", async () => {
    await contentPage.createComment("comment");
    await page.waitForTimeout(300);
  });

  await test.step("Update comment", async () => {
    await contentPage.updateComment("comment", "new comment");
    await page.waitForTimeout(300);
  });

  await test.step("Delete comment", async () => {
    await contentPage.deleteComment();
    await page.waitForTimeout(300);
  });
});

test("Comment CRUD on edit page has succeeded", async ({
  page,
  contentPage,
  fieldEditorPage,
  schemaPage,
}) => {
  await test.step("Create text field and new item", async () => {
    await fieldEditorPage.fieldTypeListItem("Text").click();
    await schemaPage.handleFieldForm("text");
    await contentPage.contentText.click();
    await contentPage.newItemButton.click();
    await contentPage.fieldInput("text").click();
    await contentPage.fieldInput("text").fill("text");
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
    await page.waitForTimeout(300);
  });

  await test.step("Open comments panel", async () => {
    await contentPage.commentButton.click();
    await page.waitForTimeout(300);
  });

  await test.step("Create comment", async () => {
    await contentPage.createComment("comment");
    await page.waitForTimeout(300);
  });

  await test.step("Update comment", async () => {
    await contentPage.updateComment("comment", "new comment");
    await page.waitForTimeout(300);
  });

  await test.step("Delete comment", async () => {
    await contentPage.deleteComment();
    await page.waitForTimeout(300);
  });
});
