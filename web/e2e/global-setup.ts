import { FullConfig } from "@playwright/test";

/**
 * Global setup that runs once before all tests.
 * Note: Authentication is now handled by the setup project (auth.setup.ts)
 * which runs as a dependency before the chromium project.
 *
 * Use this file for:
 * - Environment validation
 * - Cleaning up old test artifacts
 * - Setting up test databases or services
 * - Any other global non-authentication setup tasks
 */
async function globalSetup(_config: FullConfig) {
  console.log("Running global setup...");

  validateEnvironment();

  console.log("Global setup completed successfully");
}

function validateEnvironment() {
  const required = ["REEARTH_CMS_E2E_USERNAME", "REEARTH_CMS_E2E_PASSWORD"];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.warn(
      `Warning: Missing environment variables: ${missing.join(", ")}\n` +
        `   Tests may fail. Please check your .env file.`,
    );
  }

  const baseUrl = process.env.REEARTH_CMS_E2E_BASEURL;
  if (baseUrl) {
    try {
      new URL(baseUrl);
      console.log(`✓ Base URL validated: ${baseUrl}`);
    } catch {
      throw new Error(
        `Invalid REEARTH_CMS_E2E_BASEURL: "${baseUrl}"\n` +
          `Must be a valid URL (e.g., http://localhost:3000)`,
      );
    }
  }
}

export default globalSetup;
