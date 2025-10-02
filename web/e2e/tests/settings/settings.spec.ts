/* eslint-disable playwright/no-skipped-test */
import { config } from "@reearth-cms/e2e/config/config";
import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { parseConfigBoolean } from "@reearth-cms/e2e/helpers/format.helper";
import { closeNotification } from "@reearth-cms/e2e/helpers/notification.helper";

const disableWorkspaceUI = parseConfigBoolean(config.disableWorkspaceUi);

test.beforeEach(async ({ reearth, workspacePage, settingsPage }) => {
  test.skip(disableWorkspaceUI, "Workspace UI is disabled in this configuration");
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await workspacePage.createWorkspace("e2e workspace name");
  await settingsPage.settingsMenuItem.click();
});

test.afterEach(async ({ workspacePage }) => {
  test.skip(disableWorkspaceUI, "Workspace UI is disabled in this configuration");
  await workspacePage.deleteWorkspace();
});

test("Tiles CRUD has succeeded", async ({ page, settingsPage }) => {
  await settingsPage.addNewTilesButton.click();
  await settingsPage.defaultTileOption.click();
  await settingsPage.labelledTileOption.click();
  await settingsPage.okButton.click();
  await settingsPage.saveButton.click();
  await closeNotification(page);
  await settingsPage.editCardButton.click();
  await expect(settingsPage.textByName("Labelled", true)).toBeVisible();
  await settingsPage
    .locator("div")
    .filter({ hasText: /^Labelled$/ })
    .nth(4)
    .click();
  await settingsPage.urlTileOption.click();
  await settingsPage.nameInput.click();
  await settingsPage.nameInput.fill("url");
  await settingsPage.urlInput.click();
  await settingsPage.urlInput.fill("http://url.com");
  await settingsPage.imageUrlInput.click();
  await settingsPage.imageUrlInput.fill("http://image.com");
  await settingsPage.okButton.click();
  await settingsPage.saveButton.click();
  await closeNotification(page);
  await expect(settingsPage.textByName("url", true)).toBeVisible();
  const targetImageEl = settingsPage.cardMetaAvatarImage;
  await expect(targetImageEl).toHaveAttribute("src", "http://image.com");
  await settingsPage.editCardButton.click();
  await expect(settingsPage.formElement).toContainText("URL");
  await expect(settingsPage.nameInput).toHaveValue("url");
  await expect(settingsPage.urlTextbox).toHaveValue("http://url.com");
  await expect(settingsPage.imageUrlInput).toHaveValue("http://image.com");
  await settingsPage.closeButton.click();
  await settingsPage.deleteCardButton.click();
  await settingsPage.saveButton.click();
  await closeNotification(page);
  await expect(settingsPage.textByName("url", true)).toBeHidden();
});

test("Terrain on/off and CRUD has succeeded", async ({ page, settingsPage }) => {
  await expect(settingsPage.terrainSwitch).toBeEnabled();
  await settingsPage.terrainSwitch.click();
  await expect(settingsPage.terrainSwitch).toHaveAttribute("aria-checked", "true");
  await expect(settingsPage.addTerrainButton).toBeVisible();
  await settingsPage.addTerrainButton.click();
  await settingsPage.cesiumWorldTerrainOption.click();
  await settingsPage.arcGisTerrainOption.click();
  await settingsPage.okButton.click();
  await settingsPage.saveButton.click();
  await closeNotification(page);
  await settingsPage.editIconButton.click();
  await expect(settingsPage.formElement).toContainText("ArcGIS Terrain");
  await settingsPage
    .locator("div")
    .filter({ hasText: /^ArcGIS Terrain$/ })
    .nth(4)
    .click();
  await settingsPage.cesiumIonOption.click();
  await settingsPage.nameInput.click();
  await settingsPage.nameInput.fill("name");
  await settingsPage.terrainAssetIdInput.click();
  await settingsPage.terrainAssetIdInput.fill("id");
  await settingsPage.terrainAccessTokenInput.click();
  await settingsPage.terrainAccessTokenInput.fill("token");
  await settingsPage.terrainUrlInput.click();
  await settingsPage.terrainUrlInput.fill("http://terrain.com");
  await settingsPage.imageUrlInput.click();
  await settingsPage.imageUrlInput.fill("http://image.com");
  await settingsPage.okButton.click();
  await settingsPage.saveButton.click();
  await closeNotification(page);
  await expect(settingsPage.textByName("name", true)).toBeVisible();
  await settingsPage.editIconButton.click();
  await expect(settingsPage.formElement).toContainText("Cesium Ion");
  await expect(settingsPage.nameInput).toHaveValue("name");
  await expect(settingsPage.terrainAssetIdInput).toHaveValue("id");
  await expect(settingsPage.terrainAccessTokenInput).toHaveValue("token");
  await expect(settingsPage.terrainUrlInput).toHaveValue("http://terrain.com");
  await expect(settingsPage.imageUrlInput).toHaveValue("http://image.com");
  await settingsPage.closeButton.click();
  await settingsPage.deleteIconButton.click();
  await settingsPage.saveButton.click();
  await closeNotification(page);
  await expect(settingsPage.textByName("name", true)).toBeHidden();

  await settingsPage.terrainSwitch.click();
  await settingsPage.saveButton.click();
  await closeNotification(page);
  await expect(settingsPage.terrainSwitch).toHaveAttribute("aria-checked", "false");
  await expect(settingsPage.addTerrainButton).toBeHidden();
});

