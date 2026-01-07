import i18n from "i18next";

import en from "@reearth-cms/i18n/translations/en";
import ja from "@reearth-cms/i18n/translations/ja";

const resources = {
  en,
  ja,
};

export const availableLanguages = Object.keys(resources);

i18n.init({
  resources,
  fallbackLng: "en",
  // allow keys to be phrases having `:`, `.`
  nsSeparator: false,
  keySeparator: false,
  returnEmptyString: false,
  // ns: "translation",
});

export { t } from "i18next";

export default i18n;
