import { Page } from "@playwright/test";

import { expect } from "@reearth-cms/e2e/utils";

export async function closeNotification(page: Page, isSuccess = true) {
  const text = isSuccess ? /successfully|成功/i : "input: ";
  await expect(page.getByRole("alert").last()).toContainText(text);
  await page
    .locator(".ant-notification-notice")
    .last()
    .locator(".ant-notification-notice-close")
    .click();
}
