/* eslint-disable playwright/no-skipped-test */
import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { parseConfigBoolean } from "@reearth-cms/utils/format";

import { config } from "../utils/config";

import { crudComment } from "./utils/comment";
import { createTitleField, itemTitle, titleFieldName } from "./utils/field";
import { createItem, createRequest, requestTitle } from "./utils/item";
import { createModelFromOverview, modelName } from "./utils/model";
import { createProject, deleteProject } from "./utils/project";
import { createWorkspace, deleteWorkspace } from "./utils/workspace";

const disableWorkspaceUI = parseConfigBoolean(config.disableWorkspaceUi);

test.beforeEach(async ({ reearth, page }) => {
  test.skip(disableWorkspaceUI, "Workspace UI is disabled in this configuration");
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createWorkspace(page);
  await createProject(page);
  await createModelFromOverview(page);
  await createTitleField(page);
  await createItem(page);
  await createRequest(page);
});

test.afterEach(async ({ page }) => {
  test.skip(disableWorkspaceUI, "Workspace UI is disabled in this configuration");
  await deleteProject(page);
  await deleteWorkspace(page);
});

test("Request creating, searching, updating reviewer, and approving has succeeded", async ({
  page,
  requestPage,
}) => {
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
  await closeNotification(page);
  await requestPage.backButton.click();
  await expect(requestPage.tableBodyTextByText(requestTitle, true)).toBeHidden();
  await requestPage.stateFilterButton.click();
  await requestPage.waitingMenuItem().uncheck();
  await requestPage.okButton.click();
  await expect(requestPage.tableBodyTextByText(requestTitle, true)).toBeVisible();
  await expect(requestPage.tableBodyTextByText("APPROVED")).toBeVisible();
});

test("Request closing and reopening has succeeded", async ({ page, requestPage }) => {
  await requestPage.requestMenuItem.click();
  await expect(requestPage.tableBodyTextByText(requestTitle, true)).toBeVisible();
  await expect(requestPage.tableBodyTextByText("WAITING")).toBeVisible();
  await requestPage.editButton.click();

  await requestPage.closeButton.click();
  await closeNotification(page);
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
  await closeNotification(page);
  await requestPage.backButtonCapitalized.click();
  await expect(requestPage.tableBodyTextByText(requestTitle, true)).toBeVisible();
  await expect(requestPage.tableBodyTextByText("WAITING")).toBeVisible();
  await requestPage.selectCheckbox.check();
  await requestPage.closeTextButton.click();
  await closeNotification(page);
  await requestPage.stateFilterButton.click();
  await requestPage.waitingMenuItem().uncheck();
  await requestPage.okButton.click();
  await expect(requestPage.tableBodyTextByText("CLOSED")).toBeVisible();
  await requestPage.editButton.click();
  await expect(requestPage.statusText("CLOSED")).toBeVisible();
});

test("Comment CRUD on edit page has succeeded", async ({ page, requestPage }) => {
  await requestPage.requestMenuItem.click();
  await expect(requestPage.tableBodyTextByText(requestTitle, true)).toBeVisible();
  await expect(requestPage.tableBodyTextByText("WAITING")).toBeVisible();
  await requestPage.editButton.click();

  await requestPage.commentTextbox.click();
  await requestPage.commentTextbox.fill("comment");
  await requestPage.commentButton.click();
  await closeNotification(page);
  await expect(requestPage.statusText("comment")).toBeVisible();
  await requestPage.editButton.click();
  await requestPage.commentTextboxWithText("comment").click();
  await requestPage.commentTextboxWithText("comment").fill("new comment");
  await requestPage.checkButton.click();
  await closeNotification(page);
  await expect(requestPage.getByText("new comment")).toBeVisible();
  await requestPage.deleteButton.click();
  await closeNotification(page);
  await expect(requestPage.getByText("new comment")).toBeHidden();
});

// eslint-disable-next-line playwright/expect-expect
test("Comment CRUD on Request page has succeeded", async ({ page, requestPage }) => {
  await requestPage.requestMenuItem.click();
  await requestPage.commentsCountButton("0").click();
  await crudComment(page);
});

test("Creating a new request and adding to request has succeeded", async ({ page, requestPage }) => {
  await requestPage.backButtonCapitalized.click();
  await requestPage.newItemButton.click();
  await requestPage.saveButton.click();
  await closeNotification(page);
  await requestPage.ellipsisButton.click();
  await requestPage.addToRequestButton.click();
  await requestPage.selectCheckbox.check();
  await requestPage.okButton.click();
  await closeNotification(page);
  await requestPage.requestMenuItem.click();
  await requestPage.editButton.click();
  await expect(requestPage.collapsedModelButton("e2e model name", 0)).toBeVisible();
  await expect(requestPage.collapsedModelButton("e2e model name", 1)).toBeVisible();
});

test("Navigating between item and request has succeeded", async ({ page, requestPage }) => {
  await requestPage.versionHistoryTab.click();
  await requestPage.requestTitleLink(requestTitle).click();
  await expect(requestPage.requestPageTitle(requestTitle)).toBeVisible();
  await expect(requestPage.requestHeading(requestTitle)).toBeVisible();
  await requestPage.approveButton.click();
  await closeNotification(page);
  await requestPage.itemTitleButton(itemTitle).click();
  await expect(requestPage.titleFieldInput(titleFieldName, "Title")).toHaveValue(itemTitle);
  await requestPage.titleFieldInput(titleFieldName, "Title").click();
  await requestPage.titleFieldInput(titleFieldName, "Title").clear();
  await requestPage.saveButton.click();
  await closeNotification(page);
  const itemId = page.url().split("/").at(-1) as string;
  await expect(requestPage.modelPathText(modelName, itemId)).toBeVisible();
  const newRequestTitle = "newRequestTitle";
  await createRequest(page, newRequestTitle);
  await requestPage.titleFieldInput(titleFieldName, "Title").click();
  await requestPage.titleFieldInput(titleFieldName, "Title").fill("newItemTitle");
  await requestPage.saveButton.click();
  await closeNotification(page);
  await requestPage.versionHistoryTab.click();
  await requestPage.requestTitleLink(requestTitle).click();
  await expect(
    requestPage.collapsedModelItemButton(modelName, itemId),
  ).toBeVisible();
});
