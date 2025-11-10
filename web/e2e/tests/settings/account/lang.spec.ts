import { expect, test } from "@reearth-cms/e2e/fixtures/test";

test("Language updating has succeeded", async ({ reearth, settingsPage, page }) => {
  await test.step("Navigate to account settings and detect current language", async () => {
    await reearth.goto("/", { waitUntil: "domcontentloaded" });
    await settingsPage.accountText.click();
    await page.waitForTimeout(300);
  });

  let originalLanguage: string;

  await test.step("Change language to Japanese or English based on current setting", async () => {
    originalLanguage = await settingsPage.currentLanguageText.innerText();
    await settingsPage.currentLanguageText.click();

    if (originalLanguage === "Auto" || originalLanguage === "English") {
      await settingsPage.languageOptionJapanese.click();
      await settingsPage.formSaveButton.click();
      await settingsPage.closeNotification();
      await page.waitForTimeout(300);
      await expect(settingsPage.rootElement).toContainText("ホーム");
      await settingsPage.japaneseFirstText.click();
    } else {
      await settingsPage.languageOptionEnglish.click();
      await settingsPage.formSaveButton.click();
      await settingsPage.closeNotification();
      await page.waitForTimeout(300);
      await expect(settingsPage.rootElement).toContainText("Home");
      await settingsPage.englishFirstText.click();
    }
  });

  await test.step("Restore original language setting", async () => {
    if (originalLanguage === "Auto") {
      originalLanguage = "自動";
    } else if (originalLanguage === "自動") {
      originalLanguage = "Auto";
    }
    await settingsPage.languageOptionByTitle(originalLanguage).click();
    await settingsPage.formSaveButton.click();
    await settingsPage.closeNotification();
    await page.waitForTimeout(300);
  });
});
