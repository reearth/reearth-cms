// e2e/pages/project.page.ts
import { type Locator } from "@reearth-cms/e2e/fixtures/test";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";

import { ProjectScopedPage } from "./project-scoped.page";

export class ProjectPage extends ProjectScopedPage {
  readonly modelName = "e2e model name";

  // Overview page - Model management
  get noModelsYetText(): Locator {
    return this.getByText("No Models yet");
  }
  get newModelButtonFirst(): Locator {
    return this.getByTestId(DATA_TEST_ID.ProjectOverview__NewModelButton);
  }
  get newModelButtonLast(): Locator {
    return this.getByTestId(DATA_TEST_ID.ProjectOverview__NewModelPlaceholderButton);
  }
  get newModelLabelText(): Locator {
    return this.getByLabel("New Model").getByText("New Model");
  }
  get modelDescriptionInput(): Locator {
    return this.getByLabel("Model description");
  }
  get modelNameInput(): Locator {
    return this.getByLabel("Model name");
  }
  get modelKeyInput(): Locator {
    return this.getByLabel("Model key");
  }
  get modelsMenuItem(): Locator {
    return this.getByTestId(DATA_TEST_ID.ProjectMenu__ModelsItem);
  }
  get modelUtilDropdown(): Locator {
    return this.getByTestId(DATA_TEST_ID.ModelCard__UtilDropdownIcon);
  }
  get modelExportLink(): Locator {
    return this.getByTestId(DATA_TEST_ID.ModelCard__UtilDropdownExport);
  }
  get modelImportLink(): Locator {
    return this.getByTestId(DATA_TEST_ID.ModelCard__UtilDropdownImport);
  }
  get modelListLink(): Locator {
    return this.getByTestId(DATA_TEST_ID.ModelCard__UtilDropdownIcon);
  }
  get editText(): Locator {
    return this.getByTestId(DATA_TEST_ID.ModelCard__UtilDropdownEdit);
  }
  get deleteText(): Locator {
    return this.getByTestId(DATA_TEST_ID.ModelCard__UtilDropdownDelete);
  }
  get exportAsJSONText(): Locator {
    return this.getByTestId(DATA_TEST_ID.ModelCard__UtilDropdownExportContentJSON);
  }
  get exportAsCSVText(): Locator {
    return this.getByTestId(DATA_TEST_ID.ModelCard__UtilDropdownExportContentCSV);
  }
  get exportAsGeoJSONText(): Locator {
    return this.getByTestId(DATA_TEST_ID.ModelCard__UtilDropdownExportContentGeoJSON);
  }
  get exportSchemaText(): Locator {
    return this.getByTestId(DATA_TEST_ID.ModelCard__UtilDropdownExportSchema);
  }
  get importSchemaText(): Locator {
    return this.getByTestId(DATA_TEST_ID.ModelCard__UtilDropdownImportSchema);
  }
  get importContentText(): Locator {
    return this.getByTestId(DATA_TEST_ID.ModelCard__UtilDropdownImportContent);
  }
  get deleteModelButton(): Locator {
    return this.getByRole("button", { name: "Delete Model" });
  }
  get dialogNewModelText(): Locator {
    return this.getByRole("dialog").getByText("New Model");
  }

  // Export modal locators
  get csvExportWarningText(): Locator {
    return this.getByText("CSV export only supports simple fields");
  }
  get csvExportRelationsWarningText(): Locator {
    return this.getByText("Relations, arrays, objects, and geometry fields are not included.");
  }
  get exportCSVButton(): Locator {
    return this.getByRole("button", { name: "Export CSV" });
  }
  get cannotExportGeoJSONText(): Locator {
    return this.getByText("Cannot export GeoJSON");
  }
  get noGeometryFieldText(): Locator {
    return this.getByText(
      "No Geometry field was found in this model, so GeoJSON export is not available.",
    );
  }
  get multipleGeometryFieldsText(): Locator {
    return this.getByText("Multiple Geometry fields detected");
  }
  get multipleGeometryWarningText(): Locator {
    return this.getByText("This model has multiple Geometry fields.");
  }
  get geoJSONSingleFieldWarningText(): Locator {
    return this.getByText("GeoJSON format supports only one geometry field.");
  }
  get exportAnywayButton(): Locator {
    return this.getByRole("button", { name: "Export Anyway" });
  }

  // Dynamic locators for model-specific content
  modelTitleByName(name: string): Locator {
    return this.getByTitle(name);
  }
  modelKeyTextByKey(key: string): Locator {
    return this.getByText(`#${key}`);
  }
  modelMenuItemByName(name: string): Locator {
    return this.getByRole("menuitem", { name }).locator("span");
  }

  // Simple model menu item for clicking
  modelMenuItemClick(name: string): Locator {
    return this.getByRole("menuitem", { name });
  }

  // Project Settings page locators
  get deleteProjectButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.ProjectSettings__DangerZone__DeleteProjectButton);
  }
  get confirmDeleteProjectButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.ProjectSettings__DangerZone__ConfirmDeleteProjectButton);
  }
  get nameInput(): Locator {
    return this.getByTestId(DATA_TEST_ID.ProjectSettings__GeneralForm__NameInput);
  }
  get descriptionInput(): Locator {
    return this.getByTestId(DATA_TEST_ID.ProjectSettings__GeneralForm__DescriptionInput);
  }
  get formSaveChangesButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.ProjectSettings__GeneralForm__SaveButton);
  }
  get saveChangesButtonSecond(): Locator {
    return this.getByTestId(DATA_TEST_ID.ProjectSettings__RequestOptions__SaveButton);
  }
  get ownerSwitch(): Locator {
    return this.getByRole("row", { name: "Owner" }).getByRole("switch");
  }
  get banner(): Locator {
    return this.getByRole("banner");
  }

  // Dynamic project settings locators
  projectSettingsHeading(projectName: string): Locator {
    return this.getByRole("heading", { name: `Project Settings / ${projectName}` });
  }

  // Accessibility page locators
  get accessibilityHeadingFirst(): Locator {
    return this.getByText("Accessibility").first();
  }
  get accessApiText(): Locator {
    return this.getByText("Access API").first();
  }
  get apiKeyText(): Locator {
    return this.getByText("API Key").first();
  }
  get newKeyButton(): Locator {
    return this.getByRole("button", { name: "New Key" });
  }
  get changeProjectVisibilityButton(): Locator {
    return this.getByRole("button", { name: "Change project visibility" });
  }

  projectCardDescription(description: string): Locator {
    return this.locator(".ant-card").getByText(description);
  }
}
