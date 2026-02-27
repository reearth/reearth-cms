import { config } from "@reearth-cms/e2e/config/config";
import { expect, TAG, test } from "@reearth-cms/e2e/fixtures/test";
import { parseConfigBoolean } from "@reearth-cms/e2e/helpers/format.helper";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";

const disableWorkspaceUI = parseConfigBoolean(config.disableWorkspaceUi);

let workspaceName: string;
test.beforeEach(async ({ workspacePage, settingsPage }) => {
  test.skip(disableWorkspaceUI, "Workspace UI is disabled in this configuration");
  await settingsPage.goto("/");
  workspaceName = getId();
  await workspacePage.createWorkspace(workspaceName);
  await settingsPage.settingsMenuItem.click();
});

test.afterEach(async ({ workspacePage }) => {
  test.skip(disableWorkspaceUI, "Workspace UI is disabled in this configuration");
  await workspacePage.deleteWorkspace();
});

test(
  "Tiles CRUD has succeeded",
  {
    tag: TAG.TO_ABANDON,
    annotation: {
      type: "consolidate",
      description:
        "Settings/index.test.tsx (component) + settings.spec.ts reordering tests (E2E persistence)",
    },
  },
  async ({ settingsPage }) => {
    await test.step("Create new tile with 'Labelled' type", async () => {
      await expect(settingsPage.addNewTilesButton).toBeVisible();
      await settingsPage.addNewTilesButton.click();
      await expect(settingsPage.defaultTileOption).toBeVisible();
      await settingsPage.defaultTileOption.click();
      await expect(settingsPage.labelledTileOption).toBeVisible();
      await settingsPage.labelledTileOption.click();
      await expect(settingsPage.okButton).toBeVisible();
      await settingsPage.okButton.click();
      await expect(settingsPage.saveButton).toBeVisible();
      await settingsPage.saveButton.click();
      await settingsPage.closeNotification();
    });

    await test.step("Update tile to 'URL' type with custom values", async () => {
      await expect(settingsPage.editCardButton).toBeVisible();
      await settingsPage.editCardButton.click();
      await expect(settingsPage.formElement.getByText("Labelled", { exact: true })).toBeVisible();
      await expect(settingsPage.labelledTileDiv).toBeVisible();
      await settingsPage.labelledTileDiv.click();
      await expect(settingsPage.urlTileOption).toBeVisible();
      await settingsPage.urlTileOption.click();
      await settingsPage.nameInput.click();
      await settingsPage.nameInput.fill("url");
      await settingsPage.urlInput.click();
      await settingsPage.urlInput.fill("http://url.com");
      await settingsPage.imageUrlInput.click();
      await settingsPage.imageUrlInput.fill("http://image.com");
      await expect(settingsPage.okButton).toBeVisible();
      await settingsPage.okButton.click();
      await expect(settingsPage.saveButton).toBeVisible();
      await settingsPage.saveButton.click();
      await settingsPage.closeNotification();
    });

    await test.step("Verify tile updated with correct values", async () => {
      await expect(settingsPage.textByName("url", true)).toBeVisible();
      const targetImageEl = settingsPage.cardMetaAvatarImage;
      await expect(targetImageEl).toHaveAttribute("src", "http://image.com");
      await expect(settingsPage.editCardButton).toBeVisible();
      await settingsPage.editCardButton.click();
      await expect(settingsPage.formElement).toContainText("URL");
      await expect(settingsPage.nameInput).toHaveValue("url");
      await expect(settingsPage.formElement.getByLabel("URL", { exact: true })).toHaveValue(
        "http://url.com",
      );
      await expect(settingsPage.imageUrlInput).toHaveValue("http://image.com");
      await expect(settingsPage.closeButton).toBeVisible();
      await settingsPage.closeButton.click();
    });

    await test.step("Delete tile", async () => {
      await expect(settingsPage.deleteCardButton).toBeVisible();
      await settingsPage.deleteCardButton.click();
      await expect(settingsPage.saveButton).toBeVisible();
      await settingsPage.saveButton.click();
      await settingsPage.closeNotification();
      await expect(settingsPage.textByName("url", true)).toBeHidden();
    });
  },
);

