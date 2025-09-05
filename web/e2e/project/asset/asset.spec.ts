import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { Page, expect, test } from "@reearth-cms/e2e/fixtures/test";
import { AssetsPage } from "@reearth-cms/e2e/pages/assets.page";

import { crudComment } from "../utils/comment";
import { createProject, deleteProject } from "../utils/project";

const jsonName = "tileset.json";
const jsonUrl = `https://assets.cms.plateau.reearth.io/assets/11/6d05db-ed47-4f88-b565-9eb385b1ebb0/13100_tokyo23-ku_2022_3dtiles%20_1_1_op_bldg_13101_chiyoda-ku_lod1/${jsonName}`;

const pngName = "road_plan2.png";
const pngUrl = `https://assets.cms.plateau.reearth.io/assets/33/e999c4-7859-446b-ab3c-86625b3c760e/${pngName}`;

async function uploadViaUrl(
  page: Page,
  assetsPage: AssetsPage,
  url: string,
  { autoUnzip = false } = {},
) {
  await assetsPage.uploadButton.click();
  await assetsPage.urlTab.click();
  await assetsPage.urlInput.fill(url);
  if (autoUnzip) await assetsPage.autoUnzipCheckbox.setChecked(true);
  await assetsPage.submitUploadButton.click();
  await closeNotification(page);
}

test.beforeEach(async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
  await page.getByRole("menuitem", { name: "Asset" }).click();
});

test.afterEach(async ({ page }) => {
  await deleteProject(page);
});

test.describe.parallel("Json file tests", () => {
  test.beforeEach(async ({ page, assetsPage }) => {
    await uploadViaUrl(page, assetsPage, jsonUrl);
  });

  test("Asset CRUD and Searching has succeeded", async ({ page, assetsPage }) => {
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
    await expect(page.getByText(`Asset / ${jsonName}`)).toBeVisible();

    // back to list
    await assetsPage.backButton.click();

    // select + delete
    await assetsPage.selectAssetCheckbox.check();
    await assetsPage.deleteButton.click();

    await expect(assetsPage.rowByText(jsonName)).toBeHidden();
    await closeNotification(page);
  });

  test("Previewing json file by full screen has succeeded", async ({ page, assetsPage }) => {
    await assetsPage.editIconButton.click();

    // change type
    await assetsPage.typeSelectTrigger.click();
    await assetsPage.typeOption("GEOJSON/KML/CZML").click();
    await assetsPage.saveButton.click();
    await closeNotification(page);

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

  test("Downloading asset has succeeded", async ({ page, assetsPage }) => {
    // select + bulk download
    await assetsPage.selectAssetCheckbox.check();
    const bulkDownload = page.waitForEvent("download");
    await assetsPage.downloadButton.click();
    const d1 = await bulkDownload;
    expect(d1.suggestedFilename()).toEqual(jsonName);
    await closeNotification(page);

    // details download
    await assetsPage.editIconButton.click();
    const detailsDownload = page.waitForEvent("download");
    await assetsPage.downloadButton.click();
    const d2 = await detailsDownload;
    expect(d2.suggestedFilename()).toEqual(jsonName);
    await closeNotification(page);

    // cleanup
    await assetsPage.backButton.click();
    await assetsPage.selectAssetCheckbox.check();
    await assetsPage.deleteButton.click();
    await closeNotification(page);
  });

  // eslint-disable-next-line playwright/expect-expect
  test("Comment CRUD on edit page has succeeded", async ({ page, assetsPage }) => {
    await assetsPage.editIconButton.click();
    await assetsPage.commentButton.click();
    await crudComment(page);
  });

  // eslint-disable-next-line playwright/expect-expect
  test("Comment CRUD on Asset page has succeeded", async ({ page, assetsPage }) => {
    await assetsPage.commentsCountButton(0).click();
    await crudComment(page);
  });
});

test("Previewing png file on modal has succeeded", async ({ page, assetsPage }) => {
  await uploadViaUrl(page, assetsPage, pngUrl);

  await assetsPage.editIconButton.click();
  await expect(page.getByText("Asset TypePNG/JPEG/TIFF/GIF")).toBeVisible();

  await assetsPage.fullscreenButton.click();
  await expect(assetsPage.imagePreview).toBeVisible();

  await assetsPage.fullscreenCloseButton.click();
});
