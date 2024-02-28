import { Page } from "@playwright/test";

import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect } from "@reearth-cms/e2e/utils";

export async function createProject(page: Page) {
  await page.getByRole("button", { name: "plus New Project" }).first().click();
  await page.getByRole("dialog").locator("#name").click();
  await page.getByRole("dialog").locator("#name").fill("e2e project name");
  await page.getByLabel("Project alias").click();
  await page.getByLabel("Project alias").fill("e2e-project-alias");
  await page.getByLabel("Project description").click();
  await page.getByLabel("Project description").fill("e2e project description");
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created project!");
  await closeNotification(page);
  await page.getByText("e2e project name", { exact: true }).click();
}

export async function deleteProject(page: Page) {
  await page.getByText("Settings").first().click();
  await page.getByRole("button", { name: "Delete Project" }).click();
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully deleted project!");
  await closeNotification(page);
}
