import { config } from "@reearth-cms/e2e/config/config";
import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { parseConfigBoolean } from "@reearth-cms/e2e/helpers/format.helper";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";

const disableWorkspaceUI = parseConfigBoolean(config.disableWorkspaceUi);
const itemTitle = "e2e item title";
const titleFieldName = "e2e title field";
const requestTitle = "e2e request title";
const modelName = "e2e model name";

let projectName: string;

test.beforeEach(async ({ reearth, projectPage, schemaPage, contentPage}) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  projectName = getId();
  await projectPage.createProject(projectName);
  await projectPage.gotoProject(projectName);
  await projectPage.createModelFromOverview();
  await schemaPage.createTitleField(titleFieldName, itemTitle);
  await contentPage.createItem();
  await contentPage.createRequest(requestTitle);
});

test.afterEach(async ({ projectPage }) => {
  await projectPage.deleteProject(projectName);
});

test("Request creating, searching, updating reviewer, and approving has succeeded", async ({
  requestPage,
}) => {
  test.skip(disableWorkspaceUI, "Workspace UI is disabled in this configuration");
  await requestPage.requestMenuItem.click();
  await expect(requestPage.tableBodyTextByText(requestTitle, true)).toBeVisible();
  await expect(requestPage.tableBodyTextByText("WAITING")).toBeVisible();
  await requestPage.searchInput.click();
  await requestPage.searchInput.fill("no request");
  await requestPage.searchButton.click();
  await expect(requestPage.tableBodyTextByText(requestTitle, true)).toBeHidden();
  await expect(requestPage.tableBodyTextByText("WAITING")).toBeHidden();
  await requestPage.searchInput.fill("");
  await requestPage.searchButton.click();
  await expect(requestPage.tableBodyTextByText(requestTitle, true)).toBeVisible();
  await expect(requestPage.tableBodyTextByText("WAITING")).toBeVisible();

  await requestPage.editButton.click();
  await requestPage.assignToButton.click();
  await requestPage.closeCircleButton.click();
  await requestPage.selectOverflow.click();
  await requestPage.selectItem.click();
  await requestPage.reviewerHeading.click();
  await requestPage.approveButton.click();
  await requestPage.closeNotification();
  await requestPage.backButton.click();
  await expect(requestPage.tableBodyTextByText(requestTitle, true)).toBeHidden();
  await requestPage.stateFilterButton.click();
  await requestPage.waitingMenuItem().uncheck();
  await requestPage.okButton.click();
  await expect(requestPage.tableBodyTextByText(requestTitle, true)).toBeVisible();
  await expect(requestPage.tableBodyTextByText("APPROVED")).toBeVisible();
});

test("Request closing and reopening has succeeded", async ({ requestPage }) => {
  test.skip(disableWorkspaceUI, "Workspace UI is disabled in this configuration");
  await requestPage.requestMenuItem.click();
  await expect(requestPage.tableBodyTextByText(requestTitle, true)).toBeVisible();
  await expect(requestPage.tableBodyTextByText("WAITING")).toBeVisible();
  await requestPage.editButton.click();

  await requestPage.closeButton.click();
  await requestPage.closeNotification();
  await requestPage.backButton.click();
  await expect(requestPage.tableBodyTextByText(requestTitle, true)).toBeHidden();
  await expect(requestPage.tableBodyTextByText("WAITING")).toBeHidden();

  await requestPage.stateFilterButton.click();
  await requestPage.waitingMenuItem().uncheck();
  await requestPage.okButton.click();
  await expect(requestPage.tableBodyTextByText("CLOSED")).toBeVisible();
  await requestPage.editButton.click();
  await expect(requestPage.statusText("CLOSED")).toBeVisible();
  await expect(requestPage.statusText("Closed")).toBeVisible();
  await requestPage.reopenButton.click();
  await requestPage.closeNotification();
  await requestPage.backButtonCapitalized.click();
  await expect(requestPage.tableBodyTextByText(requestTitle, true)).toBeVisible();
  await expect(requestPage.tableBodyTextByText("WAITING")).toBeVisible();
  await requestPage.selectCheckbox.check();
  await requestPage.closeTextButton.click();
  await requestPage.closeNotification();
  await requestPage.stateFilterButton.click();
  await requestPage.waitingMenuItem().uncheck();
  await requestPage.okButton.click();
  await expect(requestPage.tableBodyTextByText("CLOSED")).toBeVisible();
  await requestPage.editButton.click();
  await expect(requestPage.statusText("CLOSED")).toBeVisible();
});

