import config from "eslint-config-reearth";
import playwright from "eslint-plugin-playwright";
import storybook from "eslint-plugin-storybook";
import globals from "globals";

/** @type { import("eslint").Linter.FlatConfig[] } */

const storyBookConfig = {
  files: ["*.stories.@(ts|tsx|js|jsx|mjs|cjs)"],
  plugins: {
    storybook: storybook,
  },
};

const playwrightConfig = {
  ...playwright.configs["flat/recommended"],
  files: ["e2e/**/*"],
  languageOptions: {
    globals: {
      ...globals.browser,
    },
  },
};

export default [
  ...config("reearth-cms"),
  storyBookConfig,
  playwrightConfig,
  {
    ignores: ["coverage/*", "src/gql/graphql-client-api.tsx", "amplify/*"],
  },
];
