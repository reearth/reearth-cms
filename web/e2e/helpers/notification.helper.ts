import { type Page, expect } from "@reearth-cms/e2e/fixtures/test";

export async function closeNotification(page: Page, isSuccess = true) {
  const text = isSuccess ? "check-circle" : "close-circle";

  // Wait for the notification to appear and verify its type
  const notification = page.getByRole("alert").last();
  await expect(notification.getByRole("img")).toHaveAttribute("aria-label", text, {
    timeout: 10000,
  });

  // Close button is a sibling of notification's parent in the DOM:
  //   div (notice) > div (content) > div[role=alert]
  //                > a[aria-label=Close]
  const closeButton = notification.locator("xpath=../..").locator('[aria-label="Close"]');
  try {
    await closeButton.click({ timeout: 3000 });
  } catch {
    // Notification already auto-closed — nothing left to dismiss
    return;
  }

  await expect(notification).toBeHidden({ timeout: 3000 });
}
