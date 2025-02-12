/* eslint-disable playwright/expect-expect */

/**
 * End-to-end tests for Authentication functionality in the CMS.
 * Tests the basic authentication operations including logout functionality.
 * Verifies proper authentication state handling and UI updates.
 */

import { expect, test } from "@reearth-cms/e2e/utils";

/**
 * Tests the logout functionality
 * Verifies that:
 * - User can successfully trigger logout
 * - System properly clears authentication
 * - UI updates to show login screen
 */
test("Logout has succeeded", async ({ reearth, page }) => {
  // Navigate to the home page
  await reearth.goto("/", { waitUntil: "domcontentloaded" });

  // Click the user menu dropdown
  await page.locator("a").nth(1).click();

  // Click the logout option
  await page.getByText("Logout").click();

  // Verify redirect to login page
  await expect(page.getByLabel("Log In")).toBeVisible();
});
