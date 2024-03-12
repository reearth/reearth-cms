import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect, test } from "@reearth-cms/e2e/utils";

test("Name and email has updated", async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByText("Account").click();

  const username = await page.getByLabel("Account Name").inputValue();
  await page.getByLabel("Account Name").click();
  await page.getByLabel("Account Name").fill("new name");
  const email = await page.getByLabel("Your Email").inputValue();
  await page.getByLabel("Your Email").click();
  await page.getByLabel("Your Email").fill("test@test.co");
  await page
    .locator("form")
    .filter({ hasText: "Account NameThis is your ID" })
    .getByRole("button")
    .click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated user!");
  await closeNotification(page);

  await page.getByLabel("Account Name").click();
  await page.getByLabel("Account Name").fill(username);
  await page.getByLabel("Your Email").click();
  await page.getByLabel("Your Email").fill(email);
  await page
    .locator("form")
    .filter({ hasText: "Account NameThis is your ID" })
    .getByRole("button")
    .click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated user!");
  await closeNotification(page);
  await expect(page.locator("header")).toContainText(username);
});

test("Language has updated from English to Japanese", async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByText("Account").click();

  await page
    .locator("div")
    .filter({ hasText: /^English$/ })
    .nth(3)
    .click();
  await page.getByTitle("日本語").click();
  await page
    .locator("form")
    .filter({ hasText: "Service Language日本語日本語This" })
    .getByRole("button")
    .click();
  await expect(page.getByRole("alert").last()).toContainText("言語設定の更新に成功しました。");
  await closeNotification(page);
  await expect(page.locator("#root")).toContainText("ホーム");
  await page
    .locator("div")
    .filter({ hasText: /^日本語UIの言語設定を変更します。$/ })
    .locator("div")
    .nth(3)
    .click();
  await page.getByTitle("English").click();
  await page
    .locator("form")
    .filter({ hasText: "利用言語EnglishEnglishUI" })
    .getByRole("button")
    .click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated language!");
  await closeNotification(page);
});

test("Language has updated from English to Auto", async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByText("Account").click();

  await page
    .locator("div")
    .filter({ hasText: /^EnglishThis will change the UI language$/ })
    .locator("div")
    .nth(3)
    .click();
  await page.getByTitle("Auto").click();
  await page
    .locator("form")
    .filter({ hasText: "Service LanguageAutoAutoThis" })
    .getByRole("button")
    .click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated language!");
  await closeNotification(page);
  await page
    .locator("div")
    .filter({ hasText: /^AutoThis will change the UI language$/ })
    .locator("div")
    .nth(3)
    .click();
  await page.getByTitle("English").click();
  await page.locator("form").filter({ hasText: "Service" }).getByRole("button").click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated language!");
  await closeNotification(page);
});
