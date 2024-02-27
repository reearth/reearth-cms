import { Page } from "@playwright/test";

import { expect } from "@reearth-cms/e2e/utils";

async function createGroup(page: Page) {
  await page.getByText("Schema").click();
  await page.getByRole("button", { name: "plus Add" }).last().click();
  await page.getByLabel("Group name").click();
  await page.getByLabel("Group name").fill("e2e group name");
  await page.getByLabel("Group key").click();
  await page.getByLabel("Group key").fill("e2e-group-key");
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created group!");
  await page.getByText("e2e group name").click();
  await expect(page.getByTitle("e2e group name")).toBeVisible();
  await expect(page.getByText("#e2e-group-key")).toBeVisible();
}

const updateGroupName = "new e2e group name";

async function updateGroup(page: Page) {
  await page.getByRole("button", { name: "more" }).hover();
  await page.getByText("Edit", { exact: true }).click();
  await page.getByLabel("Update Group").locator("#name").click();
  await page.getByLabel("Update Group").locator("#name").fill(updateGroupName);
  await page.getByLabel("Update Group").locator("#key").click();
  await page.getByLabel("Update Group").locator("#key").fill("new-e2e-group-key");
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated group!");
  await expect(page.getByTitle(updateGroupName)).toBeVisible();
  await expect(page.getByText("#new-e2e-group-key")).toBeVisible();
  await expect(page.getByRole("menuitem", { name: updateGroupName }).locator("span")).toBeVisible();
}

async function deleteGroup(page: Page) {
  await page.getByRole("button", { name: "more" }).hover();
  await page.getByText("Delete").click();
  await page.getByRole("button", { name: "Delete Group" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully deleted group!");
  await expect(page.getByTitle(updateGroupName)).not.toBeVisible();
}

export async function crudGroup(page: Page) {
  await createGroup(page);
  await updateGroup(page);
  await deleteGroup(page);
}

async function createComment(page: Page) {
  await page.locator("#content").click();
  await page.locator("#content").fill("comment");
  await page.getByRole("button", { name: "Comment" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created comment!");
  await expect(page.getByRole("main")).toContainText("comment");
}

async function updateComment(page: Page) {
  await page.getByRole("main").getByRole("complementary").getByLabel("edit").locator("svg").click();
  await page.locator("textarea").filter({ hasText: "comment" }).click();
  await page.locator("textarea").filter({ hasText: "comment" }).fill("new comment");
  await page.getByLabel("check").locator("svg").first().click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated comment!");
  await expect(page.getByRole("main")).toContainText("new comment");
}

async function deleteComment(page: Page) {
  await page.getByLabel("delete").locator("svg").click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully deleted comment!");
  await expect(page.getByRole("main")).not.toContainText("new comment");
}

export async function crudComment(page: Page) {
  await createComment(page);
  await updateComment(page);
  await deleteComment(page);
}