test("Tiles reordering has succeeded", async ({ page, settingsPage }) => {
  await settingsPage.addNewTilesButton.click();
  await settingsPage.okButton.click();
  await settingsPage.addNewTilesButton.click();
  await settingsPage.defaultTileOption.click();
  await settingsPage.labelledTileOption.click();
  await settingsPage.okButton.click();
  await expect(settingsPage.cardByIndex(0)).toHaveText("DEFAULT");
  await expect(settingsPage.cardByIndex(1)).toHaveText("LABELLED");
  await settingsPage.saveButton.click();
  await closeNotification(page);

  await settingsPage.grabbableInCard(0).dragTo(settingsPage.cardByIndex(1));
  await expect(settingsPage.cardByIndex(0)).toHaveText("LABELLED");
  await expect(settingsPage.cardByIndex(1)).toHaveText("DEFAULT");
  await settingsPage.saveButton.click();
  await closeNotification(page);

  await settingsPage.homeMenuItem.click();
  await settingsPage.settingsMenuItem.click();
  await expect(settingsPage.cardByIndex(0)).toHaveText("LABELLED");
  await expect(settingsPage.cardByIndex(1)).toHaveText("DEFAULT");
});

test("Terrain reordering has succeeded", async ({ page, settingsPage }) => {
  await expect(settingsPage.terrainSwitch).toBeEnabled();
  await settingsPage.terrainSwitch.click();
  await expect(settingsPage.terrainSwitch).toHaveAttribute("aria-checked", "true");
  await expect(settingsPage.addTerrainButton).toBeVisible();
  await settingsPage.addTerrainButton.click();
  await settingsPage.okButton.click();
  await settingsPage.addTerrainButton.click();
  await settingsPage.cesiumWorldTerrainDiv.click();
  await settingsPage.arcGisTerrainOption.click();
  await settingsPage.okButton.click();
  await expect(settingsPage.cardByIndex(0)).toHaveText("CESIUM_WORLD_TERRAIN");
  await expect(settingsPage.cardByIndex(1)).toHaveText("ARC_GIS_TERRAIN");
  await settingsPage.saveButton.click();
  await closeNotification(page);

  await settingsPage.grabbableInCard(0).dragTo(settingsPage.cardByIndex(1));
  await expect(settingsPage.cardByIndex(0)).toHaveText("ARC_GIS_TERRAIN");
  await expect(settingsPage.cardByIndex(1)).toHaveText("CESIUM_WORLD_TERRAIN");
  await settingsPage.saveButton.click();
  await closeNotification(page);

  await settingsPage.homeMenuItem.click();
  await settingsPage.settingsMenuItem.click();
  await expect(settingsPage.cardByIndex(0)).toHaveText("ARC_GIS_TERRAIN");
  await expect(settingsPage.cardByIndex(1)).toHaveText("CESIUM_WORLD_TERRAIN");
});
