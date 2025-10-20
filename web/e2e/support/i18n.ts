import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
// eslint-disable-next-line import/no-extraneous-dependencies
import yaml from "yaml";

const __dirname = dirname(fileURLToPath(import.meta.url));
const enPath = path.resolve(__dirname, "../../src/i18n/translations/en.yml");
const jaPath = path.resolve(__dirname, "../../src/i18n/translations/ja.yml");
const en = yaml.parse(fs.readFileSync(enPath, "utf-8"));
const ja = yaml.parse(fs.readFileSync(jaPath, "utf-8"));

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
  resources,
  fallbackLng: "en",
  // allow keys to be phrases having `:`, `.`
  nsSeparator: false,
  keySeparator: false,
  returnEmptyString: false,
});

export default i18n;
