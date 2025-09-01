import path from "path";
import { fileURLToPath } from "url";

import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect, test } from "@reearth-cms/e2e/utils";

import { createProject, deleteProject } from "../utils/project";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localZipPath = path.resolve(__dirname, "./mock-assets/test.zip");

const zipName = "20214_chino-shi_2022_mvt_1_op_urf_UseDistrict.zip";
const zipUrl = `https://assets.cms.plateau.reearth.io/assets/ff/5caafa-1c09-46b7-868e-9f4b62f59c68/${zipName}`;

test.beforeEach(async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
  await page.getByRole("menuitem", { name: "Asset" }).click();
});

test.afterEach(async ({ page }) => {
  await deleteProject(page);
});

test.describe("Zip Upload Tests", () => {
  test("Uploading and auto-unzipping ZIP file from URL tab succeeds", async ({ page }) => {
    await page.getByRole("button", { name: "upload Upload Asset" }).click();
    await page.getByRole("tab", { name: "URL" }).click();
    const urlInput = page.getByPlaceholder("Please input a valid URL");
    await urlInput.fill(zipUrl);
    const autoUnzipCheckbox = page.getByRole("checkbox", { name: "Auto Unzip" });
    await autoUnzipCheckbox.setChecked(true);
    await expect(autoUnzipCheckbox).toBeChecked();
    await page.getByRole("button", { name: "Upload", exact: true }).click();
    await expect(page.locator(".ant-notification-notice").last()).toContainText(
      "Successfully added asset!",
    );
    await closeNotification(page);
  });

  test("Uploading and auto-unzipping ZIP file via Local tab succeeds", async ({ page }) => {
    await page.getByRole("button", { name: "upload Upload Asset" }).click();
    await page.getByRole("tab", { name: "Local" }).click();
    const uploadInput = page.locator(".ant-upload input[type='file']");
    await uploadInput.setInputFiles(localZipPath);
    const autoUnzipCheckbox = page.getByRole("checkbox", { name: "Auto Unzip" });
    await autoUnzipCheckbox.setChecked(true);
    await expect(autoUnzipCheckbox).toBeChecked();
    await page.getByRole("button", { name: "Upload", exact: true }).click();
    await expect(page.locator(".ant-notification-notice").last()).toContainText(
      "Successfully added one or more assets!",
    );

    await closeNotification(page);
  });
});
