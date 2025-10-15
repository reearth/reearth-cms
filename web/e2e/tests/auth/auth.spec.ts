import { expect, test } from "@reearth-cms/e2e/fixtures/test";

test("Logout has succeeded", async ({ reearth, page, loginPage }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await loginPage.userMenuLink.click();
  await loginPage.logoutButton.click();
  await expect(page).toHaveURL(/auth0.com/);
});
