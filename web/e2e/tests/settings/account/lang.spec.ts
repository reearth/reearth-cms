import { expect, TAG, test } from "@reearth-cms/e2e/fixtures/test";

test("Language updating has succeeded", { tag: TAG.SMOKE }, async ({ settingsPage }) => {
  await settingsPage.goto("/", { waitUntil: "domcontentloaded" });
  await settingsPage.accountText.click();
  let originalLanguage = await settingsPage.currentLanguageText.innerText();
  await settingsPage.currentLanguageText.click();
  if (originalLanguage === "Auto" || originalLanguage === "English") {
    await settingsPage.languageOptionJapanese.click();
    await settingsPage.formSaveButton.click();
    await settingsPage.closeNotification();
    await expect(settingsPage.rootElement).toContainText("ホーム");
    await settingsPage.japaneseFirstText.click();
  } else {
    await settingsPage.languageOptionEnglish.click();
    await settingsPage.formSaveButton.click();
    await settingsPage.closeNotification();
    await expect(settingsPage.rootElement).toContainText("Home");
    await settingsPage.englishFirstText.click();
  }
  if (originalLanguage === "Auto") {
    originalLanguage = "自動";
  } else if (originalLanguage === "自動") {
    originalLanguage = "Auto";
  }
  await settingsPage.languageOptionByTitle(originalLanguage).click();
  await settingsPage.formSaveButton.click();
  await settingsPage.closeNotification();
});
