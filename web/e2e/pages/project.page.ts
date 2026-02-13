// e2e/pages/project.page.ts
import { expect, type Locator } from "@reearth-cms/e2e/fixtures/test";
import { DATA_TEST_ID } from "@reearth-cms/test/utils.ts";

import { BasePage } from "./base.page";

export class ProjectPage extends BasePage {
  readonly modelName = "e2e model name";
  // Navigation menu items
  get schemaMenuItem(): Locator {
    return this.getByRole("menuitem", { name: "Schema" });
  }
  get contentMenuItem(): Locator {
    return this.getByRole("menuitem", { name: "Content" });
  }
  get assetMenuItem(): Locator {
    return this.getByRole("menuitem", { name: "Asset" });
  }

  // Common buttons
  get okButton(): Locator {
    return this.getByRole("button", { name: "OK" });
  }

  // Overview page - Model management
  get noModelsYetText(): Locator {
    return this.getByText("No Models yet");
  }
  get newModelButtonFirst(): Locator {
    return this.getByRole("button", { name: "plus New Model" }).first();
  }
  get newModelButtonLast(): Locator {
    return this.getByRole("button", { name: "plus New Model" }).last();
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
    return this.getByText("Models").first();
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
    return this.getByRole("list").locator("a").nth(0);
  }
  get editText(): Locator {
    return this.getByText("Edit", { exact: true });
  }
  get deleteText(): Locator {
    return this.getByText("Delete");
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
  get rootElement(): Locator {
    return this.locator("#root");
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
  get cancelButton(): Locator {
    return this.getByRole("button", { name: "Cancel" });
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
    return this.getByRole("menuitem", { name }).locator("span").first();
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
  get settingsMenuItem(): Locator {
    return this.getByText("Settings").first();
  }
  get nameInput(): Locator {
    return this.getByLabel("Name");
  }
  get descriptionInput(): Locator {
    return this.getByLabel("Description");
  }
  get formSaveChangesButton(): Locator {
    return this.locator("form").getByRole("button", { name: "Save changes" });
  }
  get saveChangesButtonSecond(): Locator {
    return this.getByRole("button", { name: "Save changes" }).nth(1);
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
  get accessibilityMenuItem(): Locator {
    return this.getByText("Accessibility");
  }
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

  // ========== Action Methods (POM Pattern) ==========

  async createProject(name: string): Promise<void> {
    await this.getByRole("button", { name: "plus New Project" }).first().click();
    await this.getByRole("dialog").locator("#name").fill(name);
    await this.getByRole("button", { name: "OK" }).click();
    await this.closeNotification();
  }

  async gotoProject(name: string): Promise<void> {
    await this.getByText(name, { exact: true }).click();
    const projectName = this.locator(".ant-layout-header p").nth(2);
    await expect(projectName).toHaveText(name);
  }

  async deleteProject(): Promise<void> {
    // Close any open modals/dialogs before attempting to delete
    // Check if modal is present and stable (not animating)
    const modalWrap = this.page.locator(".ant-modal-wrap");
    const isModalVisible = await modalWrap
      .first()
      .isVisible({ timeout: 500 })
      .catch(() => false);

    if (isModalVisible) {
      // Check if modal is actually blocking (has pointer-events)
      const modalStyle = await modalWrap
        .first()
        .evaluate(el => window.getComputedStyle(el).pointerEvents)
        .catch(() => "auto");

      if (modalStyle !== "none") {
        // Try to close the modal using close button
        const modalClose = this.page.locator(".ant-modal-close");
        const isCloseButtonVisible = await modalClose
          .first()
          .isVisible({ timeout: 500 })
          .catch(() => false);

        if (isCloseButtonVisible) {
          try {
            await modalClose.first().click({ timeout: 2000 });
            // Wait for modal to fully disappear
            await modalWrap
              .first()
              .waitFor({ state: "hidden", timeout: 2000 })
              .catch(() => {});
          } catch {
            // If clicking fails, try ESC key as fallback
            await this.page.keyboard.press("Escape");
            await this.page.waitForTimeout(300);
          }
        } else {
          // No close button, use ESC key
          await this.page.keyboard.press("Escape");
          await this.page.waitForTimeout(300);
        }
      }
    }

    await this.getByText("Settings").first().click();
    await this.deleteProjectButton.click();
    await this.confirmDeleteProjectButton.click();
    await this.closeNotification();
  }

  async createModelFromOverview(name = "e2e model name", key?: string): Promise<void> {
    await this.getByRole("button", { name: "plus New Model" }).first().click();
    await this.getByLabel("Model name").fill(name);
    if (key) {
      await this.getByLabel("Model key").fill(key);
    }
    await this.getByRole("button", { name: "OK" }).click();
    await this.closeNotification();
  }

  projectCardDescription(description: string): Locator {
    return this.locator(".ant-card").getByText(description);
  }
}
