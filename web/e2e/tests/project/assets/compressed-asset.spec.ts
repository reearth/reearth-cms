import path from "path";
import { fileURLToPath } from "url";

import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localZipPath = path.resolve(__dirname, "./mock-assets/test.zip");

const zipName = "20214_chino-shi_2022_mvt_1_op_urf_UseDistrict.zip";
const zipUrl = `https://assets.cms.plateau.reearth.io/assets/ff/5caafa-1c09-46b7-868e-9f4b62f59c68/${zipName}`;

let projectName: string;

test.beforeEach(async ({ reearth, projectPage }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  projectName = getId();
  await projectPage.createProject(projectName);
  await projectPage.gotoProject(projectName);
  await projectPage.assetMenuItem.click();
});

test.afterEach(async ({ projectPage }) => {
  await projectPage.deleteProject(projectName);
});

test.describe("Zip Upload Tests", () => {
  test("Uploading and auto-unzipping ZIP file from URL tab succeeds", async ({ assetsPage }) => {
    await assetsPage.uploadButton.click();
    await assetsPage.urlTab.click();
    const urlInput = assetsPage.urlInput;
    await urlInput.fill(zipUrl);
    const autoUnzipCheckbox = assetsPage.autoUnzipCheckbox;
    await autoUnzipCheckbox.setChecked(true);
    await expect(autoUnzipCheckbox).toBeChecked();
    await assetsPage.submitUploadButton.click();
    await expect(assetsPage.lastNotification).toContainText("Successfully added asset!");
    await assetsPage.closeNotification();
  });

  test("Uploading and auto-unzipping ZIP file via Local tab succeeds", async ({ assetsPage }) => {
    await assetsPage.uploadButton.click();
    await assetsPage.localTab.click();
    const uploadInput = assetsPage.fileInput;
    await uploadInput.setInputFiles(localZipPath);
    const autoUnzipCheckbox = assetsPage.autoUnzipCheckbox;
    await autoUnzipCheckbox.setChecked(true);
    await expect(autoUnzipCheckbox).toBeChecked();
    await assetsPage.submitUploadButton.click();
    await expect(assetsPage.lastNotification).toContainText(
      "Successfully added one or more assets!",
    );

    await assetsPage.closeNotification();
  });
});
