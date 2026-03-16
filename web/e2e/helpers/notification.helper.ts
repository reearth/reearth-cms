import { type Page, expect } from "@reearth-cms/e2e/fixtures/test";

export async function closeNotification(page: Page, isSuccess = true) {
  const successNotice = page.locator(".ant-notification-notice").filter({
    has: page.locator('[aria-label="check-circle"]'),
  }).first();

  const errorNotice = page.locator(".ant-notification-notice").filter({
    has: page.locator('[aria-label="close-circle"]'),
  }).first();

  if (isSuccess) {
    // Race: wait for either success or error notification
    const result = await Promise.race([
      successNotice.waitFor({ state: "visible", timeout: 30_000 }).then(() => "success" as const),
      errorNotice.waitFor({ state: "visible", timeout: 30_000 }).then(() => "error" as const),
    ]);

    if (result === "error") {
      const message = await errorNotice.textContent().catch(() => "unknown error");
      // Close the error notification before throwing
      await errorNotice.locator(".ant-notification-notice-close").click().catch(() => {});
      throw new Error(`Expected success notification but got error: ${message}`);
    }

    await successNotice.locator(".ant-notification-notice-close").click();
    await successNotice.waitFor({ state: "detached", timeout: 10_000 });
  } else {
    await expect(errorNotice).toBeVisible({ timeout: 30_000 });
    await errorNotice.locator(".ant-notification-notice-close").click();
    await errorNotice.waitFor({ state: "detached", timeout: 10_000 });
  }
}
