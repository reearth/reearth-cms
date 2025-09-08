import { test, expect } from "@reearth-cms/e2e/fixtures/test";
import { parseConfigBoolean } from "@reearth-cms/utils/format";

import { closeNotification } from "../common/notification";
import { config } from "../utils/config";

import { crudComment } from "./utils/comment";
import { createTitleField, itemTitle, titleFieldName } from "./utils/field";
import { createItem, createRequest, requestTitle } from "./utils/item";
import { createModelFromOverview, modelName } from "./utils/model";
import { createProject, deleteProject } from "./utils/project";
import { createWorkspace, deleteWorkspace } from "./utils/workspace";

const disableWorkspaceUI = parseConfigBoolean(config.disableWorkspaceUi);

test.beforeEach(async ({ reearth, page }) => {
  // eslint-disable-next-line playwright/no-skipped-test
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
  // eslint-disable-next-line playwright/no-skipped-test
  test.skip(disableWorkspaceUI, "Workspace UI is disabled in this configuration");

  await deleteProject(page);
  await deleteWorkspace(page);
});

test("Request creating, searching, updating reviewer, and approving has succeeded", async ({
  requestPage,
}) => {
  // Navigate to requests and verify initial state
  await requestPage.navigateToRequests();
  await expect(requestPage.locator("tbody").getByText(requestTitle, { exact: true })).toBeVisible();
  await expect(requestPage.locator("tbody").getByText("WAITING")).toBeVisible();

  // Test search functionality
  await requestPage.searchRequests("no request");
  await expect(requestPage.locator("tbody").getByText(requestTitle, { exact: true })).toBeHidden();

  await expect(requestPage.locator("tbody").getByText("WAITING")).toBeHidden();

  await requestPage.clearSearch();
  await expect(requestPage.locator("tbody").getByText(requestTitle, { exact: true })).toBeVisible();
  await expect(requestPage.locator("tbody").getByText("WAITING")).toBeVisible();

  // Edit request and assign reviewer
  await requestPage.editRequest();
  await requestPage.assignReviewer();
  await requestPage.approveRequest();
  await requestPage.goBack();

  // Verify approval and filter
  await expect(requestPage.locator("tbody").getByText(requestTitle, { exact: true })).toBeHidden();
  await requestPage.filterByState("WAITING", false);
  await expect(requestPage.locator("tbody").getByText(requestTitle, { exact: true })).toBeVisible();
  await expect(requestPage.locator("tbody").getByText("APPROVED")).toBeVisible();
});

test("Request closing and reopening has succeeded", async ({ requestPage }) => {
  // Navigate and verify initial state
  await requestPage.navigateToRequests();
  await expect(requestPage.locator("tbody").getByText(requestTitle, { exact: true })).toBeVisible();
  await expect(requestPage.locator("tbody").getByText("WAITING")).toBeVisible();

  // Close request
  await requestPage.editRequest();
  await requestPage.closeRequest();
  await requestPage.goBack();

  // Verify request is hidden after close
  await expect(requestPage.locator("tbody").getByText(requestTitle, { exact: true })).toBeHidden();
  await expect(requestPage.locator("tbody").getByText("WAITING")).toBeHidden();

  // Filter to show closed requests
  await requestPage.filterByState("WAITING", false);
  await expect(requestPage.locator("tbody").getByText("CLOSED")).toBeVisible();

  // Reopen request
  await requestPage.editRequest();
  await expect(requestPage.getByText("CLOSED", { exact: true })).toBeVisible();

  await expect(requestPage.getByText("Closed", { exact: true })).toBeVisible();

  await requestPage.reopenRequest();
  await requestPage.goBack();

  // Verify request is reopened
  await expect(requestPage.locator("tbody").getByText(requestTitle, { exact: true })).toBeVisible();
  await expect(requestPage.locator("tbody").getByText(requestTitle, { exact: true })).toHaveText(
    "WAITING",
  );

  // Bulk close request
  await requestPage.selectRequestItem();
  await requestPage.bulkCloseRequests();

  // Verify bulk close worked
  await requestPage.filterByState("WAITING", false);
  await expect(requestPage.locator("tbody").getByText("CLOSED")).toBeVisible();
  await requestPage.editRequest();
  await expect(requestPage.getByText("CLOSED", { exact: true })).toBeVisible();
});

test("Comment CRUD on edit page has succeeded", async ({ requestPage }) => {
  // Navigate and edit request
  await requestPage.navigateToRequests();
  await expect(requestPage.locator("tbody").getByText(requestTitle, { exact: true })).toBeVisible();
  await expect(requestPage.locator("tbody").getByText(requestTitle, { exact: true })).toHaveText(
    "WAITING",
  );
  await requestPage.editRequest();

  // Add comment
  await requestPage.addComment("comment");
  await expect(requestPage.getByText("comment", { exact: true })).toBeVisible();

  // Edit comment
  await requestPage.editComment("new comment");
  await expect(requestPage.getByText("new comment", { exact: true })).toBeVisible();

  // Delete comment
  await requestPage.deleteComment();
  await expect(requestPage.getByText("new comment")).toBeHidden();
});

// eslint-disable-next-line playwright/expect-expect
test("Comment CRUD on Request page has succeeded", async ({ requestPage }) => {
  await requestPage.navigateToRequests();
  await requestPage.clickCommentsButton();
  await crudComment(requestPage.page);
});

test("Creating a new request and adding to request has succeeded", async ({ page }) => {
  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByRole("button", { name: "ellipsis" }).click();
  await page.getByText("Add to Request").click();
  await page.getByLabel("", { exact: true }).check();
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await page.getByText("Request", { exact: true }).click();
  await page.getByLabel("edit").locator("svg").click();
  await expect(page.getByRole("button", { name: "collapsed e2e model name" }).nth(0)).toBeVisible();
  await expect(page.getByRole("button", { name: "collapsed e2e model name" }).nth(1)).toBeVisible();
});

test("Navigating between item and request has succeeded", async ({ page }) => {
  await page.getByRole("tab", { name: "Version History" }).click();
  await page.getByRole("link", { name: requestTitle }).click();
  await expect(page.getByText(`Request / ${requestTitle}`)).toBeVisible();
  await expect(page.getByRole("heading", { name: requestTitle })).toBeVisible();
  await page.getByRole("button", { name: "Approve" }).click();
  await closeNotification(page);
  await page.getByRole("button", { name: itemTitle }).last().click();
  await expect(page.getByLabel(`${titleFieldName}Title`)).toHaveValue(itemTitle);
  await page.getByLabel(`${titleFieldName}Title`).click();
  await page.getByLabel(`${titleFieldName}Title`).clear();
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  const itemId = page.url().split("/").at(-1);
  await expect(page.getByText(`${modelName} / ${itemId}`)).toBeVisible();
  const newRequestTitle = "newRequestTitle";
  await createRequest(page, newRequestTitle);
  await page.getByLabel(`${titleFieldName}Title`).click();
  await page.getByLabel(`${titleFieldName}Title`).fill("newItemTitle");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByRole("tab", { name: "Version History" }).click();
  await page.getByRole("link", { name: requestTitle }).click();
  await expect(
    page.getByRole("button", { name: `collapsed ${modelName} / ${itemId}` }),
  ).toBeVisible();
});
