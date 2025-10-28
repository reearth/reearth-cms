import { expect, test } from "@reearth-cms/e2e/fixtures/test";

let originalLanguage: string;

test.beforeEach(async ({ reearth, settingsPage }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await settingsPage.accountText.click();
  originalLanguage = await settingsPage.currentLanguageText.innerText();
});

test.afterEach(async ({ reearth, settingsPage }) => {
  // Restore original language
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await settingsPage.accountText.click();
  const currentLanguage = await settingsPage.currentLanguageText.innerText();

  // Only restore if language has changed
  if (currentLanguage !== originalLanguage) {
    await settingsPage.currentLanguageText.click();
    // Handle language name translations
    let languageToRestore = originalLanguage;
    if (originalLanguage === "Auto" && currentLanguage === "自動") {
      languageToRestore = "自動";
    } else if (originalLanguage === "自動" && currentLanguage === "Auto") {
      languageToRestore = "Auto";
    }
    await settingsPage.languageOptionByTitle(languageToRestore).click();
    await settingsPage.formSaveButton.click();
    await settingsPage.closeNotification();
  }
});

test("Language updating has succeeded", async ({ reearth, settingsPage }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await settingsPage.accountText.click();
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
});
