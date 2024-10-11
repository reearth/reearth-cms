import { Page } from "@playwright/test";

import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect } from "@reearth-cms/e2e/utils";

export async function createGroup(page: Page, name = "e2e group name", key = "e2e-group-key") {
  await page.getByText("Schema").first().click();
  await page.getByRole("button", { name: "plus Add" }).last().click();
  await page.getByLabel("New Group").locator("#name").click();
  await page.getByLabel("New Group").locator("#name").fill(name);
  await page.getByLabel("New Group").locator("#key").click();
  await page.getByLabel("New Group").locator("#key").fill(key);
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await expect(page.getByTitle(name, { exact: true })).toBeVisible();
  await expect(page.getByText(`#${key}`)).toBeVisible();
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
  await closeNotification(page);
  await expect(page.getByTitle(updateGroupName)).toBeVisible();
  await expect(page.getByText("#new-e2e-group-key")).toBeVisible();
  await expect(page.getByRole("menuitem", { name: updateGroupName }).locator("span")).toBeVisible();
}

async function deleteGroup(page: Page) {
  await page.getByRole("button", { name: "more" }).hover();
  await page.getByText("Delete").click();
  await page.getByRole("button", { name: "Delete Group" }).click();
  await closeNotification(page);
  await expect(page.getByTitle(updateGroupName)).toBeHidden();
}

export async function crudGroup(page: Page) {
  await createGroup(page);
  await updateGroup(page);
  await deleteGroup(page);
}
