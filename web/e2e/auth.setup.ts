import { test, expect } from "@playwright/test";

import { baseURL, authFile } from "../playwright.config";

import { config } from "./utils/config";

const { userName, password } = config;

test("authenticate", async ({ page }) => {
  expect(userName).toBeTruthy();
  expect(password).toBeTruthy();
  await page.goto(baseURL);
  await page.getByPlaceholder("username/email").fill(userName as string);
  await page.getByPlaceholder("your password").fill(password as string);
  await page.getByText("LOG IN").click();
  await page.waitForURL(baseURL);
  await expect(page.getByRole("button", { name: "New Project" }).first()).toBeVisible({
    timeout: 10 * 1000,
  });
  await page.context().storageState({ path: authFile });
});
