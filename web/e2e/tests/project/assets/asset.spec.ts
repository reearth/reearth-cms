import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";

const jsonName = "tileset.json";
const jsonUrl = `https://assets.cms.plateau.reearth.io/assets/11/6d05db-ed47-4f88-b565-9eb385b1ebb0/13100_tokyo23-ku_2022_3dtiles%20_1_1_op_bldg_13101_chiyoda-ku_lod1/${jsonName}`;

const pngName = "road_plan2.png";
const pngUrl = `https://assets.cms.plateau.reearth.io/assets/33/e999c4-7859-446b-ab3c-86625b3c760e/${pngName}`;

test.beforeEach(async ({ reearth, projectPage }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  const projectName = getId();
  await projectPage.createProject(projectName);
  await projectPage.gotoProject(projectName);
  await projectPage.assetMenuItem.click();
});

test.afterEach(async ({ projectPage }) => {
  await projectPage.deleteProject();
});

test.describe.parallel("Json file tests", () => {
  test.beforeEach(async ({ assetsPage }) => {
    await assetsPage.uploadViaUrl(jsonUrl);
  });

  test("Asset CRUD and Searching has succeeded", async ({ assetsPage }) => {
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

  test("Previewing json file by full screen has succeeded", async ({ page, assetsPage }) => {
    await assetsPage.editIconButton.click();

    // change type
    await assetsPage.typeSelectTrigger.click();
    await assetsPage.typeOption("GEOJSON/KML/CZML").click();
    await assetsPage.saveButton.click();
    await assetsPage.closeNotification();

    // viewport dims
    const viewportSize = page.viewportSize();
    expect(viewportSize).toBeTruthy();
    const width = String(viewportSize?.width);
    const height = String(viewportSize?.height);

    // canvas not fullscreen
    await expect(assetsPage.canvas).not.toHaveAttribute("width", width);
    await expect(assetsPage.canvas).not.toHaveAttribute("height", height);

    // fullscreen
    await assetsPage.fullscreenButton.click();
    await expect(assetsPage.canvas).toHaveAttribute("width", width);
    await expect(assetsPage.canvas).toHaveAttribute("height", height);

    // exit via browser back (same as your original)
    await page.goBack();
  });

  test("@smoke Downloading asset has succeeded", async ({ page, assetsPage }) => {
    // select + bulk download
    await assetsPage.selectAssetCheckbox.check();
    const bulkDownload = page.waitForEvent("download");
    await assetsPage.downloadButton.click();
    const d1 = await bulkDownload;
    expect(d1.suggestedFilename()).toEqual(jsonName);
    await assetsPage.closeNotification();

    // details download
    await assetsPage.editIconButton.click();
    const detailsDownload = page.waitForEvent("download");
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

  test("@smoke Comment CRUD on edit page has succeeded", async ({ assetsPage, contentPage }) => {
    await assetsPage.editIconButton.click();
    await assetsPage.commentButton.click();
    await contentPage.createComment("comment");
    await contentPage.updateComment("comment", "new comment");
    await contentPage.deleteComment();
  });

  test("@smoke Comment CRUD on Asset page has succeeded", async ({ assetsPage, contentPage }) => {
    await assetsPage.commentsCountButton(0).click();
    await contentPage.createComment("comment");
    await contentPage.updateComment("comment", "new comment");
    await contentPage.deleteComment();
  });
});

test("@smoke Previewing png file on modal has succeeded", async ({ assetsPage }) => {
  await assetsPage.uploadViaUrl(pngUrl);

  await assetsPage.editIconButton.click();
  await expect(assetsPage.assetTypeText).toBeVisible();

  await assetsPage.fullscreenButton.click();
  await expect(assetsPage.imagePreview).toBeVisible();

  await assetsPage.fullscreenCloseButton.click();
});
