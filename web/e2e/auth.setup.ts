import { test, expect } from "@playwright/test";

import { authFile } from "../playwright.config";

test("authenticate", async ({ page }) => {
  const baseUrl = process.env.REEARTH_CMS_E2E_BASEURL;
  const username = process.env.REEARTH_CMS_E2E_USERNAME;
  const password = process.env.REEARTH_CMS_E2E_PASSWORD;
  expect(baseUrl).not.toBe(undefined);
  expect(username).not.toBe(undefined);
  expect(password).not.toBe(undefined);
  await page.goto(baseUrl as string);
  await page.getByPlaceholder("username/email").fill(username as string);
  await page.getByPlaceholder("your password").fill(password as string);
  await page.getByText("LOG IN").click();
  await expect(page.getByRole("button", { name: "New Project" })).toBeVisible({
    timeout: 10 * 1000,
  });
  await page.context().storageState({ path: authFile });
});
