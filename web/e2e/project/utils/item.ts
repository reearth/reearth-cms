import { Page } from "@playwright/test";
import { closeNotification } from "@reearth-cms/e2e/common/notification";

export async function createRequest(page: Page, reviewerName: string, title: string) {
  await page.getByText("Content").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByRole("button", { name: "New Request" }).click();
  await page.getByLabel("Title").click();
  await page.getByLabel("Title").fill(title);
  await page.locator(".ant-select-selection-overflow").click();

  await page.getByTitle(reviewerName).locator("div").click();
  await page.locator(".ant-select-selection-overflow").click();
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
}
