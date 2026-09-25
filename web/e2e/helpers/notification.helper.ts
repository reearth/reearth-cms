import { expect } from "@reearth-cms/e2e/fixtures/test";
import type { Locator, Page } from "@reearth-cms/e2e/fixtures/test";

import { waitForGraphQL } from "./graphql.helper";

export async function clickAndExpectSuccess(
  page: Page,
  clickTarget: Locator,
  maxRetries = 2,
): Promise<void> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Capture current notification count BEFORE clicking so closeNotification
      // can wait for a genuinely new notice rather than resolving on a stale one.
      const initialNoticeCount = await page.locator(".ant-notification-notice").count();
      // Start watching for notification BEFORE clicking to avoid race
      // with the 2s auto-dismiss
      const notificationPromise = closeNotification(page, true, initialNoticeCount);
      await waitForGraphQL(page, () => clickTarget.click());
      await notificationPromise;
      return;
    } catch (error) {
      const isTransient = String(error).includes("Failed to fetch");
      if (attempt < maxRetries && isTransient) {
        await page.waitForTimeout(2_000 * Math.pow(2, attempt));
        continue;
      }
      throw error;
    }
  }
}

export async function closeNotification(page: Page, isSuccess = true, initialNoticeCount?: number) {
  // If an initial count is provided, wait for a new notification to appear
  // (count must exceed the baseline) before proceeding. This prevents
  // Promise.race from resolving immediately against a stale notice from a
  // prior action when called via clickAndExpectSuccess.
  if (initialNoticeCount !== undefined) {
    await page.waitForFunction(
      (count: number) => document.querySelectorAll(".ant-notification-notice").length > count,
      initialNoticeCount,
      { timeout: 10_000 },
    );
  }

  const successNotice = page
    .locator(".ant-notification-notice")
    .filter({
      has: page.locator('[aria-label="check-circle"]'),
    })
    .last();

  const errorNotice = page
    .locator(".ant-notification-notice")
    .filter({
      has: page.locator('[aria-label="close-circle"]'),
    })
    .last();

  if (isSuccess) {
    // Race: wait for either success or error notification
    const result = await Promise.race([
      successNotice.waitFor({ state: "visible", timeout: 10_000 }).then(() => "success" as const),
      errorNotice.waitFor({ state: "visible", timeout: 10_000 }).then(() => "error" as const),
    ]);

    if (result === "error") {
      const message = await errorNotice.textContent().catch(() => "unknown error");
      // Close the error notification before throwing — use dispatchEvent to bypass viewport/interception checks
      await errorNotice
        .locator(".ant-notification-notice-close")
        .dispatchEvent("click")
        .catch(() => {});
      throw new Error(`Expected success notification but got error: ${message}`);
    }

    await successNotice.locator(".ant-notification-notice-close").dispatchEvent("click");
    await successNotice.waitFor({ state: "detached", timeout: 10_000 });
  } else {
    await expect(errorNotice).toBeVisible({ timeout: 10_000 });
    await errorNotice.locator(".ant-notification-notice-close").dispatchEvent("click");
    await errorNotice.waitFor({ state: "detached", timeout: 10_000 });
  }
}

/**
 * Close every notification currently on screen, whatever its type.
 *
 * `closeNotification` only ever targets success/error notices (it filters on the
 * check-circle / close-circle icons), so `warning` notices are left behind. antd
 * renders them top-right and stacks them, where they sit on top of the sidebar
 * and header controls and swallow pointer events — the usual cause of a 60s
 * `locator.click` timeout during cleanup.
 */
export async function dismissAllNotifications(page: Page): Promise<void> {
  const notices = page.locator(".ant-notification-notice");
  const closeButtons = await notices.locator(".ant-notification-notice-close").all();

  for (const closeButton of closeButtons) {
    // dispatchEvent bypasses the actionability checks a real click would run —
    // these notices are precisely the thing intercepting pointer events.
    await closeButton.dispatchEvent("click").catch(() => {});
  }

  await notices.first().waitFor({ state: "detached", timeout: 5_000 }).catch(() => {});
}
