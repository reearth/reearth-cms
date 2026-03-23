import { resolve } from "node:path";

import { playwright } from "@vitest/browser-playwright";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        extends: "./vite.config.ts",
        test: {
          name: "unit",
          environment: "jsdom",
          setupFiles: "./src/test/setup.ts",
          exclude: [...configDefaults.exclude, "e2e/**/*", "**/*.visual.test.tsx"],
          testTimeout: 30 * 1000,
          coverage: {
            include: ["src/**/*.ts", "src/**/*.tsx"],
            exclude: [
              "src/**/*.d.ts",
              "src/**/*.stories.tsx",
              "src/gql/graphql-client-api.tsx",
              "src/test/**/*",
            ],
            reporter: ["text", "json", "lcov"],
          },
          alias: [
            { find: "@ant-design/pro-card", replacement: "@ant-design/pro-card/es/index.js" },
            {
              find: "@ant-design/pro-components",
              replacement: "@ant-design/pro-components/es/index.js",
            },
            {
              find: "@ant-design/pro-descriptions",
              replacement: "@ant-design/pro-descriptions/es/index.js",
            },
            { find: "@ant-design/pro-field", replacement: "@ant-design/pro-field/es/index.js" },
            { find: "@ant-design/pro-form", replacement: "@ant-design/pro-form/es/index.js" },
            {
              find: "@ant-design/pro-layout",
              replacement: "@ant-design/pro-layout/es/index.js",
            },
            { find: "@ant-design/pro-list", replacement: "@ant-design/pro-list/es/index.js" },
            {
              find: "@ant-design/pro-provider",
              replacement: "@ant-design/pro-provider/es/index.js",
            },
            {
              find: "@ant-design/pro-table",
              replacement: "@ant-design/pro-table/es/index.js",
            },
            {
              find: "@ant-design/pro-utils",
              replacement: "@ant-design/pro-utils/es/index.js",
            },
          ],
        },
      },
      {
        extends: "./vite.config.ts",
        test: {
          name: "visual",
          include: ["src/**/*.visual.test.tsx"],
          setupFiles: "./src/test/setup.visual.ts",
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
            headless: true,
            viewport: { width: 800, height: 600 },
            screenshotFailures: false,
            expect: {
              toMatchScreenshot: {
                // Exclude platform from screenshot filenames so baselines are
                // shared across macOS (local) and Linux (CI).
                resolveScreenshotPath: ({
                  arg,
                  ext,
                  root,
                  screenshotDirectory,
                  testFileDirectory,
                  testFileName,
                  browserName,
                }) =>
                  resolve(
                    root,
                    testFileDirectory,
                    screenshotDirectory,
                    testFileName,
                    `${arg}-${browserName}${ext}`,
                  ),
                resolveDiffPath: ({
                  arg,
                  ext,
                  root,
                  attachmentsDir,
                  testFileDirectory,
                  testFileName,
                  browserName,
                }) =>
                  resolve(
                    root,
                    attachmentsDir,
                    testFileDirectory,
                    testFileName,
                    `${arg}-${browserName}${ext}`,
                  ),
              },
            },
          },
          testTimeout: 30 * 1000,
        },
      },
    ],
  },
});