test(
  "Terrain on/off and CRUD has succeeded",
  {
    tag: TAG.TO_ABANDON,
    annotation: {
      type: "consolidate",
      description:
        "Settings/index.test.tsx (component) + settings.spec.ts reordering tests (E2E persistence)",
    },
  },
  async ({ settingsPage }) => {
    await test.step("Enable terrain and add 'ArcGIS Terrain' type", async () => {
      await expect(settingsPage.terrainSwitch).toBeEnabled();
      await settingsPage.terrainSwitch.click();
      await expect(settingsPage.terrainSwitch).toHaveAttribute("aria-checked", "true");
      await expect(settingsPage.addTerrainButton).toBeVisible();
      await settingsPage.addTerrainButton.click();
      await settingsPage.cesiumWorldTerrainOption.click();
      await settingsPage.arcGisTerrainOption.click();
      await settingsPage.okButton.click();
      await settingsPage.saveButton.click();
      await settingsPage.closeNotification();
    });

    await test.step("Update terrain to 'Cesium Ion' type with custom values", async () => {
      await settingsPage.editIconButton.click();
      await expect(settingsPage.formElement).toContainText("ArcGIS Terrain");
      await settingsPage.arcGisTerrainDiv.click();
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
      await settingsPage.closeNotification();
    });

    await test.step("Verify terrain updated with correct values", async () => {
      await expect(settingsPage.textByName("name", true)).toBeVisible();
      await settingsPage.editIconButton.click();
      await expect(settingsPage.formElement).toContainText("Cesium Ion");
      await expect(settingsPage.nameInput).toHaveValue("name");
      await expect(settingsPage.terrainAssetIdInput).toHaveValue("id");
      await expect(settingsPage.terrainAccessTokenInput).toHaveValue("token");
      await expect(settingsPage.terrainUrlInput).toHaveValue("http://terrain.com");
      await expect(settingsPage.imageUrlInput).toHaveValue("http://image.com");
      await settingsPage.closeButton.click();
    });

    await test.step("Delete terrain", async () => {
      await settingsPage.deleteIconButton.click();
      await settingsPage.saveButton.click();
      await settingsPage.closeNotification();
      await expect(settingsPage.textByName("name", true)).toBeHidden();
    });

    await test.step("Disable terrain and verify UI updated", async () => {
      await settingsPage.terrainSwitch.click();
      await settingsPage.saveButton.click();
      await settingsPage.closeNotification();
      await expect(settingsPage.terrainSwitch).toHaveAttribute("aria-checked", "false");
      await expect(settingsPage.addTerrainButton).toBeHidden();
    });
  },
);

test("Tiles reordering has succeeded", async ({ settingsPage }) => {
  await test.step("Create two tiles and verify initial order", async () => {
    await settingsPage.addNewTilesButton.click();
    await settingsPage.okButton.click();
    await settingsPage.addNewTilesButton.click();
    await settingsPage.defaultTileOption.click();
    await settingsPage.labelledTileOption.click();
    await settingsPage.okButton.click();
    await expect(settingsPage.cardByIndex(0)).toHaveText("DEFAULT");
    await expect(settingsPage.cardByIndex(1)).toHaveText("LABELLED");
    await settingsPage.saveButton.click();
    await settingsPage.closeNotification();
  });

  await test.step("Drag first tile below second tile and verify order", async () => {
    await settingsPage.grabbableInCard(0).dragTo(settingsPage.cardByIndex(1));
    await expect(settingsPage.cardByIndex(0)).toHaveText("LABELLED");
    await expect(settingsPage.cardByIndex(1)).toHaveText("DEFAULT");
    await settingsPage.saveButton.click();
    await settingsPage.closeNotification();
  });

  await test.step("Verify tile order persists after navigation", async () => {
    await settingsPage.homeMenuItem.click();
    await settingsPage.settingsMenuItem.click();
    await expect(settingsPage.cardByIndex(0)).toHaveText("LABELLED");
    await expect(settingsPage.cardByIndex(1)).toHaveText("DEFAULT");
  });
});

test("Terrain reordering has succeeded", async ({ settingsPage }) => {
  await test.step("Enable terrain and create two terrain items", async () => {
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
    await settingsPage.closeNotification();
  });

  await test.step("Drag first terrain below second terrain and verify order", async () => {
    await settingsPage.grabbableInCard(0).dragTo(settingsPage.cardByIndex(1));
    await expect(settingsPage.cardByIndex(0)).toHaveText("ARC_GIS_TERRAIN");
    await expect(settingsPage.cardByIndex(1)).toHaveText("CESIUM_WORLD_TERRAIN");
    await settingsPage.saveButton.click();
    await settingsPage.closeNotification();
  });

  await test.step("Verify terrain order persists after navigation", async () => {
    await settingsPage.homeMenuItem.click();
    await settingsPage.settingsMenuItem.click();
    await expect(settingsPage.cardByIndex(0)).toHaveText("ARC_GIS_TERRAIN");
    await expect(settingsPage.cardByIndex(1)).toHaveText("CESIUM_WORLD_TERRAIN");
  });
});
