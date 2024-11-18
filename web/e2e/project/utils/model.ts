import { Page } from "@playwright/test";

import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect } from "@reearth-cms/e2e/utils";

export const modelName = "e2e model name";

export async function createModel(page: Page, name = modelName, key = "e2e-model-key") {
  await page.getByText("Schema").first().click();
  await page.getByRole("button", { name: "plus Add" }).first().click();
  await page.getByLabel("Model name").click();
  await page.getByLabel("Model name").fill(name);
  await page.getByLabel("Model key").click();
  await page.getByLabel("Model key").fill(key);
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await expect(page.getByTitle(name, { exact: true })).toBeVisible();
  await expect(page.getByText(`#${key}`)).toBeVisible();
  await expect(page.getByRole("menuitem", { name }).locator("span")).toBeVisible();
}

const updateModelName = "new e2e model name";

async function updateModel(page: Page) {
  await page.getByRole("button", { name: "more" }).hover();
  await page.getByText("Edit", { exact: true }).click();
  await page.getByLabel("Update Model").locator("#name").click();
  await page.getByLabel("Update Model").locator("#name").fill(updateModelName);
  await page.getByLabel("Update Model").locator("#key").click();
  await page.getByLabel("Update Model").locator("#key").fill("new-e2e-model-key");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await expect(page.getByTitle(updateModelName)).toBeVisible();
  await expect(page.getByText("#new-e2e-model-key")).toBeVisible();
  await expect(page.getByRole("menuitem", { name: updateModelName }).locator("span")).toBeVisible();
}

async function deleteModel(page: Page) {
  await page.getByRole("button", { name: "more" }).hover();
  await page.getByText("Delete").click();
  await page.getByRole("button", { name: "Delete Model" }).click();
  await closeNotification(page);
  await expect(page.getByTitle(updateModelName)).toBeHidden();
}

export async function crudModel(page: Page) {
  await createModel(page);
  await updateModel(page);
  await deleteModel(page);
}
