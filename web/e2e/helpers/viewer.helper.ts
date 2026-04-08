import { type Page } from "@reearth-cms/e2e/fixtures/test";

/**
 * Checks whether the Cesium viewer has rendered content on its canvas.
 *
 * Uses a dual strategy:
 *  1. PNG file-size heuristic — a blank canvas compresses to a tiny PNG (<1 KB),
 *     while a rendered 3D scene produces a larger one (>5 KB).
 *  2. Frame-to-frame comparison — if two consecutive screenshots differ, the
 *     viewer is actively rendering.
 *
 * Returns `false` when the canvas never appears in the DOM (e.g. headless
 * Chromium without WebGL support), letting callers provide a fallback assertion.
 */
export async function isCesiumViewerReady(
  page: Page,
  interval: number = process.env.CI ? 5000 : 2000,
  maxWaitTime = 120000,
): Promise<boolean> {
  const canvas = page.locator("canvas").first();
  const startTime = Date.now();

  // Wait for the canvas to appear in the DOM. In headless mode without WebGL,
  // the Cesium viewer may never create one — bail out early.
  try {
    await canvas.waitFor({ state: "attached", timeout: 30000 });
  } catch {
    return false;
  }

  const snap = async (): Promise<Buffer | null> => {
    try {
      return await canvas.screenshot();
    } catch {
      return null;
    }
  };
  let prevBuf: Buffer | null = await snap();

  while (Date.now() - startTime < maxWaitTime) {
    await page.waitForTimeout(interval);
    const currBuf = await snap();
    if (!currBuf) {
      prevBuf = prevBuf ?? currBuf;
      continue;
    }

    // Primary: a rendered 3D scene produces a much larger PNG than a blank canvas
    if (currBuf.length > 5000) {
      return true;
    }

    // Secondary: frame-to-frame difference means the viewer is actively rendering
    if (prevBuf && !currBuf.equals(prevBuf)) {
      return true;
    }
    prevBuf = currBuf;
  }

  return false;
}
