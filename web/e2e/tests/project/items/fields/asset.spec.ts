import { SchemaFieldType } from "@reearth-cms/components/molecules/Schema/types";
import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";

const uploadFileUrl_1 =
  "https://assets.cms.plateau.reearth.io/assets/11/6d05db-ed47-4f88-b565-9eb385b1ebb0/13100_tokyo23-ku_2022_3dtiles%20_1_1_op_bldg_13101_chiyoda-ku_lod1/tileset.json";
const uploadFileName_1 = "tileset.json";
const uploadFileUrl_2 =
  "https://assets.cms.plateau.reearth.io/assets/ec/0de34c-889a-459a-b49c-47c89d02ee3e/lowpolycar.gltf";
const uploadFileName_2 = "lowpolycar.gltf";

test.beforeEach(async ({ reearth, projectPage }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  const projectName = getId();
  await projectPage.createProject(projectName);
  await projectPage.gotoProject(projectName);
  await projectPage.createModelFromOverview();
});

test.afterEach(async ({ projectPage }) => {
  await projectPage.deleteProject();
});

test("@smoke Asset field creating and updating has succeeded", async ({
  page,
  fieldEditorPage,
  contentPage,
  schemaPage,
}) => {
  await test.step("Create asset field with description", async () => {
    await fieldEditorPage.createField({
      type: SchemaFieldType.Asset,
      name: "asset1",
      key: "asset1",
      description: "asset1 description",
    });
  });

  await test.step("Verify field created and navigate to new item", async () => {
    await expect(schemaPage.fieldsContainer.getByRole("paragraph")).toContainText("asset1#asset1");
    await contentPage.contentText.click();
    await contentPage.newItemButton.click();
    await expect(contentPage.locator("label")).toContainText("asset1");
    await expect(contentPage.mainRole).toContainText("asset1 description");
  });

  await test.step("Upload first asset via URL", async () => {
    await fieldEditorPage.assetButton.click();
    await fieldEditorPage.uploadAssetButton.click();
    await fieldEditorPage.urlTab.click();
    await fieldEditorPage.urlInput.click();
    await fieldEditorPage.urlInput.fill(uploadFileUrl_1);
    await fieldEditorPage.uploadAndLinkButton.click();
    await contentPage.closeNotification();
  });

  await test.step("Verify first asset uploaded", async () => {
    await expect(fieldEditorPage.folderButton(uploadFileName_1)).toBeVisible();
    await expect(fieldEditorPage.filenameButton(uploadFileName_1)).toBeVisible();
  });

  await test.step("Save item and verify asset appears in list", async () => {
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
    await contentPage.backButton.click();
    await expect(contentPage.optionTextByName(uploadFileName_1)).toBeVisible();
  });

  await test.step("Edit item and replace asset with second file", async () => {
    await contentPage.editButton.click();
    await fieldEditorPage.folderButton(uploadFileName_1).click();
    await fieldEditorPage.uploadAssetButton.click();
    await fieldEditorPage.urlTab.click();
    await fieldEditorPage.urlInput.click();
    await fieldEditorPage.urlInput.fill(uploadFileUrl_2);
    await fieldEditorPage.uploadAndLinkButton.click();
    await contentPage.closeNotification();
  });

  await test.step("Verify second asset replaced first and save changes", async () => {
    await expect(fieldEditorPage.folderButton(uploadFileName_2)).toBeVisible();
    await expect(fieldEditorPage.filenameButton(uploadFileName_2)).toBeVisible();
    await contentPage.backButton.click();
    await contentPage.cancelButton.click();
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
    await contentPage.backButton.click();
    await expect(contentPage.optionTextByName(uploadFileName_2)).toBeVisible();
  });
});

