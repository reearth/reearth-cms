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
  rules: {
    "react-hooks/rules-of-hooks": "off",
  },
};

export default [
  ...config("reearth-cms"),
  storyBookConfig,
  playwrightConfig,
  {
    ignores: ["coverage/*", "src/gql/__generated__/*", "amplify/*", "storybook-static/**"],
  },
  {
    files: ["**/*.{jsx,tsx,ts,js}"],
    rules: {
      "react-refresh/only-export-components": "off",
      // Newly enabled by eslint-config-reearth@0.4.0's React Compiler rules; downgraded to
      // warnings pending a dedicated cleanup pass across existing components/tests.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/use-memo": "warn",
    },
  },
  {
    files: ["**/*.test.{js,ts,cjs,mjs,jsx,tsx}"],
    rules: {
      "vitest/no-conditional-expect": "warn",
    },
  },
  {
    files: ["scripts/**"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
];
