import { type Page } from "@reearth-cms/e2e/fixtures/test";

export async function isCesiumViewerReady(
  page: Page,
  interval: number = process.env.CI ? 5000 : 2000,
  maxWaitTime = 120000,
): Promise<boolean> {
  const canvas = page.locator("canvas").first();
  const startTime = Date.now();
  let previous = await canvas.screenshot();
  let prevSig = previous.toString("base64");

  while (Date.now() - startTime < maxWaitTime) {
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(interval);
    const current = await canvas.screenshot();
    const currSig = current.toString("base64");
    if (currSig !== prevSig) {
      return true;
    }
    previous = current;
    prevSig = currSig;
  }

  return false;
}
