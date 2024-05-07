import { Page } from "@playwright/test";

import { closeNotification } from "@reearth-cms/e2e/common/notification";

export async function createWorkspace(page: Page) {
  await page.getByRole("button", { name: "Create a Workspace" }).click();
  await page.getByLabel("Workspace name").click();
  await page.getByLabel("Workspace name").fill("e2e workspace name");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
}

export async function deleteWorkspace(page: Page) {
  await page.getByText("Workspace", { exact: true }).click();
  await page.getByRole("button", { name: "Remove Workspace" }).click();
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
}
