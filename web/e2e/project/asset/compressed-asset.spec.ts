/* eslint-disable playwright/no-skipped-test */
import path from "path";
import { fileURLToPath } from "url";

import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect, test } from "@reearth-cms/e2e/fixtures/test";

import { createProject, deleteProject } from "../utils/project";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localZipPath = path.resolve(__dirname, "./mock-assets/test.zip");

const zipName = "20214_chino-shi_2022_mvt_1_op_urf_UseDistrict.zip";
const zipUrl = `https://assets.cms.plateau.reearth.io/assets/ff/5caafa-1c09-46b7-868e-9f4b62f59c68/${zipName}`;

const isCI = !!process.env.CI;

test.beforeEach(async ({ reearth, page }) => {
  test.skip(!isCI, "This test runs only in CI environment");
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
  await page.getByRole("menuitem", { name: "Asset" }).click();
});

test.afterEach(async ({ page }) => {
  test.skip(!isCI, "This test runs only in CI environment");
  await deleteProject(page);
});

test.describe("Zip Upload Tests", () => {
  test("Uploading and auto-unzipping ZIP file from URL tab succeeds", async ({
    page,
    assetsPage,
  }) => {
    await assetsPage.uploadButton.click();
    await assetsPage.urlTab.click();
    await assetsPage.urlInput.fill(zipUrl);

    await assetsPage.autoUnzipCheckbox.setChecked(true);
    await expect(assetsPage.autoUnzipCheckbox).toBeChecked();

    await assetsPage.submitUploadButton.click();

    await expect(page.locator(".ant-notification-notice").last()).toBeVisible();
    await closeNotification(page);
  });

  test("Uploading and auto-unzipping ZIP file via Local tab succeeds", async ({
    page,
    assetsPage,
  }) => {
    await assetsPage.uploadButton.click();
    await assetsPage.localTab.click();
    await assetsPage.fileInput.setInputFiles(localZipPath);

    await assetsPage.autoUnzipCheckbox.setChecked(true);
    await expect(assetsPage.autoUnzipCheckbox).toBeChecked();

    await assetsPage.submitUploadButton.click();

    await expect(page.locator(".ant-notification-notice").last()).toBeVisible();
    await closeNotification(page);
  });
});
