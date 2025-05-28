import path from "path";
import { fileURLToPath } from "url";

import { Page } from "@playwright/test";

import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect, test } from "@reearth-cms/e2e/utils";

import { crudComment } from "./utils/comment";
import { createProject, deleteProject } from "./utils/project";

const jsonName = "tileset.json";
const jsonUrl = `https://assets.cms.plateau.reearth.io/assets/11/6d05db-ed47-4f88-b565-9eb385b1ebb0/13100_tokyo23-ku_2022_3dtiles%20_1_1_op_bldg_13101_chiyoda-ku_lod1/${jsonName}`;

const pngName = "road_plan2.png";
const pngUrl = `https://assets.cms.plateau.reearth.io/assets/33/e999c4-7859-446b-ab3c-86625b3c760e/${pngName}`;

const upload = async (page: Page, url: string) => {
  await page.getByRole("button", { name: "upload Upload Asset" }).click();
  await page.getByRole("tab", { name: "URL" }).click();
  await page.getByPlaceholder("Please input a valid URL").click();
  await page.getByPlaceholder("Please input a valid URL").fill(url);
  await page.getByRole("button", { name: "Upload", exact: true }).click();
  await closeNotification(page);
};

test.beforeEach(async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
  await page.getByRole("menuitem", { name: "Asset" }).click();
});

test.afterEach(async ({ page }) => {
  await deleteProject(page);
});

test.describe.parallel("Json file tests", () => {
  test.beforeEach(async ({ page }) => {
    await upload(page, jsonUrl);
  });

  test("Asset CRUD and Searching has succeeded", async ({ page }) => {
    await expect(page.getByText(jsonName)).toBeVisible();
    await page.getByPlaceholder("input search text").click();
    await page.getByPlaceholder("input search text").fill("no asset");
    await page.getByRole("button", { name: "search" }).click();
    await expect(page.getByText(jsonName)).toBeHidden();
    await page.getByPlaceholder("input search text").click();
    await page.getByPlaceholder("input search text").fill("");
    await page.getByRole("button", { name: "search" }).click();
    await expect(page.getByText(jsonName)).toBeVisible();
    await page.getByLabel("edit").locator("svg").click();
    await expect(page.getByText(`Asset / ${jsonName}`)).toBeVisible();
    await page.getByLabel("Back").click();
    await page.getByLabel("", { exact: true }).check();
    await page.getByText("Delete").click();
    await expect(page.getByText(jsonName)).toBeHidden();
    await closeNotification(page);
  });

  test("Previewing json file by full screen has succeeded", async ({ page }) => {
    await page.getByLabel("edit").locator("svg").click();
    await page
      .locator("div")
      .filter({ hasText: /^Unknown Type$/ })
      .nth(1)
      .click();
    await page.getByText("GEOJSON/KML/CZML").click();
    await page.getByRole("button", { name: "Save" }).click();
    await closeNotification(page);
    const viewportSizeGet = () => {
      const viewportSize = page.viewportSize();
      expect(viewportSize).toBeTruthy();
      return {
        width: (viewportSize as { width: number; height: number }).width.toString(),
        height: (viewportSize as { width: number; height: number }).height.toString(),
      };
    };
    const { width, height } = viewportSizeGet();
    const canvas = page.locator("canvas");
    await expect(canvas).not.toHaveAttribute("width", width);
    await expect(canvas).not.toHaveAttribute("height", height);
    await page.getByRole("button", { name: "fullscreen" }).click();
    await expect(canvas).toHaveAttribute("width", width);
    await expect(canvas).toHaveAttribute("height", height);
    await page.goBack();
  });

  test("Downloading asset has succeeded", async ({ page }) => {
    await page.getByLabel("", { exact: true }).check();
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "download Download" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toEqual(jsonName);
    await closeNotification(page);

    await page.getByLabel("edit").locator("svg").click();
    const download1Promise = page.waitForEvent("download");
    await page.getByRole("button", { name: "download Download" }).click();
    const download1 = await download1Promise;
    expect(download1.suggestedFilename()).toEqual(jsonName);
    await closeNotification(page);

    await page.getByLabel("Back").click();
    await page.getByLabel("", { exact: true }).check();
    await page.getByText("Delete").click();
    await closeNotification(page);
  });

  // eslint-disable-next-line playwright/expect-expect
  test("Comment CRUD on edit page has succeeded", async ({ page }) => {
    await page.getByRole("cell", { name: "edit" }).locator("svg").click();
    await page.getByLabel("comment").click();
    await crudComment(page);
  });

  // eslint-disable-next-line playwright/expect-expect
  test("Comment CRUD on Asset page has succeeded", async ({ page }) => {
    await page.getByRole("button", { name: "0" }).click();
    await crudComment(page);
  });
});

test("Previewing png file on modal has succeeded", async ({ page }) => {
  await upload(page, pngUrl);
  await page.getByLabel("edit").locator("svg").click();
  await expect(page.getByText("Asset TypePNG/JPEG/TIFF/GIF")).toBeVisible();
  await page.getByRole("button", { name: "fullscreen" }).click();
  await expect(page.getByRole("img", { name: "asset-preview" })).toBeVisible();
  await page.getByRole("button", { name: "close" }).click();
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe("Zip Upload Tests", () => {
  test("Uploading and auto-unzipping ZIP file from URL succeeds", async ({ page }) => {
    const zipName = "13229_nishitokyo-shi_2022_3dtiles_1_op2_bldg_lod1_index.zip";
    const zipUrl =
      "https://api.cms.plateau.dev.reearth.io/assets/0f/4ba9ed-1a69-4360-b473-5566fc922a4e/" +
      zipName;
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

  test("Uploading and auto-unzipping ZIP file via Local tab (AntD)", async ({ page }) => {
    const zipPath = path.resolve(
      __dirname,
      "../assets/1200773-e122cf709898c09758aecfef349964a8d73a83f3.zip",
    );
    await page.getByRole("button", { name: "upload Upload Asset" }).click();
    await page.getByRole("tab", { name: "Local" }).click();
    const uploadInput = page.locator(".ant-upload input[type='file']");
    await uploadInput.setInputFiles(zipPath);
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
