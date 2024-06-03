import config from "eslint-config-reearth";

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
