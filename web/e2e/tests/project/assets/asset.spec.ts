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

test.describe("Json file tests", () => {
  test.beforeEach(async ({ assetsPage }) => {
    await assetsPage.uploadViaUrl(jsonUrl);
  });

  test("Asset CRUD and Searching has succeeded", async ({ assetsPage, page }) => {
    await test.step("Verify asset is visible in list", async () => {
      await expect(assetsPage.rowByText(jsonName)).toBeVisible();
    });

    await test.step("Search for non-existent asset", async () => {
      await assetsPage.searchInput.fill("no asset");
      await assetsPage.searchButton.click();
      await page.waitForTimeout(300);
      await expect(assetsPage.rowByText(jsonName)).toBeHidden();
    });

    await test.step("Clear search and verify asset reappears", async () => {
      await assetsPage.searchInput.fill("");
      await assetsPage.searchButton.click();
      await page.waitForTimeout(300);
      await expect(assetsPage.rowByText(jsonName)).toBeVisible();
    });

    await test.step("Open asset details", async () => {
      await assetsPage.editIconButton.click();
      await page.waitForTimeout(300);
      await expect(assetsPage.assetDetailHeading(jsonName)).toBeVisible();
    });

    await test.step("Navigate back to asset list", async () => {
      await assetsPage.backButton.click();
      await page.waitForTimeout(300);
    });

    await test.step("Select and delete asset", async () => {
      await assetsPage.selectAssetCheckbox.click();
      await assetsPage.deleteButton.click();
      await page.waitForTimeout(300);
      await expect(assetsPage.rowByText(jsonName)).toBeHidden();
      await assetsPage.closeNotification();
      await page.waitForTimeout(300);
    });
  });

  test("Previewing json file by full screen has succeeded", async ({ page, assetsPage }) => {
    await test.step("Open asset editor and change asset type", async () => {
      await assetsPage.editIconButton.click();
      await page.waitForTimeout(300);

      await assetsPage.typeSelectTrigger.click();
      await assetsPage.typeOption("GEOJSON/KML/CZML").click();
      await assetsPage.saveButton.click();
      await assetsPage.closeNotification();
      await page.waitForTimeout(300);
    });

    await test.step("Verify canvas is not fullscreen initially", async () => {
      const viewportSize = page.viewportSize();
      expect(viewportSize).toBeTruthy();
      const width = String(viewportSize?.width);
      const height = String(viewportSize?.height);

      await expect(assetsPage.canvas).not.toHaveAttribute("width", width);
      await expect(assetsPage.canvas).not.toHaveAttribute("height", height);
    });

    await test.step("Enter fullscreen mode and verify canvas dimensions", async () => {
      const viewportSize = page.viewportSize();
      const width = String(viewportSize?.width);
      const height = String(viewportSize?.height);

      await assetsPage.fullscreenButton.click();
      await page.waitForTimeout(300);
      await expect(assetsPage.canvas).toHaveAttribute("width", width);
      await expect(assetsPage.canvas).toHaveAttribute("height", height);
    });

    await test.step("Exit fullscreen via browser back", async () => {
      await page.goBack();
      await page.waitForTimeout(300);
    });
  });

  test("Downloading asset has succeeded", async ({ page, assetsPage }) => {
    await test.step("Bulk download asset from list", async () => {
      await assetsPage.selectAssetCheckbox.click();
      const bulkDownload = page.waitForEvent("download");
      await assetsPage.downloadButton.click();
      const d1 = await bulkDownload;
      expect(d1.suggestedFilename()).toEqual(jsonName);
      await assetsPage.closeNotification();
      await page.waitForTimeout(300);
    });

    await test.step("Download asset from details page", async () => {
      await assetsPage.editIconButton.click();
      await page.waitForTimeout(300);
      const detailsDownload = page.waitForEvent("download");
      await assetsPage.downloadButton.click();
      const d2 = await detailsDownload;
      expect(d2.suggestedFilename()).toEqual(jsonName);
      await assetsPage.closeNotification();
      await page.waitForTimeout(300);
    });

    await test.step("Clean up: delete asset", async () => {
      await assetsPage.backButton.click();
      await page.waitForTimeout(300);
      await assetsPage.selectAssetCheckbox.click();
      await assetsPage.deleteButton.click();
      await assetsPage.closeNotification();
      await page.waitForTimeout(300);
    });
  });

  test("Comment CRUD on edit page has succeeded", async ({ assetsPage, contentPage, page }) => {
    await test.step("Open asset editor and comment panel", async () => {
      await assetsPage.editIconButton.click();
      await page.waitForTimeout(300);
      await assetsPage.commentButton.click();
      await page.waitForTimeout(300);
    });

    await test.step("Create comment", async () => {
      await contentPage.createComment("comment");
    });

    await test.step("Update comment", async () => {
      await contentPage.updateComment("comment", "new comment");
    });

    await test.step("Delete comment", async () => {
      await contentPage.deleteComment();
    });
  });

  test("Comment CRUD on Asset page has succeeded", async ({ assetsPage, contentPage, page }) => {
    await test.step("Open comment panel from asset list", async () => {
      await assetsPage.commentsCountButton(0).click();
      await page.waitForTimeout(300);
    });

    await test.step("Create comment", async () => {
      await contentPage.createComment("comment");
    });

    await test.step("Update comment", async () => {
      await contentPage.updateComment("comment", "new comment");
    });

    await test.step("Delete comment", async () => {
      await contentPage.deleteComment();
    });
  });
});

test("Previewing png file on modal has succeeded", async ({ assetsPage, page }) => {
  await test.step("Upload PNG file via URL", async () => {
    await assetsPage.uploadViaUrl(pngUrl);
    await page.waitForTimeout(300);
  });

  await test.step("Open asset editor and verify asset type", async () => {
    await expect(assetsPage.editIconButton).toBeVisible();
    await assetsPage.editIconButton.click();
    await expect(assetsPage.assetTypeText).toBeVisible();
    await page.waitForTimeout(300);
  });

  await test.step("Open fullscreen preview and verify image", async () => {
    await expect(assetsPage.fullscreenButton).toBeVisible();
    await assetsPage.fullscreenButton.click();
    await page.waitForTimeout(300);
    await expect(assetsPage.imagePreview).toBeVisible();
    await page.waitForTimeout(300);
  });

  await test.step("Close fullscreen preview", async () => {
    await expect(assetsPage.fullscreenCloseButton).toBeVisible();
    await assetsPage.fullscreenCloseButton.click();
    await page.waitForTimeout(300);
  });
});
