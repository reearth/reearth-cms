import { expect, TAG, test } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";

const jsonName = "tileset.json";
const jsonUrl = `https://assets.cms.plateau.reearth.io/assets/11/6d05db-ed47-4f88-b565-9eb385b1ebb0/13100_tokyo23-ku_2022_3dtiles%20_1_1_op_bldg_13101_chiyoda-ku_lod1/${jsonName}`;

const pngName = "road_plan2.png";
const pngUrl = `https://assets.cms.plateau.reearth.io/assets/33/e999c4-7859-446b-ab3c-86625b3c760e/${pngName}`;

test.beforeEach(async ({ projectPage }) => {
  await projectPage.goto("/");
  const projectName = getId();
  await projectPage.createProject(projectName);
  await projectPage.gotoProject(projectName);
  await projectPage.assetMenuItem.click();
});

test.afterEach(async ({ projectPage }) => {
  await projectPage.deleteProject();
});

test.describe("Json file tests", () => {
  test.beforeEach(async ({ assetsPage }) => {
    await assetsPage.uploadViaUrl(jsonUrl);
  });

  test("Asset CRUD and Searching has succeeded", { tag: TAG.SMOKE }, async ({ assetsPage }) => {
    await expect(assetsPage.rowByText(jsonName)).toBeVisible();

    // search no result
    await assetsPage.searchInput.fill("no asset");
    await assetsPage.searchButton.click();
    await expect(assetsPage.rowByText(jsonName)).toBeHidden();

    // clear search
    await assetsPage.searchInput.fill("");
    await assetsPage.searchButton.click();
    await expect(assetsPage.rowByText(jsonName)).toBeVisible();

    // open details
    await assetsPage.editIconButton.click();
    await expect(assetsPage.assetDetailHeading(jsonName)).toBeVisible();

    // back to list
    await assetsPage.backButton.click();

    // select + delete
    await assetsPage.selectAssetCheckbox.check();
    await assetsPage.deleteButton.click();
    await expect(assetsPage.rowByText(jsonName)).toBeHidden();
    await assetsPage.closeNotification();
  });

  test("Previewing json file by full screen has succeeded", async ({ assetsPage }) => {
    await assetsPage.editIconButton.click();

    // change type
    await assetsPage.typeSelectTrigger.click();
    await assetsPage.typeOption("GEOJSON/KML/CZML").click();
    await assetsPage.saveButton.click();
    await assetsPage.closeNotification();

    // Cesium canvas is rendered (attached to DOM) but Playwright considers it
    // hidden because the WebGL canvas is not passing visibility checks.
    await expect(assetsPage.canvas).toBeAttached();

    // Fullscreen button is clickable
    await expect(assetsPage.fullscreenButton).toBeVisible();
    await assetsPage.fullscreenButton.click();

    // The browser Fullscreen API (canvas.requestFullscreen()) does not work
    // in headless Chromium, so we only assert canvas dimensions when
    // fullscreen actually engaged.
    const isFullscreen = await assetsPage.evaluate(() => document.fullscreenElement !== null);
    if (isFullscreen) {
      const viewportSize = assetsPage.viewportSize();
      expect(viewportSize).toBeTruthy();
      await expect(assetsPage.canvas).toHaveAttribute("width", String(viewportSize?.width));
      await expect(assetsPage.canvas).toHaveAttribute("height", String(viewportSize?.height));
    }

    await assetsPage.goBack();
  });

  test("Downloading asset has succeeded", async ({ assetsPage }) => {
    // select + bulk download
    await assetsPage.selectAssetCheckbox.check();
    const bulkDownload = assetsPage.waitForDownload();
    await assetsPage.downloadButton.click();
    const d1 = await bulkDownload;
    expect(d1.suggestedFilename()).toEqual(jsonName);
    await assetsPage.closeNotification();

    // details download
    await assetsPage.editIconButton.click();
    const detailsDownload = assetsPage.waitForDownload();
    await assetsPage.downloadButton.click();
    const d2 = await detailsDownload;
    expect(d2.suggestedFilename()).toEqual(jsonName);
    await assetsPage.closeNotification();

    // cleanup
    await assetsPage.backButton.click();
    await assetsPage.selectAssetCheckbox.check();
    await assetsPage.deleteButton.click();
    await assetsPage.closeNotification();
  });

  test("Comment CRUD on edit page has succeeded", async ({ assetsPage, contentPage }) => {
    await assetsPage.editIconButton.click();
    await assetsPage.commentButton.click();
    await contentPage.createComment("comment");
    await contentPage.updateComment("comment", "new comment");
    await contentPage.deleteComment();
  });

  test("Comment CRUD on Asset page has succeeded", async ({ assetsPage, contentPage }) => {
    await assetsPage.commentsCountButton(0).click();
    await contentPage.createComment("comment");
    await contentPage.updateComment("comment", "new comment");
    await contentPage.deleteComment();
  });
});

test("Previewing png file on modal has succeeded", async ({ assetsPage }) => {
  await test.step("Upload PNG file via URL", async () => {
    await assetsPage.uploadViaUrl(pngUrl);
  });

  await test.step("Open asset editor and verify asset type", async () => {
    await expect(assetsPage.editIconButton).toBeVisible();
    await assetsPage.editIconButton.click();
    await expect(assetsPage.assetTypeText).toBeVisible();
  });

  await test.step("Open fullscreen preview and verify image", async () => {
    await expect(assetsPage.fullscreenButton).toBeVisible();
    await assetsPage.fullscreenButton.click();
    await expect(assetsPage.imagePreview).toBeVisible();
  });

  await test.step("Close fullscreen preview", async () => {
    await expect(assetsPage.fullscreenCloseButton).toBeVisible();
    await assetsPage.fullscreenCloseButton.click();
  });
});
