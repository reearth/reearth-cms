import config from "eslint-config-reearth/flat/index.mjs";
import playwright from "eslint-plugin-playwright";
import globals from "globals";

/** @type { import("eslint").Linter.FlatConfig[] } */

export default [
  ...config,
  {
    rules: {
      "import/order": [
        "warn",
        {
          pathGroups: [
            {
              pattern: "@reearth-cms/**",
              group: "external",
              position: "after",
            },
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
    },
  },
  {
    ...playwright.configs["flat/recommended"],
    files: ["e2e/**/*"],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    files: ["src/**"],
    rules: {
      "@typescript-eslint/no-explicit-any": ["warn"],
      "@typescript-eslint/consistent-type-definitions": ["warn"],
      "@typescript-eslint/array-type": ["warn"],
      "@typescript-eslint/consistent-indexed-object-style": ["warn"],
    },
  },
  {
    ignores: [
      "/dist",
      "/coverage",
      "/node_modules",
      "storybook-static",
      "!/.storybook",
      "/.storybook/public",
      "/src/gql/graphql-client-api.tsx",
    ],
  },
];
