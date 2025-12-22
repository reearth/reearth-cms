/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from "i18next-cli";

export default defineConfig({
  locales: ["en", "ja"],
  extract: {
    input: ["src/**/*.{ts,tsx}"],
    output: "src/i18n/translations/{{language}}.yml",
    defaultNS: "translation",
    keySeparator: false,
    nsSeparator: false,
    functions: ["t", "*.t"],
    transComponents: ["Trans"],
  },
  types: {
    input: ["locales/{{language}}/{{namespace}}.json"],
    output: "src/types/i18next.d.ts",
  },
});
