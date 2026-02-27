import { chromium, expect, TAG, test } from "@reearth-cms/e2e/fixtures/test";

import { baseURL, authFile } from "../../playwright.config";
import { config } from "../config/config";
import { LoginPage } from "../pages/login.page";
import { createIAPContext } from "../utils/iap/iap-auth";

const { userName, password } = config;

test("authenticate", { tag: TAG.SMOKE }, async () => {
  expect(userName).toBeTruthy();
  expect(password).toBeTruthy();

  const browser = await chromium.launch({ headless: true });
  const context = await createIAPContext(browser, baseURL);
  const page = await context.newPage();

  try {
    await page.goto(baseURL, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("button").first()).toBeVisible();

    const isLoggedIn = await page
      .getByRole("button", { name: "New Project" })
      .first()
      .isVisible()
      .catch(() => false);

    if (!isLoggedIn) {
      const loginPage = new LoginPage(page);
      const isNewAuth = await loginPage.auth0EmailInput.isVisible();
      if (isNewAuth) {
        // Auth0 login flow
        await loginPage.loginWithAuth0(userName as string, password as string);
      } else {
        // Custom login flow
        await loginPage.login(userName as string, password as string);
      }

      await page.waitForURL(baseURL, { timeout: 30 * 1000 });
      await expect(page.getByRole("button", { name: "New Project" }).first()).toBeVisible({
        timeout: 10 * 1000,
      });
    }

    await context.storageState({ path: authFile });
  } catch (error) {
    console.error("Authentication setup failed:", error);
    throw error;
  } finally {
    await page.close();
    await context.close();
    await browser.close();
  }
});
