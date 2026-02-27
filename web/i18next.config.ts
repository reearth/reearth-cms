import { defineConfig } from "i18next-cli";

export default defineConfig({
  extract: {
    defaultNS: false,
    extractFromComments: false,
    functions: ["t", "*.t"],
    input: ["src/**/*.{ts,tsx}"],
    keySeparator: false,
    nsSeparator: false,
    output: "src/i18n/translations/{{language}}.ts",
    outputFormat: "ts",
    removeUnusedKeys: true,
    transComponents: ["Trans"],
  },
  locales: ["en", "ja"],
  types: {
    enableSelector: true, // Enable type-safe key selection
    input: ["src/i18n/translations/en.ts"],
    output: "src/i18n/i18next.d.ts",
    resourcesFile: "src/i18n/resources.d.ts",
  },
});
