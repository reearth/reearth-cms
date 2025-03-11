import { test, expect } from "@playwright/test";

import { baseURL, authFile } from "../playwright.config";

import { config } from "./utils/config";

const { userName, password } = config;

test("authenticate", async ({ page }) => {
  expect(userName).toBeTruthy();
  expect(password).toBeTruthy();
  await page.goto(baseURL);
  await page.getByRole("button").first().waitFor();
  const isNew = await page.getByLabel("Email address").isVisible();
  // eslint-disable-next-line playwright/no-conditional-in-test
  if (isNew) {
    await page.getByLabel("Email address").click();
    await page.getByLabel("Email address").fill(userName as string);
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.getByLabel("Password").click();
    await page.getByLabel("Password").fill(password as string);
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    const withoutPasskeyButton = page.getByRole("button", { name: "Continue without passkeys" });
    // eslint-disable-next-line playwright/no-conditional-in-test
    if (await withoutPasskeyButton.isVisible()) {
      await withoutPasskeyButton.click();
    }
  } else {
    await page.getByPlaceholder("username/email").click();
    await page.getByPlaceholder("username/email").fill(userName as string);
    await page.getByPlaceholder("your password").click();
    await page.getByPlaceholder("your password").fill(password as string);
    await page.getByText("LOG IN").click();
  }
  await page.waitForURL(baseURL);
  await expect(page.getByRole("button", { name: "New Project" }).first()).toBeVisible({
    timeout: 10 * 1000,
  });
  await page.context().storageState({ path: authFile });
});