test("Comment CRUD on edit page has succeeded", async ({ requestPage }) => {
  test.skip(disableWorkspaceUI, "Workspace UI is disabled in this configuration");
  await requestPage.requestMenuItem.click();
  await expect(requestPage.tableBodyTextByText(requestTitle, true)).toBeVisible();
  await expect(requestPage.tableBodyTextByText("WAITING")).toBeVisible();
  await requestPage.editButton.click();

  await requestPage.commentTextbox.click();
  await requestPage.commentTextbox.fill("comment");
  await requestPage.commentButton.click();
  await requestPage.closeNotification();
  await expect(requestPage.statusText("comment")).toBeVisible();
  await requestPage.editButton.click();
  await requestPage.commentTextboxWithText("comment").click();
  await requestPage.commentTextboxWithText("comment").fill("new comment");
  await requestPage.checkButton.click();
  await requestPage.closeNotification();
  await expect(requestPage.getByText("new comment")).toBeVisible();
  await requestPage.deleteButton.click();
  await requestPage.closeNotification();
  await expect(requestPage.getByText("new comment")).toBeHidden();
});

test("Comment CRUD on Request page has succeeded", async ({ requestPage, contentPage }) => {
  test.skip(disableWorkspaceUI, "Workspace UI is disabled in this configuration");
  await requestPage.requestMenuItem.click();
  await requestPage.commentsCountButton("0").click();

  await contentPage.createComment("comment");
  await contentPage.updateComment("comment", "new comment");
  await contentPage.deleteComment();
});

test("Creating a new request and adding to request has succeeded", async ({ requestPage }) => {
  test.skip(disableWorkspaceUI, "Workspace UI is disabled in this configuration");
  test.slow();
  await requestPage.backButtonCapitalized.click();
  await requestPage.newItemButton.click();
  await requestPage.saveButton.click();
  await requestPage.closeNotification();
  await requestPage.ellipsisButton.click();
  await requestPage.addToRequestButton.click();
  await requestPage.selectCheckbox.check();
  await requestPage.okButton.click();
  await requestPage.closeNotification();
  await requestPage.requestMenuItem.click();
  await requestPage.editButton.click();
  await expect(requestPage.collapsedModelButton("e2e model name", 0)).toBeVisible();
  await expect(requestPage.collapsedModelButton("e2e model name", 1)).toBeVisible();
});

test("Navigating between item and request has succeeded", async ({ contentPage, requestPage }) => {
  test.skip(disableWorkspaceUI, "Workspace UI is disabled in this configuration");
  await requestPage.versionHistoryTab.click();
  await requestPage.requestTitleLink(requestTitle).click();
  await expect(requestPage.requestPageTitle(requestTitle)).toBeVisible();
  await expect(requestPage.requestHeading(requestTitle)).toBeVisible();
  await requestPage.approveButton.click();
  await requestPage.closeNotification();
  await requestPage.itemTitleButton(itemTitle).click();
  await expect(requestPage.titleFieldInput(titleFieldName, "Title")).toHaveValue(itemTitle);
  await requestPage.titleFieldInput(titleFieldName, "Title").click();
  await requestPage.titleFieldInput(titleFieldName, "Title").clear();
  await requestPage.saveButton.click();
  await requestPage.closeNotification();
  const itemId = requestPage.getCurrentItemId();
  await expect(requestPage.modelPathText(modelName, itemId)).toBeVisible();
  const newRequestTitle = "newRequestTitle";
  await contentPage.createRequest(newRequestTitle);
  await requestPage.titleFieldInput(titleFieldName, "Title").click();
  await requestPage.titleFieldInput(titleFieldName, "Title").fill("newItemTitle");
  await requestPage.saveButton.click();
  await requestPage.closeNotification();
  await requestPage.versionHistoryTab.click();
  await requestPage.requestTitleLink(newRequestTitle).click();
  await expect(requestPage.collapsedModelItemButton(modelName, itemId)).toBeVisible();
});
