import config from "eslint-config-reearth";
import perfectionist from "eslint-plugin-perfectionist";
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
    ignores: ["coverage/*", "src/gql/__generated__/*", "amplify/*", "src/i18n/translations/*"],
  },
  {
    plugins: {
      perfectionist,
    },
    rules: {
      "react-refresh/only-export-components": "off",

      // Disable conflicting rule from eslint-config-reearth
      "import/order": "off",

      // 1. Import sorting
      "perfectionist/sort-imports": [
        "warn",
        {
          groups: [
            "type-import",
            ["value-builtin", "value-external"],
            "type-internal",
            "value-internal",
            ["type-parent", "type-sibling", "type-index"],
            ["value-parent", "value-sibling", "value-index"],
            "unknown",
          ],
          ignoreCase: true,
          internalPattern: ["^@reearth-cms/.+"],
          newlinesBetween: 1,
          order: "asc",
          type: "alphabetical",
        },
      ],
      "perfectionist/sort-named-imports": [
        "warn",
        {
          ignoreCase: true,
          order: "asc",
          type: "alphabetical",
        },
      ],

      "perfectionist/sort-interfaces": [
        "warn",
        {
          ignoreCase: true,
          order: "asc",
          partitionByNewLine: true,
          type: "alphabetical",
        },
      ],
      "perfectionist/sort-intersection-types": [
        "warn",
        {
          ignoreCase: true,
          order: "asc",
          type: "alphabetical",
        },
      ],
      "perfectionist/sort-object-types": [
        "warn",
        {
          ignoreCase: true,
          order: "asc",
          partitionByNewLine: true,
          type: "alphabetical",
        },
      ],
      // 2. Object keys & types sorting
      "perfectionist/sort-objects": [
        "warn",
        {
          ignoreCase: true,
          order: "asc",
          partitionByNewLine: true,
          type: "alphabetical",
        },
      ],
      "perfectionist/sort-union-types": [
        "warn",
        {
          ignoreCase: true,
          order: "asc",
          type: "alphabetical",
        },
      ],

      // 3. JSX attribute sorting
      "perfectionist/sort-jsx-props": [
        "warn",
        {
          ignoreCase: true,
          order: "asc",
          type: "alphabetical",
        },
      ],
    },
  },
];
