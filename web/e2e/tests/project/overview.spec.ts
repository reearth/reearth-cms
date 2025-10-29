import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";

const isCI = !!process.env.CI;

let projectName: string;

test.beforeEach(async ({ reearth, projectPage }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  projectName = getId();
  await projectPage.createProject(projectName);
  await projectPage.gotoProject(projectName);
});

test.afterEach(async ({ projectPage }) => {
  await projectPage.deleteProject(projectName);
});

test("Model CRUD on Overview page has succeeded", async ({ schemaPage, projectPage }) => {
  await expect(projectPage.noModelsYetText).toBeVisible();
  await projectPage.newModelButtonFirst.click();
  await expect(projectPage.newModelLabelText).toBeVisible();
  await schemaPage.modelKeyInput.fill("model key");
  await schemaPage.modelNameInput.fill("model name");
  await projectPage.modelDescriptionInput.fill("model description");
  await schemaPage.okButton.click();
  await projectPage.closeNotification();
  await expect(projectPage.modelTitleByName("model name")).toBeVisible();
  await expect(projectPage.modelKeyTextByKey("model-key")).toBeVisible();
  await expect(projectPage.modelMenuItemByName("model name")).toBeVisible();
  await projectPage.modelsMenuItem.click();
  await projectPage.modelListLink.click();
  await projectPage.editText.click();
  await projectPage.modelNameInput.fill("new model name");
  await projectPage.modelDescriptionInput.fill("new model description");
  await projectPage.modelKeyInput.fill("new-model-key");
  await projectPage.okButton.click();
  await projectPage.closeNotification();
  await expect(projectPage.rootElement).toContainText("new model name");
  await expect(projectPage.rootElement).toContainText("new model description");
  await projectPage.modelListLink.click();
  await projectPage.deleteText.click();
  await projectPage.deleteModelButton.click();
  await projectPage.closeNotification();
  await expect(projectPage.rootElement).not.toContainText("new model name");
  await expect(projectPage.noModelsYetText).toBeVisible();
});

test("Model Export as JSON on Overview page has succeeded", async ({ schemaPage, projectPage }) => {
  test.skip(!isCI, "This test runs only in CI environment");
  await expect(projectPage.noModelsYetText).toBeVisible();
  await projectPage.newModelButtonFirst.click();
  await expect(projectPage.newModelLabelText).toBeVisible();
  await schemaPage.modelKeyInput.fill("model key");
  await schemaPage.modelNameInput.fill("model name");
  await projectPage.modelDescriptionInput.fill("model description");
  await schemaPage.okButton.click();
  await projectPage.closeNotification();
  await expect(projectPage.modelTitleByName("model name")).toBeVisible();
  await expect(projectPage.modelKeyTextByKey("model-key")).toBeVisible();
  await expect(projectPage.modelMenuItemByName("model name")).toBeVisible();
  await projectPage.modelsMenuItem.click();
  await projectPage.modelExportLink.click();
  await projectPage.exportAsJSONText.click();
  await projectPage.closeNotification();
});

test("Model Export as CSV on Overview page has succeeded", async ({ schemaPage, projectPage }) => {
  test.skip(!isCI, "This test runs only in CI environment");
  await expect(projectPage.noModelsYetText).toBeVisible();
  await projectPage.newModelButtonFirst.click();
  await expect(projectPage.newModelLabelText).toBeVisible();
  await schemaPage.modelKeyInput.fill("model key");
  await schemaPage.modelNameInput.fill("model name");
  await projectPage.modelDescriptionInput.fill("model description");
  await schemaPage.okButton.click();
  await projectPage.closeNotification();
  await projectPage.modelsMenuItem.click();
  await projectPage.modelExportLink.click();
  await projectPage.exportAsCSVText.click();
  // Verify confirmation modal appears
  await expect(projectPage.csvExportWarningText).toBeVisible();
  await expect(projectPage.csvExportRelationsWarningText).toBeVisible();
  // Click Export button
  await projectPage.exportCSVButton.click();
  // Verify modal closed
  await projectPage.closeNotification();
});

test("Model Export Schema has succeeded", async ({ schemaPage, projectPage }) => {
  test.skip(!isCI, "This test runs only in CI environment");
  await expect(projectPage.noModelsYetText).toBeVisible();
  await projectPage.newModelButtonFirst.click();
  await expect(projectPage.newModelLabelText).toBeVisible();
  await schemaPage.modelKeyInput.fill("model key");
  await schemaPage.modelNameInput.fill("model name");
  await projectPage.modelDescriptionInput.fill("model description");
  await schemaPage.okButton.click();
  await projectPage.closeNotification();
  await projectPage.modelsMenuItem.click();
  await projectPage.modelExportLink.click();
  await projectPage.exportSchemaText.click();
  await projectPage.closeNotification();
});

