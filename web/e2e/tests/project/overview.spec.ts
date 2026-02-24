import { SchemaFieldType } from "@reearth-cms/components/molecules/Schema/types";
import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";

const isCI = !!process.env.CI;

test.beforeEach(async ({ projectPage }) => {
  await projectPage.goto("/", { waitUntil: "domcontentloaded" });
  const projectName = getId();
  await projectPage.createProject(projectName);
  await projectPage.gotoProject(projectName);
});

test.afterEach(async ({ projectPage }) => {
  await projectPage.deleteProject();
});

test("@smoke Model CRUD on Overview page has succeeded", async ({ schemaPage, projectPage }) => {
  await test.step("Create new model from overview page", async () => {
    await expect(projectPage.noModelsYetText).toBeVisible();
    await projectPage.newModelButtonFirst.click();
    await expect(projectPage.newModelLabelText).toBeVisible();
    await schemaPage.modelKeyInput.fill("model key");
    await schemaPage.modelNameInput.fill("model name");
    await projectPage.modelDescriptionInput.fill("model description");
    await schemaPage.okButton.click();
    await projectPage.closeNotification();
  });

  await test.step("Verify model created successfully", async () => {
    await expect(projectPage.modelTitleByName("model name")).toBeVisible();
    await expect(projectPage.modelKeyTextByKey("model-key")).toBeVisible();
    await expect(projectPage.modelMenuItemByName("model name")).toBeVisible();
  });

  await test.step("Update model name, description and key", async () => {
    await projectPage.modelsMenuItem.click();
    await projectPage.modelListLink.click();
    await projectPage.editText.click();
    await projectPage.modelNameInput.fill("new model name");
    await projectPage.modelDescriptionInput.fill("new model description");
    await projectPage.modelKeyInput.fill("new-model-key");
    await projectPage.okButton.click();
    await projectPage.closeNotification();
  });

  await test.step("Verify model updated successfully", async () => {
    await expect(projectPage.rootElement).toContainText("new model name");
    await expect(projectPage.rootElement).toContainText("new model description");
  });

  await test.step("Delete model", async () => {
    await projectPage.modelListLink.click();
    await projectPage.deleteText.click();
    await projectPage.deleteModelButton.click();
    await projectPage.closeNotification();
  });

  await test.step("Verify model deleted successfully", async () => {
    await expect(projectPage.rootElement).not.toContainText("new model name");
    await expect(projectPage.noModelsYetText).toBeVisible();
  });
});

