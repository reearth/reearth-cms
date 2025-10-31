import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";
import { isCesiumViewerReady } from "@reearth-cms/e2e/helpers/viewer.helper";

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
  fieldEditorPage,
  contentPage,
  schemaPage,
}) => {
  await fieldEditorPage.fieldTypeButton("Asset").click();
  await fieldEditorPage.displayNameInput.click();
  await fieldEditorPage.displayNameInput.fill("asset1");
  await fieldEditorPage.settingsKeyInput.click();
  await fieldEditorPage.settingsKeyInput.fill("asset1");
  await fieldEditorPage.settingsDescriptionInput.click();
  await fieldEditorPage.settingsDescriptionInput.fill("asset1 description");
  await fieldEditorPage.okButton.click();
  await contentPage.closeNotification();

  await expect(schemaPage.fieldsContainer.getByRole("paragraph")).toContainText("asset1#asset1");
  await contentPage.contentText.click();
  await contentPage.newItemButton.click();
  await expect(contentPage.locator("label")).toContainText("asset1");
  await expect(contentPage.mainRole).toContainText("asset1 description");

  await fieldEditorPage.assetButton.click();
  await fieldEditorPage.uploadAssetButton.click();
  await fieldEditorPage.urlTab.click();
  await fieldEditorPage.urlInput.click();
  await fieldEditorPage.urlInput.fill(uploadFileUrl_1);
  await fieldEditorPage.uploadAndLinkButton.click();
  await contentPage.closeNotification();

  await expect(fieldEditorPage.folderButton(uploadFileName_1)).toBeVisible();
  await expect(fieldEditorPage.filenameButton(uploadFileName_1)).toBeVisible();

  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  await contentPage.backButton.click();
  await expect(contentPage.optionTextByName(uploadFileName_1)).toBeVisible();
  await contentPage.editButton.click();
  await fieldEditorPage.folderButton(uploadFileName_1).click();
  await fieldEditorPage.uploadAssetButton.click();
  await fieldEditorPage.urlTab.click();
  await fieldEditorPage.urlInput.click();
  await fieldEditorPage.urlInput.fill(uploadFileUrl_2);
  await fieldEditorPage.uploadAndLinkButton.click();
  await contentPage.closeNotification();
  await expect(fieldEditorPage.folderButton(uploadFileName_2)).toBeVisible();
  await expect(fieldEditorPage.filenameButton(uploadFileName_2)).toBeVisible();
  await contentPage.backButton.click();
  await contentPage.cancelButton.click();
  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  await contentPage.backButton.click();
  await expect(contentPage.optionTextByName(uploadFileName_2)).toBeVisible();
});

test("@smoke Previewing JSON file from content page into new tab succeeded", async ({
  context,
  fieldEditorPage,
  contentPage,
  schemaPage,
}) => {
  await fieldEditorPage.fieldTypeButton("Asset").click();
  await fieldEditorPage.displayNameInput.fill("asset1");
  await fieldEditorPage.settingsKeyInput.fill("asset1");
  await fieldEditorPage.settingsDescriptionInput.fill("asset1 description");
  await fieldEditorPage.okButton.click();
  await contentPage.closeNotification();
  await expect(schemaPage.fieldsContainer.getByRole("paragraph")).toContainText("asset1#asset1");

  await contentPage.contentText.click();
  await contentPage.newItemButton.click();
  await expect(contentPage.locator("label")).toContainText("asset1");
  await expect(contentPage.mainRole).toContainText("asset1 description");

  await fieldEditorPage.assetButton.click();
  await fieldEditorPage.uploadAssetButton.click();
  await fieldEditorPage.urlTab.click();
  await fieldEditorPage.urlInput.fill(uploadFileUrl_2);
  await fieldEditorPage.uploadAndLinkButton.click();
  await contentPage.closeNotification();
  await expect(fieldEditorPage.folderButton(uploadFileName_2)).toBeVisible();
  await expect(fieldEditorPage.filenameButton(uploadFileName_2)).toBeVisible();

  await contentPage.saveButton.click();
  await contentPage.closeNotification();

  const [viewerPage] = await Promise.all([
    context.waitForEvent("page"),
    fieldEditorPage.filenameButton(uploadFileName_2).last().click(),
  ]);
  await viewerPage.waitForLoadState("domcontentloaded");

  const isViewerReady = await isCesiumViewerReady(viewerPage);
  expect(isViewerReady).toBe(true);
});

