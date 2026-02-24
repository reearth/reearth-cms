import { type Page, expect } from "@reearth-cms/e2e/fixtures/test";

export async function closeNotification(page: Page, isSuccess = true) {
  const text = isSuccess ? "check-circle" : "close-circle";

  // Wait for the notification to appear and verify its type
  const notification = page.getByRole("alert").last();
  await expect(notification.getByRole("img")).toHaveAttribute("aria-label", text, {
    timeout: 10000,
  });

  // Click the close button. Ant Design (rc-notification) renders it as
  // <a aria-label="Close">, not <button>, so getByRole("button") won't match.
  const closeButton = notification.locator('[aria-label="Close"]');
  try {
    await closeButton.click({ timeout: 3000 });
  } catch {
    // Notification may have auto-closed before we could click
  }

  // Move mouse away from notifications — Playwright's click hovers over the
  // notification, which pauses Ant Design's auto-close timer. Moving the mouse
  // ensures all remaining notifications resume their 2s auto-close countdown.
  await page.mouse.move(0, 0);

  // Wait for the notification to be hidden. If stacking, .last() shifts to
  // remaining notifications which will auto-close (mouse is no longer hovering).
  await expect(notification).toBeHidden({ timeout: 10000 });

  // Wait for any pending network requests to complete
  await page.waitForLoadState("domcontentloaded");
}