test("Previewing JSON file from content page into new tab succeeded", async ({
  page,
  context,
  fieldEditorPage,
  contentPage,
  schemaPage,
}) => {
  await test.step("Create asset field", async () => {
    await fieldEditorPage.createField({
      type: SchemaFieldType.Asset,
      name: "asset1",
      key: "asset1",
      description: "asset1 description",
    });
    await page.waitForTimeout(300);
    await expect(schemaPage.fieldsContainer.getByRole("paragraph")).toContainText("asset1#asset1");
  });

  await test.step("Navigate to new item and verify field", async () => {
    await contentPage.contentText.click();
    await contentPage.newItemButton.click();
    await expect(contentPage.locator("label")).toContainText("asset1");
    await expect(contentPage.mainRole).toContainText("asset1 description");
  });

  await test.step("Upload GLTF asset via URL", async () => {
    await fieldEditorPage.assetButton.click();
    await fieldEditorPage.uploadAssetButton.click();
    await fieldEditorPage.urlTab.click();
    await fieldEditorPage.urlInput.fill(uploadFileUrl_2);
    await fieldEditorPage.uploadAndLinkButton.click();
    await contentPage.closeNotification();
    await page.waitForTimeout(300);
    await expect(fieldEditorPage.folderButton(uploadFileName_2)).toBeVisible();
    await expect(fieldEditorPage.filenameButton(uploadFileName_2)).toBeVisible();
  });

  await test.step("Save item", async () => {
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
  });

  await test.step("Preview asset in new tab and verify viewer loads", async () => {
    const [viewerPage] = await Promise.all([
      context.waitForEvent("page"),
      fieldEditorPage.filenameButton(uploadFileName_2).last().click(),
    ]);
    await viewerPage.waitForLoadState("domcontentloaded");

    // Cesium canvas is rendered (attached to DOM) but Playwright considers it
    // hidden because the WebGL canvas is not passing visibility checks.
    await expect(viewerPage.locator("canvas").first()).toBeAttached();
  });
});

