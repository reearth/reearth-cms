import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect, test } from "@reearth-cms/e2e/utils";
import { config } from "@reearth-cms/e2e/utils/config";

const { userName: originalEmail } = config;

let username = "e2e test name";

test.afterEach(async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByText(/Account|アカウント/).click();
  const email = await page.getByLabel(/Your Email|メールアドレス/).inputValue();
  if (email === originalEmail) {
    return;
  } else if (originalEmail) {
    await page.getByLabel(/Account Name|アカウント名/).fill(username);
    await page.getByLabel(/Your Email|メールアドレス/).fill(originalEmail);
    await page.locator("form").getByRole("button").first().click();
    await expect(page.getByRole("alert").last()).toContainText("Successfully updated user!");
    await closeNotification(page);
  }
});

test("Name and email updating has succeeded", async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByText("Account").click();

  username = await page.getByLabel("Account Name").inputValue();
  await page.getByLabel("Account Name").click();
  await page.getByLabel("Account Name").fill("new name");
  const email = await page.getByLabel("Your Email").inputValue();
  await page.getByLabel("Your Email").click();
  await page.getByLabel("Your Email").fill("test@test.com");
  await page.locator("form").getByRole("button").first().click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated user!");
  await closeNotification(page);

  await page.getByLabel("Account Name").click();
  await page.getByLabel("Account Name").fill(username);
  await page.getByLabel("Your Email").click();
  await page.getByLabel("Your Email").fill(email);
  await page.locator("form").getByRole("button").first().click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated user!");
  await closeNotification(page);
  await expect(page.locator("header")).toContainText(username);
});

test("Language updating has succeeded", async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByText(/Account|アカウント/).click();
  let originalLanguage = await page.getByText(/Auto|自動|English|日本語/).innerText();
  await page.getByText(/Auto|自動|English|日本語/).click();
  if (originalLanguage === "Auto" || originalLanguage === "English") {
    await page.getByTitle("日本語").last().click();
    await page.locator("form").getByRole("button").nth(1).click();
    await expect(page.getByRole("alert").last()).toContainText("言語設定の更新に成功しました。");
    await closeNotification(page);
    await expect(page.locator("#root")).toContainText("ホーム");
    await page.getByText("日本語").first().click();
  } else {
    await page.getByTitle("English").last().click();
    await page.locator("form").getByRole("button").nth(1).click();
    await expect(page.getByRole("alert").last()).toContainText("Successfully updated language!");
    await closeNotification(page);
    await expect(page.locator("#root")).toContainText("Home");
    await page.getByText("English").first().click();
  }
  if (originalLanguage === "Auto") {
    originalLanguage = "自動";
  } else if (originalLanguage === "自動") {
    originalLanguage = "Auto";
  }
  await page.getByTitle(originalLanguage).last().click();
  await page.locator("form").getByRole("button").nth(1).click();
  await expect(page.getByRole("alert").last()).toContainText(
    /Successfully updated language!|言語設定の更新に成功しました。/,
  );
  await closeNotification(page);
});
