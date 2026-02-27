import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

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

i18n.use(LanguageDetector).use(initReactI18next).init({
  fallbackLng: "en",
  keySeparator: false,
  // allow keys to be phrases having `:`, `.`
  nsSeparator: false,
  resources,
  returnEmptyString: false,
});

export default i18n;
