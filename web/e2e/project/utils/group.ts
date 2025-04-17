import { Page } from "@playwright/test";

import { closeNotification } from "@reearth-cms/e2e/common/notification";

export const groupName = "e2e group name";

export async function createGroup(page: Page, name = groupName, key?: string) {
  await page.getByRole("button", { name: "plus Add" }).last().click();
  await page.getByLabel("Group name").fill(name);
  if (key) {
    await page.getByLabel("Group key").fill(key);
  }
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
}

export async function updateGroup(page: Page, name: string, key?: string) {
  await page.getByRole("button", { name: "more" }).hover();
  await page.getByText("Edit", { exact: true }).click();
  await page.getByLabel("Update Group").locator("#name").fill(name);
  if (key) {
    await page.getByLabel("Update Group").locator("#key").fill(key);
  }
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
}

export async function deleteGroup(page: Page) {
  await page.getByRole("button", { name: "more" }).hover();
  await page.getByText("Delete").click();
  await page.getByRole("button", { name: "Delete Group" }).click();
  await closeNotification(page);
}
