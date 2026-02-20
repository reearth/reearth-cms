import { type Page, expect } from "@reearth-cms/e2e/fixtures/test";

export async function closeNotification(page: Page, isSuccess = true) {
  const text = isSuccess ? "check-circle" : "close-circle";

  // Wait for the notification to appear and verify its type
  const notification = page.getByRole("alert").last();
  await expect(notification.getByRole("img")).toHaveAttribute("aria-label", text, {
    timeout: 10000,
  });

  // Find and click the close button using ARIA-scoped selector
  const closeButton = notification.getByRole("button", { name: "Close" });
  await closeButton.click();

  // Wait for the notification to be hidden
  await expect(notification).toBeHidden();

  // Wait for any pending network requests to complete, but with a shorter timeout
  // This helps ensure state is saved before moving to next action
  await page.waitForLoadState("domcontentloaded");
}
