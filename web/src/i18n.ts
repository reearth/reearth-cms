import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "../translations/en.json";
import ja from "../translations/ja.json";

const resources = {
  en: {
    translation: en,
  },
  ja: {
    translation: ja,
  },
};

export const availableLanguages = Object.keys(resources);

// eslint-disable-next-line import/no-named-as-default-member
i18n.use(initReactI18next).init({
  resources,
  fallbackLng: "en",
  keySeparator: false,
  returnEmptyString: false,
});

export default i18n;
