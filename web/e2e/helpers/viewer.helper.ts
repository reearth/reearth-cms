import { type Page } from "@reearth-cms/e2e/fixtures/test";

export async function isCesiumViewerReady(
  page: Page,
  interval: number = process.env.CI ? 5000 : 2000,
  maxWaitTime = 120000,
): Promise<boolean> {
  const canvas = page.locator("canvas").first();
  const startTime = Date.now();
  const snap = async (): Promise<string | null> => {
    try {
      await canvas.waitFor({ state: "visible", timeout: 15000 });
      const buf = await canvas.screenshot();
      return buf.toString("base64");
    } catch {
      return null;
    }
  };
  let prevSig: string | null = await snap();

  while (Date.now() - startTime < maxWaitTime) {
    await page.waitForTimeout(interval);
    const currSig = await snap();
    if (!prevSig || !currSig) {
      prevSig = currSig ?? prevSig;
      continue;
    }
    if (currSig !== prevSig) {
      return true;
    }
    prevSig = currSig;
  }

  return false;
}
