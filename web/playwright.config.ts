import path, { dirname } from "path";
import { fileURLToPath } from "url";

import { devices, type PlaywrightTestConfig } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const authFile = path.join(__dirname, "./e2e/support/.auth/user.json");

export const baseURL = process.env.REEARTH_CMS_E2E_BASEURL || "http://localhost:3000/";

const config: PlaywrightTestConfig = {
  workers: process.env.CI ? 4 : undefined,
  retries: 2,
  use: {
    baseURL,
    screenshot: "only-on-failure",
    video: process.env.CI ? "on-first-retry" : "retain-on-failure",
    locale: "en-US",
  },
  testDir: "e2e/tests",
  testIgnore: ["**/node_modules/**", "**/dist/**", "**/build/**"],
  reporter: process.env.CI ? "github" : "list",
  fullyParallel: true,
  projects: [
    { name: "setup", testMatch: /.*\.setup\.ts/, testDir: "e2e/support" },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: authFile,
      },
      dependencies: ["setup"],
    },
  ],
  timeout: 120 * 1000,
};

export default config;
