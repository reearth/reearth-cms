import { Page } from "@playwright/test";

import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect } from "@reearth-cms/e2e/utils";

export async function handleFieldForm(page: Page, name: string, key = name) {
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill(name);
  await page.getByLabel("Settings").locator("#key").click();
  await page.getByLabel("Settings").locator("#key").fill(key);
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByText(`${name}#${key}`)).toBeVisible();
  await closeNotification(page);
}

export const titleFieldName = "titleFieldName";
export const itemTitle = "itemTitle";

export async function createTitleField(page: Page) {
  await page.locator("li").filter({ hasText: "Text" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill(titleFieldName);
  await page.getByLabel("Use as title").check();
  await page.getByRole("tab", { name: "Default value" }).click();
  await page.getByLabel("Set default value").click();
  await page.getByLabel("Set default value").fill(itemTitle);
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
}
