import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { type Page, type Reearth, expect } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/utils/mock";

export async function createProject(page: Page, manualId?: string) {
  const id = getId();
  const projectName = manualId || id;
  await page.getByRole("button", { name: "plus New Project" }).first().click();
  await page.getByRole("dialog").locator("#name").fill(projectName);
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await page.getByText(projectName, { exact: true }).click();
  const projectNameEl = page.locator(".ant-layout-header p").nth(2);
  await expect(projectNameEl).toHaveText(projectName);
}

export async function deleteProject(page: Page, reearth?: Reearth, manualId?: string) {
  if (manualId && reearth) {
    await reearth.goto("/", { waitUntil: "domcontentloaded" });
    await page.getByText(manualId, { exact: true }).click();
  }

  await page.getByText("Settings").first().click();
  await page.getByRole("button", { name: "Delete Project" }).click();
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
}
