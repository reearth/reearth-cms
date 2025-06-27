import { Page } from "@playwright/test";

import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect } from "@reearth-cms/e2e/utils";
import { getId } from "@reearth-cms/e2e/utils/mock";

export async function createProject(page: Page) {
  const id = getId();
  await page.getByRole("button", { name: "plus New Project" }).first().click();
  await page.getByRole("dialog").locator("#name").fill(id);
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await page.getByText(id, { exact: true }).click();
  await expect(page.getByText(id).first()).toBeVisible();
}

export async function deleteProject(page: Page) {
  await page.getByText("Settings").first().click();
  await page.getByRole("button", { name: "Delete Project" }).click();
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
}
