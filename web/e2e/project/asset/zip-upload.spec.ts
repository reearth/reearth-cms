import path from "path";
import { fileURLToPath } from "url";

import { expect } from "@playwright/test";

import { test } from "@reearth-cms/e2e/fixtures/test";
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
  await expect(assetsPage.getRowByText(/.*/).first()).toBeVisible();
});

test.afterEach(async ({ projectLayoutPage, projectSettingsPage }) => {
  await projectLayoutPage.navigateToSettings();
  await projectSettingsPage.deleteProject();
});

test.describe("Zip Upload Tests", () => {
  test("Uploading and auto-unzipping ZIP file from URL tab succeeds", async ({ assetsPage }) => {
    const before = await assetsPage.countRows();

    await assetsPage.openUploadDialog();
    await assetsPage.selectTab("URL");
    await assetsPage.getByPlaceholder("Please input a valid URL").fill(zipUrl);
    await assetsPage.toggleAutoUnzip(true);
    await assetsPage.getByRole("button", { name: "Upload", exact: true }).click();

    await assetsPage.expectToast("Successfully added asset!");

    const after = await assetsPage.countRows();
    expect(after).toBeGreaterThan(before);

    expect(
      await assetsPage.getRowByText(/plateau\.reearth\.io|UseDistrict|\.zip/i).count(),
    ).toBeGreaterThan(0);
  });

  test("Uploading and auto-unzipping ZIP via Local tab succeeds", async ({ assetsPage }) => {
    const before = await assetsPage.countRows();

    await assetsPage.openUploadDialog();
    await assetsPage.selectTab("Local");
    await assetsPage.locator(".ant-upload input[type='file']").setInputFiles(localZipPath);
    await assetsPage.toggleAutoUnzip(true);
    await assetsPage.getByRole("button", { name: "Upload", exact: true }).click();

    await assetsPage.expectToast("Successfully added one or more assets!");

    const after = await assetsPage.countRows();
    expect(after).toBeGreaterThan(before);

    expect(await assetsPage.getRowByText(/test\.zip|test/i).count()).toBeGreaterThan(0);
  });
});
