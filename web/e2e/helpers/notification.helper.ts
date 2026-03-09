import { type Page, expect } from "@reearth-cms/e2e/fixtures/test";

export async function closeNotification(page: Page, isSuccess = true) {
  const text = isSuccess ? "check-circle" : "close-circle";

  // Single locator chain: find notification with the expected icon
  const notice = page.locator(".ant-notification-notice").filter({
    has: page.locator(`[aria-label="${text}"]`),
  }).first();

  await expect(notice).toBeVisible({ timeout: 15_000 });

  // Close button within the SAME notification element
  await notice.locator(".ant-notification-notice-close").click();

  // Wait for node removal (ant-design removes, not hides)
  await notice.waitFor({ state: "detached", timeout: 10_000 });
}
