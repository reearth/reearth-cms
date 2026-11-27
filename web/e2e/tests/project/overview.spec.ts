import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";

const isCI = !!process.env.CI;

test.beforeEach(async ({ reearth, projectPage }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  const projectName = getId();
  await projectPage.createProject(projectName);
  await projectPage.gotoProject(projectName);
});

test.afterEach(async ({ projectPage }) => {
  await projectPage.deleteProject();
});

test("@smoke Model CRUD on Overview page has succeeded", async ({
  schemaPage,
  projectPage,
  page,
}) => {
  await test.step("Create new model from overview page", async () => {
    await expect(projectPage.noModelsYetText).toBeVisible();
    await projectPage.newModelButtonFirst.click();
    await expect(projectPage.newModelLabelText).toBeVisible();
    await schemaPage.modelKeyInput.fill("model key");
    await schemaPage.modelNameInput.fill("model name");
    await projectPage.modelDescriptionInput.fill("model description");
    await projectPage.clickAndExpectSuccess(schemaPage.okButton);
    await page.waitForLoadState("networkidle");
  });

  await test.step("Verify model created successfully", async () => {
    await expect(projectPage.modelTitleByName("model name")).toBeVisible();
    await expect(projectPage.modelKeyTextByKey("model-key")).toBeVisible();
    await expect(projectPage.modelMenuItemByName("model name")).toBeVisible();
    await page.waitForLoadState("networkidle");
  });

  await test.step("Update model name, description and key", async () => {
    await page.goBack();
    await projectPage.openModelEditModal();
    await projectPage.modelNameInput.fill("new model name");
    await projectPage.modelDescriptionInput.fill("new model description");
    await projectPage.modelKeyInput.fill("new-model-key");
    await projectPage.clickAndExpectSuccess(projectPage.okButton);
    await page.waitForLoadState("networkidle");
  });

  await test.step("Verify model updated successfully", async () => {
    await expect(projectPage.rootElement).toContainText("new model name");
    await expect(projectPage.rootElement).toContainText("new model description");
    await page.waitForLoadState("networkidle");
  });

  await test.step("Delete model", async () => {
    await projectPage.openModelDeleteModal();
    await page.waitForLoadState("networkidle");
  });

  await test.step("Verify model deleted successfully", async () => {
    await expect(projectPage.rootElement).not.toContainText("new model name");
    await expect(projectPage.noModelsYetText).toBeVisible();
    await page.waitForLoadState("networkidle");
  });
});

