import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { Page, expect } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/utils/mock";

export async function createProject(page: Page) {
  const id = getId();
  await page.getByRole("button", { name: "plus New Project" }).first().click();
  await page.getByRole("dialog").locator("#name").fill(id);
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await page.getByText(id, { exact: true }).click();
  const projectName = page.locator(".ant-layout-header p").nth(2);
  await expect(projectName).toHaveText(id);
}

export async function deleteProject(page: Page) {
  await page.getByText("Settings").first().click();
  await page.getByRole("button", { name: "Delete Project" }).click();
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
}
