import { webkit, expect, FullConfig } from "@playwright/test";

import { authFile, baseURL } from "../playwright.config";

import { config } from "./config/config";
import { LoginPage } from "./pages/login.page";
import { createIAPContext } from "./utils/iap/iap-auth";

const { userName, password } = config;

async function globalSetup(_config: FullConfig) {
  if (!userName || !password) {
    throw new Error("Missing required configuration: userName and password in config");
  }

  console.log("Setting up authentication...");

  const browser = await webkit.launch({ headless: true });
  const context = await createIAPContext(browser, baseURL);
  const page = await context.newPage();

  try {
    // Navigate to the login page
    await page.goto(baseURL, {
      waitUntil: "domcontentloaded",
    });

    // Wait for the page to be ready
    await expect(page.getByRole("button").first()).toBeVisible();

    // Check if already logged in by looking for "New Project" button
    const isLoggedIn = await page
      .getByRole("button", { name: "New Project" })
      .first()
      .isVisible()
      .catch(() => false);

    if (!isLoggedIn) {
      // Perform login using LoginPage
      const loginPage = new LoginPage(page);
      await loginPage.login(userName, password);

      // Wait for successful login - should redirect to base URL
      await page.waitForURL(baseURL, { timeout: 30000 });

      // Verify we're logged in by checking for "New Project" button
      await expect(page.getByRole("button", { name: "New Project" }).first()).toBeVisible({
        timeout: 10000,
      });
    }

    // Save authentication state
    await context.storageState({ path: authFile });

    console.log("Authentication setup completed successfully");
  } catch (error) {
    console.error("Authentication setup failed:", error);
    throw error;
  } finally {
    await page.close();
    await context.close();
    await browser.close();
  }
}

export default globalSetup;
