import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { type Page } from "@reearth-cms/e2e/fixtures/test";

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

  await page.click(".ant-select-selector");
  const firstItem = page.locator(".ant-select-item").first();
  await firstItem.click();

  await page.getByLabel("Description").click();
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
}
