import { defineConfig } from "allure";

export default defineConfig({
  name: "Re:Earth CMS E2E",
  output: "allure-report",
  historyPath: "history.jsonl",
  historyLimit: 50,
  plugins: {
    awesome: {
      options: {
        singleFile: false,
        reportLanguage: "en",
      },
    },
  },
});