test("Model Export as GeoJSON without geometry field shows error", async ({
  schemaPage,
  projectPage,
}) => {
  test.skip(!isCI, "This test runs only in CI environment");
  await expect(projectPage.noModelsYetText).toBeVisible();
  await projectPage.newModelButtonFirst.click();
  await expect(projectPage.newModelLabelText).toBeVisible();
  await schemaPage.modelKeyInput.fill("model key");
  await schemaPage.modelNameInput.fill("model name");
  await projectPage.modelDescriptionInput.fill("model description");
  await schemaPage.okButton.click();
  await projectPage.closeNotification();
  await projectPage.modelsMenuItem.click();
  await projectPage.modelExportLink.click();
  await projectPage.exportAsGeoJSONText.click();
  // Verify error modal appears
  await expect(projectPage.cannotExportGeoJSONText).toBeVisible();
  await expect(projectPage.noGeometryFieldText).toBeVisible();
  // Click OK
  await projectPage.okButton.click();
  // Verify modal closed
  await expect(projectPage.cannotExportGeoJSONText).not.toBeVisible();
});

test("Model Export as GeoJSON with single geometry field succeeds", async ({
  schemaPage,
  projectPage,
  fieldEditorPage,
}) => {
  test.skip(!isCI, "This test runs only in CI environment");
  await expect(projectPage.noModelsYetText).toBeVisible();
  await projectPage.newModelButtonFirst.click();
  await expect(projectPage.newModelLabelText).toBeVisible();
  await schemaPage.modelKeyInput.fill("model key");
  await schemaPage.modelNameInput.fill("model name");
  await projectPage.modelDescriptionInput.fill("model description");
  await schemaPage.okButton.click();
  await projectPage.closeNotification();

  // Navigate to schema to add geometry field
  await expect(projectPage.modelMenuItemByName("model name")).toBeVisible();
  await projectPage.modelMenuItemByName("model name").click();

  // Add a Geometry Object field
  await fieldEditorPage.fieldTypeButton("Geometry Object").click();
  await fieldEditorPage.displayNameInput.fill("location");
  await fieldEditorPage.settingsDescriptionInput.fill("location field");
  await fieldEditorPage.supportTypePointCheckbox.check();
  await fieldEditorPage.okButton.click();
  await fieldEditorPage.closeNotification();

  // Navigate back to overview
  await projectPage.modelsMenuItem.click();
  await projectPage.modelExportLink.click();
  await projectPage.exportAsGeoJSONText.click();
  // Should export directly without modal
  await projectPage.closeNotification();
});

test("Model Export as GeoJSON with multiple geometry fields shows warning", async ({
  schemaPage,
  projectPage,
  fieldEditorPage,
}) => {
  test.skip(!isCI, "This test runs only in CI environment");
  await expect(projectPage.noModelsYetText).toBeVisible();
  await projectPage.newModelButtonFirst.click();
  await expect(projectPage.newModelLabelText).toBeVisible();
  await schemaPage.modelKeyInput.fill("model key");
  await schemaPage.modelNameInput.fill("model name");
  await projectPage.modelDescriptionInput.fill("model description");
  await schemaPage.okButton.click();
  await projectPage.closeNotification();

  // Navigate to schema to add geometry fields
  await expect(projectPage.modelMenuItemByName("model name")).toBeVisible();
  await projectPage.modelMenuItemByName("model name").click();

  // Add first Geometry Object field
  await fieldEditorPage.fieldTypeButton("Geometry Object").click();
  await fieldEditorPage.displayNameInput.fill("location1");
  await fieldEditorPage.settingsDescriptionInput.fill("first location field");
  await fieldEditorPage.supportTypePointCheckbox.check();
  await fieldEditorPage.okButton.click();
  await fieldEditorPage.closeNotification();

  // Add second Geometry Object field
  await fieldEditorPage.fieldTypeButton("Geometry Object").click();
  await fieldEditorPage.displayNameInput.fill("location2");
  await fieldEditorPage.settingsDescriptionInput.fill("second location field");
  await fieldEditorPage.supportTypePointCheckbox.check();
  await fieldEditorPage.okButton.click();
  await fieldEditorPage.closeNotification();

  // Navigate back to overview
  await projectPage.modelsMenuItem.click();
  await projectPage.modelExportLink.click();
  await projectPage.exportAsGeoJSONText.click();

  // Verify warning modal appears
  await expect(projectPage.multipleGeometryFieldsText).toBeVisible();
  await expect(projectPage.multipleGeometryWarningText).toBeVisible();
  await expect(projectPage.geoJSONSingleFieldWarningText).toBeVisible();

  // Click cancel
  await projectPage.cancelButton.click();
  // Verify modal closed
  await expect(projectPage.multipleGeometryFieldsText).not.toBeVisible();
});

test("Creating Model by using the button on placeholder has succeeded", async ({ projectPage }) => {
  await projectPage.newModelButtonLast.click();
  await expect(projectPage.dialogNewModelText).toBeVisible();
  await projectPage.modelNameInput.fill("model name");
  await projectPage.okButton.click();
  await projectPage.closeNotification();
  await expect(projectPage.modelTitleByName("model name")).toBeVisible();
  await expect(projectPage.modelKeyTextByKey("model-name")).toBeVisible();
  await expect(projectPage.modelMenuItemByName("model name")).toBeVisible();
});
