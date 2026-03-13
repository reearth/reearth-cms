import { ConfigProvider } from "antd";
import { I18nextProvider } from "react-i18next";
import { page } from "@vitest/browser/context";

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
 * Render a component wrapped in a data-testid div, returning a locator
 * suitable for screenshot comparison.
 */
export function getScreenshotLocator(testId = DATA_TEST_ID.VRT__Root) {
  return page.getByTestId(testId);
}