test("Asset field editing has succeeded", async ({ fieldEditorPage, contentPage, schemaPage }) => {
  test.slow();
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
  await expect(fieldEditorPage.folderButton(uploadFileName_1)).toBeVisible();
  await expect(fieldEditorPage.filenameButton(uploadFileName_1)).toBeVisible();
  await fieldEditorPage.defaultValueLabel.getByRole("button").nth(3).click();
  await fieldEditorPage.assetButton.click();
  await fieldEditorPage.searchInput.click();
  await fieldEditorPage.searchInput.fill("no asset");
  await fieldEditorPage.searchButton.click();
  await expect(fieldEditorPage.antTableRow.first()).toBeHidden();
  await fieldEditorPage.searchInput.click();
  await fieldEditorPage.searchInput.fill("");
  await fieldEditorPage.searchButton.click();
  await contentPage.antTableRowTd.first().getByRole("button").hover();
  await contentPage.antTableRowTd.first().getByRole("button").click();
  await expect(fieldEditorPage.folderButton(uploadFileName_1)).toBeVisible();
  await expect(fieldEditorPage.filenameButton(uploadFileName_1)).toBeVisible();
  await fieldEditorPage.okButton.click();
  await contentPage.closeNotification();
  await contentPage.contentText.click();
  await expect(contentPage.tableHead).toContainText("asset1");
  await contentPage.newItemButton.click();
  await expect(fieldEditorPage.folderButton(uploadFileName_1)).toBeVisible();
  await expect(fieldEditorPage.filenameButton(uploadFileName_1)).toBeVisible();
  await expect(contentPage.optionTextByName("asset1")).toBeVisible();
  await expect(contentPage.optionTextByName("asset1 description")).toBeVisible();
  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  await contentPage.backButton.click();
  await expect(contentPage.optionTextByName(uploadFileName_1)).toBeVisible();
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
  await fieldEditorPage.plusNewButton.click();
  await fieldEditorPage.assetButton.click();
  await fieldEditorPage.uploadAssetButton.click();
  await fieldEditorPage.urlTab.click();

  await fieldEditorPage.urlInput.click();
  await fieldEditorPage.urlInput.fill(uploadFileUrl_2);
  await fieldEditorPage.uploadAndLinkButton.click();
  await contentPage.closeNotification();
  await expect(fieldEditorPage.folderButton(uploadFileName_2)).toBeVisible();
  await expect(fieldEditorPage.filenameButton(uploadFileName_2)).toBeVisible();
  await fieldEditorPage.arrowUpButton.nth(1).click();
  await expect(contentPage.cssAssetByIndex(0)).toContainText(uploadFileName_2);
  await expect(contentPage.cssAssetByIndex(1)).toContainText(uploadFileName_1);
  await fieldEditorPage.okButton.click();
  await contentPage.closeNotification();
  await expect(schemaPage.fieldsContainer.getByRole("paragraph")).toContainText(
    "new asset1 *#new-asset1(unique)",
  );
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
  await contentPage.backButton.click();
  await contentPage.x2Button.click();
  await expect(contentPage.tooltip).toContainText(`new asset1`);
  await expect(contentPage.tooltipParagraphs.first()).toContainText(uploadFileName_2);
  await expect(contentPage.tooltipParagraphs.last()).toContainText(uploadFileName_1);
});
