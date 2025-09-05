import path from "path";
import { fileURLToPath } from "url";

import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/utils/mock";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localZipPath = path.resolve(__dirname, "./mock-assets/test.zip");
const zipName = "20214_chino-shi_2022_mvt_1_op_urf_UseDistrict.zip";
const zipUrl = `https://assets.cms.plateau.reearth.io/assets/ff/5caafa-1c09-46b7-868e-9f4b62f59c68/${zipName}`;

test.beforeEach(async ({ reearth, homePage, projectLayoutPage, assetsPage }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await homePage.createProject(getId());
  await projectLayoutPage.navigateToAssets();
  await expect(assetsPage.rowByText(/.*/).first()).toBeVisible();
});

test.afterEach(async ({ projectLayoutPage, projectSettingsPage }) => {
  await projectLayoutPage.navigateToSettings();
  await projectSettingsPage.deleteProject();
});

test.describe("Zip Upload Tests", () => {
  test("Uploading and auto-unzipping ZIP file from URL tab succeeds", async ({
    page,
    assetsPage,
  }) => {
    const before = await assetsPage.assetRows.count();

    await assetsPage.uploadButton.click();
    await assetsPage.urlTab.click();
    await assetsPage.urlInput.fill(zipUrl);
    await assetsPage.autoUnzipCheckbox.setChecked(true);
    await assetsPage.submitUploadButton.click();

    await closeNotification(page);

    const after = await assetsPage.assetRows.count();
    expect(after).toBeGreaterThan(before);

    expect(
      await assetsPage.rowByText(/plateau\.reearth\.io|UseDistrict|\.zip/i).count(),
    ).toBeGreaterThan(0);
  });

  test("Uploading and auto-unzipping ZIP via Local tab succeeds", async ({ page, assetsPage }) => {
    const before = await assetsPage.assetRows.count();

    await assetsPage.uploadButton.click();
    await assetsPage.localTab.click();
    await assetsPage.fileInput.setInputFiles(localZipPath);
    await assetsPage.autoUnzipCheckbox.setChecked(true);
    await assetsPage.submitUploadButton.click();

    await closeNotification(page);

    const after = await assetsPage.assetRows.count();
    expect(after).toBeGreaterThan(before);

    expect(await assetsPage.rowByText(/test\.zip|test/i).count()).toBeGreaterThan(0);
  });
});
