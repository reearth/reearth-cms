import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { parseConfigBoolean } from "@reearth-cms/utils/format";

import { config } from "../utils/config";

const disableWorkspaceUI = parseConfigBoolean(config.disableWorkspaceUi);

test.beforeEach(async ({ reearth, workspacePage }) => {
  // eslint-disable-next-line playwright/no-skipped-test
  test.skip(disableWorkspaceUI, "Workspace UI is disabled in this configuration");

  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await workspacePage.createWorkspace();
  await workspacePage.getByText("Settings").click();
});

test.afterEach(async ({ workspacePage }) => {
  // eslint-disable-next-line playwright/no-skipped-test
  test.skip(disableWorkspaceUI, "Workspace UI is disabled in this configuration");

  await workspacePage.deleteWorkspace();
});

test("Tiles CRUD has succeeded", async ({ page, settingsPage }) => {
  // Add Labelled tile option
  await settingsPage.addTilesOption("Labelled");
  await settingsPage.saveTileSettings();

  // Verify and edit tile option
  await settingsPage.editTileOption(-1); // Edit last option
  await expect(page.getByText("Labelled", { exact: true })).toBeVisible();

  // Configure tile URL
  await settingsPage.configureTileUrl("url", "http://url.com", "http://image.com");
  await settingsPage.saveTileSettings();

  // Verify tile configuration
  await expect(settingsPage.getByText("url", { exact: true })).toBeVisible();
  const targetImageEl = settingsPage.locator(".ant-card-body .ant-card-meta-avatar > img");
  await expect(targetImageEl).toHaveAttribute("src", "http://image.com");

  // Verify edit form values
  await settingsPage.editTileOption(-1);
  await expect(page.locator("form")).toContainText("URL");
  await expect(page.getByLabel("Name")).toHaveValue("url");
  await expect(page.getByLabel("URL", { exact: true })).toHaveValue("http://url.com");
  await expect(page.getByLabel("Image URL")).toHaveValue("http://image.com");
  await page.getByLabel("Close", { exact: true }).first().click();

  // Delete tile option
  await settingsPage.deleteTileOption(-1);
  await settingsPage.saveTileSettings();
  await expect(settingsPage.getByText("url", { exact: true })).toBeHidden();
});

test("Terrain on/off and CRUD has succeeded", async ({ page }) => {
  await expect(page.getByRole("switch")).toBeEnabled();
  await page.getByRole("switch").click();
  await expect(page.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  await expect(page.getByRole("button", { name: "plus Add new Terrain option" })).toBeVisible();
  await page.getByRole("button", { name: "plus Add new Terrain option" }).click();
  await page
    .locator("div")
    .filter({ hasText: /^Cesium World Terrain$/ })
    .nth(4)
    .click();
  await page.getByTitle("ArcGIS Terrain").click();
  await page.getByRole("button", { name: "OK" }).click();
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("edit").locator("svg").click();
  await expect(page.locator("form")).toContainText("ArcGIS Terrain");
  await page
    .locator("div")
    .filter({ hasText: /^ArcGIS Terrain$/ })
    .nth(4)
    .click();
  await page.getByTitle("Cesium Ion").click();
  await page.getByLabel("Name").click();
  await page.getByLabel("Name").fill("name");
  await page.getByLabel("Terrain Cesium Ion asset ID").click();
  await page.getByLabel("Terrain Cesium Ion asset ID").fill("id");
  await page.getByLabel("Terrain Cesium Ion access").click();
  await page.getByLabel("Terrain Cesium Ion access").fill("token");
  await page.getByLabel("Terrain URL").click();
  await page.getByLabel("Terrain URL").fill("http://terrain.com");
  await page.getByLabel("Image URL").click();
  await page.getByLabel("Image URL").fill("http://image.com");
  await page.getByRole("button", { name: "OK" }).click();
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await expect(page.getByText("name", { exact: true })).toBeVisible();
  await page.getByLabel("edit").locator("svg").click();
  await expect(page.locator("form")).toContainText("Cesium Ion");
  await expect(page.getByLabel("Name")).toHaveValue("name");
  await expect(page.getByLabel("Terrain Cesium Ion asset ID")).toHaveValue("id");
  await expect(page.getByLabel("Terrain Cesium Ion access")).toHaveValue("token");
  await expect(page.getByLabel("Terrain URL")).toHaveValue("http://terrain.com");
  await expect(page.getByLabel("Image URL")).toHaveValue("http://image.com");
  await page.getByLabel("Close", { exact: true }).first().click();
  await page.getByLabel("delete").locator("svg").click();
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await expect(page.getByText("name", { exact: true })).toBeHidden();

  await page.getByRole("switch").click();
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await expect(page.getByRole("switch")).toHaveAttribute("aria-checked", "false");
  await expect(page.getByRole("button", { name: "plus Add new Terrain option" })).toBeHidden();
});

test("Tiles reordering has succeeded", async ({ page }) => {
  await page.getByRole("button", { name: "plus Add new Tiles option" }).click();
  await page.getByRole("button", { name: "OK" }).click();
  await page.getByRole("button", { name: "plus Add new Tiles option" }).click();
  await page
    .locator("div")
    .filter({ hasText: /^Default$/ })
    .nth(4)
    .click();
  await page.getByTitle("Labelled").click();
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.locator(".ant-card").nth(0)).toHaveText("DEFAULT");
  await expect(page.locator(".ant-card").nth(1)).toHaveText("LABELLED");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);

  await page
    .locator(".ant-card")
    .nth(0)
    .locator(".grabbable")
    .dragTo(page.locator(".ant-card").nth(1));
  await expect(page.locator(".ant-card").nth(0)).toHaveText("LABELLED");
  await expect(page.locator(".ant-card").nth(1)).toHaveText("DEFAULT");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);

  await page.getByText("Home").click();
  await page.getByText("Settings").click();
  await expect(page.locator(".ant-card").nth(0)).toHaveText("LABELLED");
  await expect(page.locator(".ant-card").nth(1)).toHaveText("DEFAULT");
});

test("Terrain reordering has succeeded", async ({ page }) => {
  await expect(page.getByRole("switch")).toBeEnabled();
  await page.getByRole("switch").click();
  await expect(page.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  await expect(page.getByRole("button", { name: "plus Add new Terrain option" })).toBeVisible();
  await page.getByRole("button", { name: "plus Add new Terrain option" }).click();
  await page.getByRole("button", { name: "OK" }).click();
  await page.getByRole("button", { name: "plus Add new Terrain option" }).click();
  await page
    .locator("div")
    .filter({ hasText: /^Cesium World Terrain$/ })
    .nth(4)
    .click();
  await page.getByTitle("ArcGIS Terrain").click();
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.locator(".ant-card").nth(0)).toHaveText("CESIUM_WORLD_TERRAIN");
  await expect(page.locator(".ant-card").nth(1)).toHaveText("ARC_GIS_TERRAIN");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);

  await page
    .locator(".ant-card")
    .nth(0)
    .locator(".grabbable")
    .dragTo(page.locator(".ant-card").nth(1));
  await expect(page.locator(".ant-card").nth(0)).toHaveText("ARC_GIS_TERRAIN");
  await expect(page.locator(".ant-card").nth(1)).toHaveText("CESIUM_WORLD_TERRAIN");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);

  await page.getByText("Home").click();
  await page.getByText("Settings").click();
  await expect(page.locator(".ant-card").nth(0)).toHaveText("ARC_GIS_TERRAIN");
  await expect(page.locator(".ant-card").nth(1)).toHaveText("CESIUM_WORLD_TERRAIN");
});
