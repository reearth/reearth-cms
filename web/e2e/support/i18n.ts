import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
// eslint-disable-next-line import/no-extraneous-dependencies
import Backend from "i18next-fs-backend";
import { initReactI18next } from "react-i18next";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .use(Backend)
  .init({
    lng: "en",
    backend: {
      loadPath: "@reearth-cms/e2e/translations/{{lng}}.yml",
    },
    // allow keys to be phrases having `:`, `.`
    nsSeparator: false,
    keySeparator: false,
    returnEmptyString: false,
  });

export { t } from "i18next";

export default i18n;
