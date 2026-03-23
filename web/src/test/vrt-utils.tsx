import { page } from "@vitest/browser/context";
import { ConfigProvider } from "antd";
import { I18nextProvider } from "react-i18next";
import { expect } from "vitest";

import i18n from "@reearth-cms/i18n/i18n";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";

export const VRTWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <I18nextProvider i18n={i18n}>
      <ConfigProvider>{children}</ConfigProvider>
    </I18nextProvider>
  );
};

/**
 * Assert that the VRT root element matches its baseline screenshot,
 * with tolerance for minor sub-pixel rendering differences across runs.
 */
export async function expectScreenshot(testId = DATA_TEST_ID.VRT__Root) {
  // @ts-expect-error -- vitest's Promisify mapped type drops the (options?) overload of
  // toMatchScreenshot, leaving only (name: string, options?). The call works at runtime.
  await expect.element(page.getByTestId(testId)).toMatchScreenshot({
    comparatorOptions: {
      allowedMismatchedPixelRatio: 0.05,
      allowedMismatchedPixels: 3000,
    },
  });
}

/**
 * Render a component wrapped in a data-testid div, returning a locator
 * suitable for screenshot comparison.
 */
export function getScreenshotLocator(testId = DATA_TEST_ID.VRT__Root) {
  return page.getByTestId(testId);
}
