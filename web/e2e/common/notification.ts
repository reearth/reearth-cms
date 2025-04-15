import { Page } from "@playwright/test";

import { expect } from "@reearth-cms/e2e/utils";

export async function closeNotification(page: Page, isSuccess = true) {
  const text = isSuccess ? "check-circle" : "close-circle";
  await expect(page.getByRole("alert").last().getByRole("img")).toHaveAttribute("aria-label", text);
  await page
    .locator(".ant-notification-notice")
    .last()
    .locator(".ant-notification-notice-close")
    .click();
  await expect(page.getByRole("alert").last()).toBeHidden();
}
