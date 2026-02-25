// e2e/pages/project.page.ts
import { type Locator } from "@reearth-cms/e2e/fixtures/test";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";

import { ProjectScopedPage } from "./project-scoped.page";

export class ProjectPage extends ProjectScopedPage {
  // Overview page - Model management
  public get noModelsYetText(): Locator {
    return this.getByText("No Models yet");
  }
  public get newModelButtonFirst(): Locator {
    return this.getByTestId(DATA_TEST_ID.ProjectOverview__NewModelButton);
  }
  public get newModelButtonLast(): Locator {
    return this.getByTestId(DATA_TEST_ID.ProjectOverview__NewModelPlaceholderButton);
  }
  public get newModelLabelText(): Locator {
    return this.getByLabel("New Model").getByText("New Model");
  }
  public get modelDescriptionInput(): Locator {
    return this.getByLabel("Model description");
  }
  public get modelNameInput(): Locator {
    return this.getByLabel("Model name");
  }
  public get modelKeyInput(): Locator {
    return this.getByLabel("Model key");
  }
  public get modelsMenuItem(): Locator {
    return this.getByTestId(DATA_TEST_ID.ProjectMenu__ModelsItem);
  }
  public get modelUtilDropdown(): Locator {
    return this.getByTestId(DATA_TEST_ID.ModelCard__UtilDropdownIcon);
  }
  public get modelExportLink(): Locator {
    return this.getByTestId(DATA_TEST_ID.ModelCard__UtilDropdownExport);
  }
  public get modelImportLink(): Locator {
    return this.getByTestId(DATA_TEST_ID.ModelCard__UtilDropdownImport);
  }
  public get modelListLink(): Locator {
    return this.getByTestId(DATA_TEST_ID.ModelCard__UtilDropdownIcon);
  }
  public get editText(): Locator {
    return this.getByTestId(DATA_TEST_ID.ModelCard__UtilDropdownEdit);
  }
  public get deleteText(): Locator {
    return this.getByTestId(DATA_TEST_ID.ModelCard__UtilDropdownDelete);
  }
  public get exportAsJSONText(): Locator {
    return this.getByTestId(DATA_TEST_ID.ModelCard__UtilDropdownExportContentJSON);
  }
  public get exportAsCSVText(): Locator {
    return this.getByTestId(DATA_TEST_ID.ModelCard__UtilDropdownExportContentCSV);
  }
  public get exportAsGeoJSONText(): Locator {
    return this.getByTestId(DATA_TEST_ID.ModelCard__UtilDropdownExportContentGeoJSON);
  }
  public get exportSchemaText(): Locator {
    return this.getByTestId(DATA_TEST_ID.ModelCard__UtilDropdownExportSchema);
  }
  public get importSchemaText(): Locator {
    return this.getByTestId(DATA_TEST_ID.ModelCard__UtilDropdownImportSchema);
  }
  private get importContentText(): Locator {
    return this.getByTestId(DATA_TEST_ID.ModelCard__UtilDropdownImportContent);
  }
  public get deleteModelButton(): Locator {
    return this.getByRole("button", { name: "Delete Model" });
  }
  public get dialogNewModelText(): Locator {
    return this.getByRole("dialog").getByText("New Model");
  }

  // Export modal locators
  public get csvExportWarningText(): Locator {
    return this.getByText("CSV export only supports simple fields");
  }
  public get csvExportRelationsWarningText(): Locator {
    return this.getByText("Relations, arrays, objects, and geometry fields are not included.");
  }
  public get exportCSVButton(): Locator {
    return this.getByRole("button", { name: "Export CSV" });
  }
  public get cannotExportGeoJSONText(): Locator {
    return this.getByText("Cannot export GeoJSON");
  }
  public get noGeometryFieldText(): Locator {
    return this.getByText(
      "No Geometry field was found in this model, so GeoJSON export is not available.",
    );
  }
  public get multipleGeometryFieldsText(): Locator {
    return this.getByText("Multiple Geometry fields detected");
  }
  public get multipleGeometryWarningText(): Locator {
    return this.getByText("This model has multiple Geometry fields.");
  }
  public get geoJSONSingleFieldWarningText(): Locator {
    return this.getByText("GeoJSON format supports only one geometry field.");
  }
  private get exportAnywayButton(): Locator {
    return this.getByRole("button", { name: "Export Anyway" });
  }

  // Dynamic locators for model-specific content
  public modelTitleByName(name: string): Locator {
    return this.getByTitle(name);
  }
  public modelKeyTextByKey(key: string): Locator {
    return this.getByText(`#${key}`);
  }
  public modelMenuItemByName(name: string): Locator {
    return this.getByRole("menuitem", { name }).locator("span");
  }

  // Simple model menu item for clicking
  public modelMenuItemClick(name: string): Locator {
    return this.getByRole("menuitem", { name });
  }

  // Project Settings page locators
  public get deleteProjectButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.ProjectSettings__DangerZone__DeleteProjectButton);
  }
  public get confirmDeleteProjectButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.ProjectSettings__DangerZone__ConfirmDeleteProjectButton);
  }
  public get nameInput(): Locator {
    return this.getByTestId(DATA_TEST_ID.ProjectSettings__GeneralForm__NameInput);
  }
  public get descriptionInput(): Locator {
    return this.getByTestId(DATA_TEST_ID.ProjectSettings__GeneralForm__DescriptionInput);
  }
  public get formSaveChangesButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.ProjectSettings__GeneralForm__SaveButton);
  }
  public get saveChangesButtonSecond(): Locator {
    return this.getByTestId(DATA_TEST_ID.ProjectSettings__RequestOptions__SaveButton);
  }
  public get ownerSwitch(): Locator {
    return this.getByRole("row", { name: "Owner" }).getByRole("switch");
  }
  public get banner(): Locator {
    return this.getByRole("banner");
  }

  // Dynamic project settings locators
  public projectSettingsHeading(projectName: string): Locator {
    return this.getByRole("heading", { name: `Project Settings / ${projectName}` });
  }

  // Accessibility page locators
  public get accessibilityHeadingFirst(): Locator {
    return this.getByText("Accessibility").first();
  }
  public get accessApiText(): Locator {
    return this.getByText("Access API").first();
  }
  public get apiKeyText(): Locator {
    return this.getByText("API Key").first();
  }
  public get newKeyButton(): Locator {
    return this.getByRole("button", { name: "New Key" });
  }
  public get changeProjectVisibilityButton(): Locator {
    return this.getByRole("button", { name: "Change project visibility" });
  }

  private projectCardDescription(description: string): Locator {
    return this.locator(".ant-card").getByText(description);
  }
}
