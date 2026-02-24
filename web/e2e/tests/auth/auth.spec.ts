import { test } from "@reearth-cms/e2e/fixtures/test";

test("Logout has succeeded", async ({ loginPage }) => {
  await loginPage.goto("/", { waitUntil: "domcontentloaded" });
  await loginPage.userMenuLink.click();
  await loginPage.logoutButton.click();
  await loginPage.expectURL(/auth0.com/);
});
