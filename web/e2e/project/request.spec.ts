import { Page } from "@playwright/test";

import { expect, test } from "@reearth-cms/e2e/utils";

import {
  createWorkspace,
  deleteWorkspace,
  createProject,
  deleteProject,
  createModel,
  crudComment,
} from "./utils";

const requestTitle = "title";

async function createRequest(page: Page, reviewerName: string) {
  await page.getByText("Content").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created Item!");
  await page.getByRole("button", { name: "New Request" }).click();
  await page.getByLabel("Title").click();
  await page.getByLabel("Title").fill(requestTitle);
  await page.locator(".ant-select-selection-overflow").click();

  await page.getByTitle(reviewerName).locator("div").click();
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created request!");
}

test("Request creating, searching, updating reviewer, and approving has succeeded", async ({
  reearth,
  page,
}) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  const username = await page.locator("a").nth(1).locator("div").nth(2).locator("p").innerText();

  await createWorkspace(page);
  await createProject(page);
  await createModel(page);
  await createRequest(page, username);

  await page.getByText("Request", { exact: true }).click();
  await expect(page.getByText(requestTitle, { exact: true })).toBeVisible();
  await expect(page.getByText("WAITING")).toBeVisible();
  await page.getByPlaceholder("Please enter").click();
  await page.getByPlaceholder("Please enter").fill("no request");
  await page.getByRole("button", { name: "search" }).click();
  await expect(page.getByText(requestTitle, { exact: true })).not.toBeVisible();
  await expect(page.getByText("WAITING")).not.toBeVisible();
  await page.getByPlaceholder("Please enter").fill("");
  await page.getByRole("button", { name: "search" }).click();
  await expect(page.getByText(requestTitle, { exact: true })).toBeVisible();
  await expect(page.getByText("WAITING")).toBeVisible();

  await page.getByRole("button", { name: "edit" }).click();
  await page.getByRole("button", { name: "Assign to" }).click();
  await page.getByLabel("close-circle").locator("svg").click();
  await page.locator(".ant-select-selection-overflow").click();
  await page.getByText(username).nth(3).click();
  await page.getByRole("heading", { name: "Reviewer" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated request!");
  await page.getByRole("button", { name: "Approve" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully approved request!");
  await expect(page.getByText(requestTitle, { exact: true })).not.toBeVisible();
  await page.getByRole("cell", { name: "State filter" }).getByRole("button").click();
  await page.getByRole("menuitem", { name: "WAITING" }).getByLabel("").uncheck();
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByText("title", { exact: true })).toBeVisible();
  await expect(page.locator("tbody").getByText("APPROVED")).toBeVisible();

  await deleteProject(page);
  await deleteWorkspace(page);
});

test("Request closing and reopening has succeeded", async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  const username = await page.locator("a").nth(1).locator("div").nth(2).locator("p").innerText();

  await createWorkspace(page);
  await createProject(page);
  await createModel(page);
  await createRequest(page, username);

  await page.getByText("Request", { exact: true }).click();
  await expect(page.getByText(requestTitle, { exact: true })).toBeVisible();
  await expect(page.getByText("WAITING")).toBeVisible();
  await page.getByRole("button", { name: "edit" }).click();

  await page.getByRole("button", { name: "Close" }).click();
  await expect(page.getByRole("alert").last()).toContainText(
    "One or more requests were successfully closed!",
  );
  await expect(page.getByText(requestTitle, { exact: true })).not.toBeVisible();
  await expect(page.getByText("WAITING")).not.toBeVisible();

  await page.getByRole("cell", { name: "State filter" }).getByRole("button").click();
  await page.getByRole("menuitem", { name: "WAITING" }).getByLabel("").uncheck();
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.locator("tbody").getByText("CLOSED")).toBeVisible();
  await page.getByRole("button", { name: "edit" }).click();
  await expect(page.getByText("CLOSED", { exact: true })).toBeVisible();
  await expect(page.getByText("Closed", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Reopen" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated request!");
  await page.getByLabel("Back").click();
  await expect(page.getByText("title", { exact: true })).toBeVisible();
  await expect(page.getByText("WAITING")).toBeVisible();
  await page.getByLabel("", { exact: true }).check();
  await page.getByText("Close").click();
  await expect(page.getByRole("alert").last()).toContainText(
    "One or more requests were successfully closed!",
  );
  await page.getByRole("cell", { name: "State filter" }).getByRole("button").click();
  await page.getByRole("menuitem", { name: "WAITING" }).getByLabel("").uncheck();
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.locator("tbody").getByText("CLOSED")).toBeVisible();
  await page.getByRole("button", { name: "edit" }).click();
  await expect(page.getByText("CLOSED", { exact: true })).toBeVisible();

  await deleteProject(page);
  await deleteWorkspace(page);
});

test("Comment CRUD on edit page has succeeded", async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  const username = await page.locator("a").nth(1).locator("div").nth(2).locator("p").innerText();

  await createWorkspace(page);
  await createProject(page);
  await createModel(page);
  await createRequest(page, username);

  await page.getByText("Request", { exact: true }).click();
  await expect(page.getByText(requestTitle, { exact: true })).toBeVisible();
  await expect(page.getByText("WAITING")).toBeVisible();
  await page.getByRole("button", { name: "edit" }).click();

  await page.locator("#content").click();
  await page.locator("#content").fill("comment");
  await page.getByRole("button", { name: "Comment" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created comment!");
  await expect(page.getByText("comment").nth(1)).toBeVisible();
  await page.getByLabel("edit").locator("svg").click();
  await page.locator("textarea").filter({ hasText: "comment" }).click();
  await page.locator("textarea").filter({ hasText: "comment" }).fill("new comment");
  await page.getByLabel("check").locator("svg").first().click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated comment!");
  await expect(page.getByText("new comment").nth(1)).toBeVisible();
  await page.getByLabel("delete").locator("svg").click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully deleted comment!");
  await expect(page.getByText("new comment").nth(1)).not.toBeVisible();

  await deleteProject(page);
  await deleteWorkspace(page);
});

test("Comment CRUD on Request page has succeeded", async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  const username = await page.locator("a").nth(1).locator("div").nth(2).locator("p").innerText();

  await createWorkspace(page);
  await createProject(page);
  await createModel(page);
  await createRequest(page, username);

  await page.getByText("Request", { exact: true }).click();
  await page.getByRole("button", { name: "0" }).click();
  await expect(page.getByText("CommentsNo comments.Comment")).toBeVisible();

  await crudComment(page);

  await deleteProject(page);
  await deleteWorkspace(page);
});