test.describe("Model Export tests on Overview page", () => {
  test.beforeEach(async () => {
    test.skip(!isCI, "This test runs only in CI environment");
  });

  test("Model Export as JSON on Overview page has succeeded", async ({
    schemaPage,
    projectPage,
    fieldEditorPage,
    contentPage,
    page,
  }) => {
    await test.step("Create new model with field and content", async () => {
      await expect(projectPage.noModelsYetText).toBeVisible();
      await projectPage.newModelButtonFirst.click();
      await expect(projectPage.newModelLabelText).toBeVisible();
      await schemaPage.modelKeyInput.fill("model key");
      await schemaPage.modelNameInput.fill("model name");
      await projectPage.modelDescriptionInput.fill("model description");
      await projectPage.clickAndExpectSuccess(schemaPage.okButton);
      await expect(projectPage.modelMenuItemByName("model name")).toBeVisible();
      await projectPage.modelMenuItemByName("model name").click();
      await fieldEditorPage.createField("Text", "title", "title");
      await contentPage.createItem();
      await page.waitForLoadState("networkidle");
    });

    await test.step("Export model as JSON", async () => {
      await projectPage.modelsMenuItem.click();
      await projectPage.clickExportContentJSON();
      await projectPage.closeNotification();
      await page.waitForLoadState("networkidle");
    });
  });

  test("Model Export as CSV on Overview page has succeeded", async ({
    schemaPage,
    projectPage,
    fieldEditorPage,
    contentPage,
    page,
  }) => {
    await test.step("Create new model with field and content", async () => {
      await expect(projectPage.noModelsYetText).toBeVisible();
      await projectPage.newModelButtonFirst.click();
      await expect(projectPage.newModelLabelText).toBeVisible();
      await schemaPage.modelKeyInput.fill("model key");
      await schemaPage.modelNameInput.fill("model name");
      await projectPage.modelDescriptionInput.fill("model description");
      await projectPage.clickAndExpectSuccess(schemaPage.okButton);
      await expect(projectPage.modelMenuItemByName("model name")).toBeVisible();
      await projectPage.modelMenuItemByName("model name").click();
      await fieldEditorPage.createField("Text", "title", "title");
      await contentPage.createItem();
      await page.waitForLoadState("networkidle");
    });

    await test.step("Navigate to export and select CSV", async () => {
      await projectPage.modelsMenuItem.click();
      await projectPage.clickExportContentCSV();
      await page.waitForLoadState("networkidle");
    });

    await test.step("Verify CSV export warning modal and export", async () => {
      // Verify confirmation modal appears
      await expect(projectPage.csvExportWarningText).toBeVisible();
      await expect(projectPage.csvExportRelationsWarningText).toBeVisible();
      // Click Export button
      await projectPage.exportCSVButton.click();
      await projectPage.closeNotification();
      await page.waitForLoadState("networkidle");
    });
  });

  test("Model Export Schema has succeeded", async ({
    schemaPage,
    projectPage,
    fieldEditorPage,
    page,
  }) => {
    await test.step("Create new model with field", async () => {
      await expect(projectPage.noModelsYetText).toBeVisible();
      await projectPage.newModelButtonFirst.click();
      await expect(projectPage.newModelLabelText).toBeVisible();
      await schemaPage.modelKeyInput.fill("model key");
      await schemaPage.modelNameInput.fill("model name");
      await projectPage.modelDescriptionInput.fill("model description");
      await projectPage.clickAndExpectSuccess(schemaPage.okButton);
      await expect(projectPage.modelMenuItemByName("model name")).toBeVisible();
      await projectPage.modelMenuItemByName("model name").click();
      await fieldEditorPage.createField("Text", "title", "title");
      await page.waitForLoadState("networkidle");
    });

    await test.step("Export schema", async () => {
      await projectPage.modelsMenuItem.click();
      await projectPage.clickExportSchema();
      await projectPage.closeNotification();
      await page.waitForLoadState("networkidle");
    });
  });

  test("Model Export as GeoJSON without geometry field shows error", async ({
    schemaPage,
    projectPage,
    page,
  }) => {
    await test.step("Create model without geometry field", async () => {
      await expect(projectPage.noModelsYetText).toBeVisible();
      await projectPage.newModelButtonFirst.click();
      await expect(projectPage.newModelLabelText).toBeVisible();
      await schemaPage.modelKeyInput.fill("model key");
      await schemaPage.modelNameInput.fill("model name");
      await projectPage.modelDescriptionInput.fill("model description");
      await projectPage.clickAndExpectSuccess(schemaPage.okButton);
      await page.waitForLoadState("networkidle");
    });

    await test.step("Attempt GeoJSON export and verify error", async () => {
      await projectPage.modelsMenuItem.click();
      await projectPage.clickExportContentGeoJSON();
      // Verify error notification appears
      await expect(projectPage.cannotExportGeoJSONText).toBeVisible();
      await expect(projectPage.noGeometryFieldText).toBeVisible();
      // Notification is persistent (duration: 0) - close it manually
      await projectPage.closeNotification(false);
      await page.waitForLoadState("networkidle");
    });
  });
});

test("Import schema dropdown redirects to schema page correctly, with import schema modal opened", async ({
  schemaPage,
  projectPage,
  page,
}) => {
  const modelName = `model-${getId()}`;
  const modelKey = `model-key-${getId()}`;

  await test.step("Create new model", async () => {
    await expect(projectPage.noModelsYetText).toBeVisible();
    await projectPage.newModelButtonFirst.click();
    await expect(projectPage.newModelLabelText).toBeVisible();
    await schemaPage.modelKeyInput.fill(modelKey);
    await schemaPage.modelNameInput.fill(modelName);
    await projectPage.modelDescriptionInput.fill("model description");
    await projectPage.clickAndExpectSuccess(schemaPage.okButton);
    await expect(projectPage.modelTitleByName(modelName)).toBeVisible();
    await page.waitForLoadState("networkidle");
  });

  await test.step("Open import schema from dropdown", async () => {
    await page.goBack();
    await projectPage.clickImportSchema();
  });

  await test.step("Verify schema page and modal opened", async () => {
    await expect(page).toHaveURL(/\/schema\//);
    await expect(schemaPage.importSchemaDialog).toBeVisible();
  });
});

test("Creating Model by using the button on placeholder has succeeded", async ({
  projectPage,
  page,
}) => {
  await test.step("Create model using placeholder button", async () => {
    await projectPage.newModelButtonLast.click();
    await expect(projectPage.dialogNewModelText).toBeVisible();
    await projectPage.modelNameInput.fill("model name");
    await projectPage.clickAndExpectSuccess(projectPage.okButton);
    await page.waitForLoadState("networkidle");
  });

  await test.step("Verify model created successfully", async () => {
    await expect(projectPage.modelTitleByName("model name")).toBeVisible();
    await expect(projectPage.modelKeyTextByKey("model-name")).toBeVisible();
    await expect(projectPage.modelMenuItemByName("model name")).toBeVisible();
    await page.waitForLoadState("networkidle");
  });
});
