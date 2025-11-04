import { FullConfig } from "@playwright/test";

async function globalSetup(_config: FullConfig) {
  console.log("Running global setup...");
  validateEnvironment();
  console.log("Global setup completed successfully");
}

function validateEnvironment() {
  try {
    const required = ["REEARTH_CMS_E2E_USERNAME", "REEARTH_CMS_E2E_PASSWORD", "REEARTH_CMS_E2E_BASEURL"];
    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
      throw new Error(
        `Missing environment variables: ${missing.join(", ")}\n` +
          `Please check your .env file.`,
      );
    }
  } catch (error) {
    console.error("Error validating environment variables:", error);
  }
}

export default globalSetup;
