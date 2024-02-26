import { Page } from "@playwright/test";

import { expect } from "@reearth-cms/e2e/utils";

export async function createProject(page: Page) {
  await page.getByRole("button", { name: "plus New Project" }).click();
  await page.getByLabel("Project name").click();
  await page.getByLabel("Project name").fill("e2e project name");
  await page.getByLabel("Project alias").click();
  await page.getByLabel("Project alias").fill("e2e-project-alias");
  await page.getByLabel("Project description").click();
  await page.getByLabel("Project description").fill("e2e project description");
  await page.getByRole("button", { name: "OK" }).click();
  await page.getByText("e2e project name", { exact: true }).click();
}

export async function deleteProject(page: Page) {
  await page.getByText("Settings").first().click();
  await page.getByRole("button", { name: "Delete Project" }).click();
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully deleted project!");
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