test.describe("Model Export tests on Overview page", () => {
  test.beforeEach(async () => {
    test.skip(!isCI, "This test runs only in CI environment");
  });

  test("Model Export as JSON on Overview page has succeeded", async ({
    schemaPage,
    projectPage,
  }) => {
    await test.step("Create new model", async () => {
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
    });

    await test.step("Export model as JSON", async () => {
      await projectPage.modelsMenuItem.click();
      await projectPage.modelUtilDropdown.click();
      await projectPage.modelExportLink.click();
      await projectPage.exportAsJSONText.click();
      await projectPage.closeNotification();
    });
  });

  test("Model Export as CSV on Overview page has succeeded", async ({
    schemaPage,
    projectPage,
  }) => {
    await test.step("Create new model", async () => {
      await expect(projectPage.noModelsYetText).toBeVisible();
      await projectPage.newModelButtonFirst.click();
      await expect(projectPage.newModelLabelText).toBeVisible();
      await schemaPage.modelKeyInput.fill("model key");
      await schemaPage.modelNameInput.fill("model name");
      await projectPage.modelDescriptionInput.fill("model description");
      await schemaPage.okButton.click();
      await projectPage.closeNotification();
    });

    await test.step("Navigate to export and select CSV", async () => {
      await projectPage.modelsMenuItem.click();
      await projectPage.modelUtilDropdown.click();
      await projectPage.modelExportLink.click();
      await projectPage.exportAsCSVText.click();
    });

    await test.step("Verify CSV export warning modal and export", async () => {
      // Verify confirmation modal appears
      await expect(projectPage.csvExportWarningText).toBeVisible();
      await expect(projectPage.csvExportRelationsWarningText).toBeVisible();
      // Click Export button
      await projectPage.exportCSVButton.click();
      // Verify modal closed
      await projectPage.closeNotification();
    });
  });

  test("Model Export Schema has succeeded", async ({ schemaPage, projectPage }) => {
    await test.step("Create new model", async () => {
      await expect(projectPage.noModelsYetText).toBeVisible();
      await projectPage.newModelButtonFirst.click();
      await expect(projectPage.newModelLabelText).toBeVisible();
      await schemaPage.modelKeyInput.fill("model key");
      await schemaPage.modelNameInput.fill("model name");
      await projectPage.modelDescriptionInput.fill("model description");
      await schemaPage.okButton.click();
      await projectPage.closeNotification();
    });

    await test.step("Export schema", async () => {
      await projectPage.modelsMenuItem.click();
      await projectPage.modelUtilDropdown.click();
      await projectPage.modelExportLink.click();
      await projectPage.exportSchemaText.click();
      await projectPage.closeNotification();
    });
  });

  test("Model Export as GeoJSON without geometry field shows error", async ({
    schemaPage,
    projectPage,
  }) => {
    await test.step("Create model without geometry field", async () => {
      await expect(projectPage.noModelsYetText).toBeVisible();
      await projectPage.newModelButtonFirst.click();
      await expect(projectPage.newModelLabelText).toBeVisible();
      await schemaPage.modelKeyInput.fill("model key");
      await schemaPage.modelNameInput.fill("model name");
      await projectPage.modelDescriptionInput.fill("model description");
      await schemaPage.okButton.click();
      await projectPage.closeNotification();
    });

    await test.step("Attempt GeoJSON export and verify error", async () => {
      await projectPage.modelsMenuItem.click();
      await projectPage.modelUtilDropdown.click();
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
  });

  test("Model Export as GeoJSON with single geometry field succeeds", async ({
    schemaPage,
    projectPage,
    fieldEditorPage,
  }) => {
    await test.step("Create model and add geometry field", async () => {
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
      await fieldEditorPage.createField({
        type: SchemaFieldType.GeometryObject,
        name: "location",
        description: "location field",
        supportedTypes: ["POINT"],
      });
    });

    await test.step("Export as GeoJSON successfully", async () => {
      // Navigate back to overview
      await projectPage.modelsMenuItem.click();
      await projectPage.modelUtilDropdown.click();
      await projectPage.modelExportLink.click();
      await projectPage.exportAsGeoJSONText.click();
      // Should export directly without modal
      await projectPage.closeNotification();
    });
  });

  test("Model Export as GeoJSON with multiple geometry fields shows warning", async ({
    schemaPage,
    projectPage,
    fieldEditorPage,
  }) => {
    await test.step("Create model and add two geometry fields", async () => {
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
      await fieldEditorPage.createField({
        type: SchemaFieldType.GeometryObject,
        name: "location1",
        description: "first location field",
        supportedTypes: ["POINT"],
      });

      // Add second Geometry Object field
      await fieldEditorPage.createField({
        type: SchemaFieldType.GeometryObject,
        name: "location2",
        description: "second location field",
        supportedTypes: ["POINT"],
      });
    });

    await test.step("Attempt GeoJSON export and verify warning modal", async () => {
      // Navigate back to overview
      await projectPage.modelsMenuItem.click();
      await projectPage.modelUtilDropdown.click();
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
  });
});

test("Import schema dropdown redirects to schema page correctly, with import schema modal opened", async ({
  schemaPage,
  projectPage,
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
    await schemaPage.okButton.click();
    await projectPage.closeNotification();
    await expect(projectPage.modelTitleByName(modelName)).toBeVisible();
  });

  await test.step("Open import schema from dropdown", async () => {
    await projectPage.modelsMenuItem.click();
    await projectPage.modelUtilDropdown.click();
    await projectPage.modelImportLink.click();
    await projectPage.importSchemaText.click();
  });

  await test.step("Verify schema page and modal opened", async () => {
    await schemaPage.expectURL(/\/schema\//);
    await expect(schemaPage.importSchemaDialog).toBeVisible();
  });
});

test("Creating Model by using the button on placeholder has succeeded", async ({ projectPage }) => {
  await test.step("Create model using placeholder button", async () => {
    await projectPage.newModelButtonLast.click();
    await expect(projectPage.dialogNewModelText).toBeVisible();
    await projectPage.modelNameInput.fill("model name");
    await projectPage.okButton.click();
    await projectPage.closeNotification();
  });

  await test.step("Verify model created successfully", async () => {
    await expect(projectPage.modelTitleByName("model name")).toBeVisible();
    await expect(projectPage.modelKeyTextByKey("model-name")).toBeVisible();
    await expect(projectPage.modelMenuItemByName("model name")).toBeVisible();
  });
});
