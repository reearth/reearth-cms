import { type Locator, type Page, expect } from "@reearth-cms/e2e/fixtures/test";

export async function clickAndExpectSuccess(
  page: Page,
  clickTarget: Locator,
  maxRetries = 1,
): Promise<void> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    await clickTarget.click();
    try {
      await closeNotification(page, true);
      return;
    } catch (error) {
      const isTransient = String(error).includes("Failed to fetch");
      if (attempt < maxRetries && isTransient) {
        await page.waitForTimeout(2000);
        continue;
      }
      throw error;
    }
  }
}

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
      // Close the error notification before throwing — use dispatchEvent to bypass viewport/interception checks
      await errorNotice.locator(".ant-notification-notice-close").dispatchEvent("click").catch(() => {});
      throw new Error(`Expected success notification but got error: ${message}`);
    }

    await successNotice.locator(".ant-notification-notice-close").dispatchEvent("click");
    await successNotice.waitFor({ state: "detached", timeout: 10_000 });
  } else {
    await expect(errorNotice).toBeVisible({ timeout: 30_000 });
    await errorNotice.locator(".ant-notification-notice-close").dispatchEvent("click");
    await errorNotice.waitFor({ state: "detached", timeout: 10_000 });
  }
}