test("Asset field editing has succeeded", async ({
  page,
  fieldEditorPage,
  contentPage,
  schemaPage,
}) => {
  await test.step("Create asset field with default value", async () => {
    await fieldEditorPage.fieldTypeButton("Asset").click();
    await fieldEditorPage.displayNameInput.click();
    await fieldEditorPage.displayNameInput.fill("asset1");
    await fieldEditorPage.settingsKeyInput.click();
    await fieldEditorPage.settingsKeyInput.fill("asset1");
    await fieldEditorPage.settingsDescriptionInput.click();
    await fieldEditorPage.settingsDescriptionInput.fill("asset1 description");
    await fieldEditorPage.defaultValueTab.click();
    await fieldEditorPage.assetButton.click();
    await fieldEditorPage.uploadAssetButton.click();
    await fieldEditorPage.urlTab.click();
    await fieldEditorPage.urlInput.click();
    await fieldEditorPage.urlInput.fill(uploadFileUrl_1);
    await fieldEditorPage.uploadAndLinkButton.click();
    await contentPage.closeNotification();
  });

  await test.step("Verify default asset and test asset picker search", async () => {
    await expect(fieldEditorPage.folderButton(uploadFileName_1)).toBeVisible();
    await expect(fieldEditorPage.filenameButton(uploadFileName_1)).toBeVisible();
    await fieldEditorPage.defaultValueLabel.getByRole("button").nth(3).click();
    await fieldEditorPage.assetButton.click();
    await fieldEditorPage.searchInput.click();
    await fieldEditorPage.searchInput.fill("no asset");
    await fieldEditorPage.searchButton.click();
    await expect(fieldEditorPage.antTableRow.first()).toBeHidden();
    await fieldEditorPage.searchInput.clear();
    await fieldEditorPage.searchInput.press("Enter");
    await fieldEditorPage.linkAssetButton.first().hover();
    await fieldEditorPage.linkAssetButton.first().click();
    await expect(fieldEditorPage.folderButton(uploadFileName_1)).toBeVisible();
    await expect(fieldEditorPage.filenameButton(uploadFileName_1)).toBeVisible();
    await fieldEditorPage.okButton.click();
    await contentPage.closeNotification();
  });

  await test.step("Create new item and verify default value applied", async () => {
    await contentPage.contentText.click();
    await expect(contentPage.tableHead).toContainText("asset1");
    await contentPage.newItemButton.click();
    await expect(fieldEditorPage.folderButton(uploadFileName_1)).toBeVisible();
    await expect(fieldEditorPage.filenameButton(uploadFileName_1)).toBeVisible();
    await expect(contentPage.optionTextByName("asset1")).toBeVisible();
    await expect(contentPage.optionTextByName("asset1 description")).toBeVisible();
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
  });

  await test.step("Verify item saved with default asset", async () => {
    await contentPage.backButton.click();
    await expect(contentPage.optionTextByName(uploadFileName_1)).toBeVisible();
  });

  await test.step("Edit field settings: rename, enable multiple values, and validations", async () => {
    await schemaPage.schemaText.click();
    await schemaPage.fieldEditButton.click();
    await fieldEditorPage.displayNameInput.click();
    await fieldEditorPage.displayNameInput.fill("new asset1");
    await fieldEditorPage.fieldKeyInput.click();
    await fieldEditorPage.fieldKeyInput.fill("new-asset1");
    await fieldEditorPage.descriptionInput.click();
    await fieldEditorPage.descriptionInput.fill("new asset1 description");
    await fieldEditorPage.supportMultipleValuesCheckbox.check();
    await expect(fieldEditorPage.useAsTitleCheckbox).toBeHidden();
    await fieldEditorPage.validationTab.click();
    await fieldEditorPage.requiredFieldCheckbox.check();
    await fieldEditorPage.uniqueFieldCheckbox.check();
    await fieldEditorPage.defaultValueTab.click();
    await expect(fieldEditorPage.folderButton(uploadFileName_1)).toBeVisible();
    await expect(fieldEditorPage.filenameButton(uploadFileName_1)).toBeVisible();
  });

  await test.step("Add second default asset and reorder", async () => {
    await fieldEditorPage.plusNewButton.click();
    await fieldEditorPage.assetButton.click();
    await fieldEditorPage.uploadAssetButton.click();
    await fieldEditorPage.urlTab.click();
    await fieldEditorPage.urlInput.click();
    await fieldEditorPage.urlInput.fill(uploadFileUrl_2);
    await fieldEditorPage.uploadAndLinkButton.click();
    await contentPage.closeNotification();
    await page.waitForTimeout(300);

    await expect(fieldEditorPage.folderButton(uploadFileName_2)).toBeVisible();
    await expect(fieldEditorPage.filenameButton(uploadFileName_2)).toBeVisible();
    await fieldEditorPage.arrowUpButton.nth(1).click();
    await expect(contentPage.cssAssetByIndex(0)).toContainText(uploadFileName_2);
    await expect(contentPage.cssAssetByIndex(1)).toContainText(uploadFileName_1);
    await fieldEditorPage.okButton.click();
    await contentPage.closeNotification();
  });

  await test.step("Verify updated field in schema", async () => {
    await expect(schemaPage.fieldsContainer.getByRole("paragraph")).toContainText(
      "new asset1 *#new-asset1(unique)",
    );
  });

  await test.step("Create new item with updated field and verify multiple assets", async () => {
    await contentPage.contentText.click();
    await expect(contentPage.tableHead).toContainText("new asset1");
    await contentPage.newItemButton.click();
    await expect(contentPage.locator("label")).toContainText("new asset1(unique)");
    await expect(contentPage.mainRole).toContainText("new asset1 description");
    await expect(contentPage.cssAssetByIndex(0)).toContainText(uploadFileName_2);
    await expect(contentPage.cssAssetByIndex(1)).toContainText(uploadFileName_1);
    await fieldEditorPage.plusNewButton.click();
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
  });

  await test.step("Verify multiple assets displayed in list view tooltip", async () => {
    await contentPage.backButton.click();
    await contentPage.x2Button.click();
    await expect(contentPage.tooltip).toContainText(`new asset1`);
    await expect(contentPage.tooltipParagraphs.first()).toContainText(uploadFileName_2);
    await expect(contentPage.tooltipParagraphs.last()).toContainText(uploadFileName_1);
  });
});
