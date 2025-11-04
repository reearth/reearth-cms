import { chromium, expect, test as setup } from "@playwright/test";

import { baseURL, authFile } from "../../playwright.config";
import { config } from "../config/config";
import { LoginPage } from "../pages/login.page";
import { createIAPContext } from "../utils/iap/iap-auth";

const { userName, password } = config;

setup("authenticate", async () => {
  if (!userName || !password) {
    throw new Error("Missing required configuration: userName and password");
  }

  const browser = await chromium.launch({ headless: true });
  const context = await createIAPContext(browser, baseURL);
  const page = await context.newPage();

  try {
    await page.goto(baseURL, {
      waitUntil: "domcontentloaded",
    });

    await expect(page.getByRole("button").first()).toBeVisible();

    const isLoggedIn = await page
      .getByRole("button", { name: "New Project" })
      .first()
      .isVisible()
      .catch(() => false);

    if (!isLoggedIn) {
      const isNewAuth = await page.getByLabel("Email address").isVisible();

      if (isNewAuth) {
        await page.getByLabel("Email address").click();
        await page.getByLabel("Email address").fill(userName);
        await page.getByRole("button", { name: "Continue", exact: true }).click();
        await page.getByLabel("Password").click();
        await page.getByLabel("Password").fill(password);
        await page.getByRole("button", { name: "Continue", exact: true }).click();

        const withoutPasskeyButton = page.getByRole("button", {
          name: "Continue without passkeys",
        });
        if (await withoutPasskeyButton.isVisible()) {
          await withoutPasskeyButton.click();
        }
      } else {
        const loginPage = new LoginPage(page);
        await loginPage.login(userName, password);
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
