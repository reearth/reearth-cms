import i18n from "i18next";

import en from "@reearth-cms/i18n/translations/en";
import ja from "@reearth-cms/i18n/translations/ja";

const resources = {
  en,
  ja,
};

export const availableLanguages = Object.keys(resources);

i18n.init({
  defaultNS: false,
  fallbackLng: "en",
  keySeparator: false,
  // allow keys to be phrases having `:`, `.`
  nsSeparator: false,
  resources,
  returnEmptyString: false,
});

export { t } from "i18next";

export default i18n;
