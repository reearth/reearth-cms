import { expect, test } from "@reearth-cms/e2e/fixtures/test";

test("Logout has succeeded", async ({ reearth, page, authPage }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await authPage.userMenuLink.click();
  await authPage.logoutButton.click();
  await expect(page).toHaveURL(/auth0.com/);
});
