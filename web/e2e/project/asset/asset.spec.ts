import { test, expect } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/utils/mock";

import { crudComment } from "../utils/comment";

const jsonName = "tileset.json";
const jsonUrl = `https://assets.cms.plateau.reearth.io/assets/11/6d05db-ed47-4f88-b565-9eb385b1ebb0/13100_tokyo23-ku_2022_3dtiles%20_1_1_op_bldg_13101_chiyoda-ku_lod1/${jsonName}`;

const pngName = "road_plan2.png";
const pngUrl = `https://assets.cms.plateau.reearth.io/assets/33/e999c4-7859-446b-ab3c-86625b3c760e/${pngName}`;

test.beforeEach(async ({ reearth, homePage, projectLayoutPage }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await homePage.createProject(getId());
  await projectLayoutPage.navigateToAssets();
});

test.afterEach(async ({ projectLayoutPage, projectSettingsPage }) => {
  await projectLayoutPage.navigateToSettings();
  await projectSettingsPage.deleteProject();
});

test.describe.parallel("Json file tests", () => {
  test.beforeEach(async ({ assetsPage }) => {
    await assetsPage.uploadFromUrl(jsonUrl);
  });

  test("Asset CRUD and Searching has succeeded", async ({ assetsPage }) => {
    await assetsPage.expectAssetVisible(jsonName);
    await assetsPage.searchAssets("no asset");
    await assetsPage.expectAssetHidden(jsonName);
    await assetsPage.clearSearch();
    await assetsPage.expectAssetVisible(jsonName);
    await assetsPage.openAssetDetails(jsonName);
    await expect(assetsPage.getByText(`Asset / ${jsonName}`)).toBeVisible();
    await assetsPage.goBack();
    await assetsPage.selectAsset(jsonName);
    await assetsPage.deleteSelectedAssets();
    await assetsPage.expectAssetHidden(jsonName);
  });

  test("Previewing json file by full screen has succeeded", async ({ assetsPage, page }) => {
    await assetsPage.openAssetDetails(jsonName);
    await assetsPage.changeAssetType("GEOJSON/KML/CZML");

    const viewportSizeGet = () => {
      const viewportSize = page.viewportSize();
      expect(viewportSize).toBeTruthy();
      return {
        width: (viewportSize as { width: number; height: number }).width.toString(),
        height: (viewportSize as { width: number; height: number }).height.toString(),
      };
    };
    const { width, height } = viewportSizeGet();
    await assetsPage.expectCanvasNotFullscreen(width);
    await expect(assetsPage.getCanvas()).not.toHaveAttribute("height", height);
    await assetsPage.openFullscreenPreview();
    await assetsPage.expectCanvasFullscreen(width, height);
    await assetsPage.closeFullscreenPreview();
  });

  test("Downloading asset has succeeded", async ({ assetsPage }) => {
    await assetsPage.selectAsset(jsonName);
    const download = await assetsPage.downloadSelectedAssets();
    expect(download.suggestedFilename()).toEqual(jsonName);

    await assetsPage.openAssetDetails(jsonName);
    const download1 = await assetsPage.downloadAssetFromDetails();
    expect(download1.suggestedFilename()).toEqual(jsonName);

    await assetsPage.goBack();
    await assetsPage.selectAsset(jsonName);
    await assetsPage.deleteSelectedAssets();
  });

  // eslint-disable-next-line playwright/expect-expect
  test("Comment CRUD on edit page has succeeded", async ({ assetsPage, page }) => {
    await assetsPage.openAssetDetails(jsonName);
    await assetsPage.openCommentPanel();
    await crudComment(page);
  });

  // eslint-disable-next-line playwright/expect-expect
  test("Comment CRUD on Asset page has succeeded", async ({ assetsPage, page }) => {
    await assetsPage.clickCommentsCount();
    await crudComment(page);
  });
});

test("Previewing png file on modal has succeeded", async ({ assetsPage }) => {
  await assetsPage.uploadFromUrl(pngUrl);
  await assetsPage.openAssetDetails(pngName);
  await assetsPage.expectAssetType("PNG/JPEG/TIFF/GIF");
  await assetsPage.openFullscreenPreview();
  await expect(assetsPage.getByRole("img", { name: "asset-preview" })).toBeVisible();
  await assetsPage.getByRole("button", { name: "close" }).click();
});
