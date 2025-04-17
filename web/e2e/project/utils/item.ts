import { Page } from "@playwright/test";

import { closeNotification } from "@reearth-cms/e2e/common/notification";

export const requestTitle = "requestTitle";

export async function createItem(page: Page) {
  await page.getByText("Content").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
}

export async function createRequest(page: Page, title = requestTitle) {
  await page.getByRole("button", { name: "ellipsis" }).click();
  await page.getByRole("menuitem", { name: "New Request" }).click();
  await page.getByLabel("Title").last().click();
  await page.getByLabel("Title").last().fill(title);
  await page.locator(".ant-select-selection-overflow").click();
  const reviewerName = await page
    .locator("a")
    .nth(1)
    .locator("div")
    .nth(2)
    .locator("p")
    .innerText();
  await page.getByTitle(reviewerName).locator("div").click();
  await page.getByLabel("Description").click();
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
}
