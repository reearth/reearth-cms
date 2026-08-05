import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import z from "zod";
import enLocale from "zod/v4/locales/en";
import jaLocale from "zod/v4/locales/ja";

import en from "./translations/en";
import ja from "./translations/ja";

const resources = {
  en: {
    translation: en,
  },
  ja: {
    translation: ja,
  },
};

export const availableLanguages = Object.keys(resources);

const zodLocaleMap: Record<string, () => Partial<z.core.$ZodConfig>> = {
  en: enLocale,
  ja: jaLocale,
};

function syncZodLocale(lang: string) {
  const localeFn = zodLocaleMap[lang] ?? zodLocaleMap["en"];
  if (!localeFn) return;
  z.config(localeFn());
}

i18n.use(LanguageDetector).use(initReactI18next).init({
  resources,
  fallbackLng: "en",
  // allow keys to be phrases having `:`, `.`
  nsSeparator: false,
  keySeparator: false,
  returnEmptyString: false,
});

syncZodLocale(i18n.language || "en");

i18n.on("languageChanged", (lang: string) => {
  syncZodLocale(lang);
});

export default i18n;
