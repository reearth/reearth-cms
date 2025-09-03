import type { Page } from "@playwright/test";

import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect } from "@reearth-cms/e2e/utils";

export const modelName = "e2e model name";

async function createModel(page: Page, name = modelName, key?: string) {
  await page.getByLabel("Model name").fill(name);
  if (key) {
    await page.getByLabel("Model key").fill(key);
  }
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
}

export async function createModelFromOverview(page: Page, name = modelName, key?: string) {
  const titleEl = page.locator(".ant-page-header-heading-title");
  await expect(titleEl).toHaveText("Models");
  await page.getByRole("button", { name: "plus New Model" }).first().click();
  await createModel(page, name, key);
}

export async function createModelFromSidebar(page: Page, name = modelName, key?: string) {
  await page.getByRole("button", { name: "plus Add" }).first().click();
  await createModel(page, name, key);
}

export async function updateModel(page: Page, name = "new e2e model name", key: string) {
  await page.getByRole("button", { name: "more" }).hover();
  await page.getByText("Edit", { exact: true }).click();
  await page.getByLabel("Update Model").locator("#name").fill(name);
  await page.getByLabel("Update Model").locator("#key").fill(key);
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
}

export async function deleteModel(page: Page) {
  await page.getByRole("button", { name: "more" }).hover();
  await page.getByText("Delete").click();
  await page.getByRole("button", { name: "Delete Model" }).click();
  await closeNotification(page);
}
