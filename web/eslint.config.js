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
    ignores: ["coverage/*", "src/gql/__generated__/*", "amplify/*"],
  },
  {
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
  {
    files: ["e2e/tests/**/*.spec.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "Property[key.name='page'][parent.type='ObjectPattern'][parent.parent.type='ArrowFunctionExpression']",
          message:
            "Do not destructure raw `page` from test fixtures. Use a Page Object Model (POM) fixture instead.",
        },
        {
          selector:
            "Property[key.name='reearth'][parent.type='ObjectPattern'][parent.parent.type='ArrowFunctionExpression']",
          message:
            "Do not destructure `reearth` from test fixtures. Use the POM's goto() method instead.",
        },
      ],
    },
  },
];
