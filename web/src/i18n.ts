import * as i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "../translations/en.json";
import de from "../translations/ja.json";

const resources = {
  en,
  de,
};

export const availableLanguages = Object.keys(resources);

i18n.use(initReactI18next).init({
  fallbackLng: "en",
  keySeparator: false,
});
