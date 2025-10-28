// e2e/pages/project.page.ts
import { expect, type Locator } from "@reearth-cms/e2e/fixtures/test";

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
  get modelExportLink(): Locator {
    return this.getByRole("list").locator("a").nth(0);
  }
  get modelListLink(): Locator {
    return this.getByRole("list").locator("a").nth(1);
  }
  get editText(): Locator {
    return this.getByText("Edit", { exact: true });
  }
  get deleteText(): Locator {
    return this.getByText("Delete");
  }
  get exportAsJSONText(): Locator {
    return this.getByText("Export as JSON");
  }
  get exportAsCSVText(): Locator {
    return this.getByText("Export as CSV");
  }
  get exportAsGeoJSONText(): Locator {
    return this.getByText("Export as GeoJSON");
  }
  get exportSchemaText(): Locator {
    return this.getByText("Export Schema");
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
    return this.getByRole("menuitem", { name }).locator("span");
  }

  // Simple model menu item for clicking
  modelMenuItemClick(name: string): Locator {
    return this.getByRole("menuitem", { name });
  }

  // Project Settings page locators
  get deleteProjectButton(): Locator {
    return this.getByRole("button", { name: "Delete Project" });
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

  async deleteProject(projectName?: string): Promise<void> {
    try {
      // If project name is provided, navigate to it first
      if (projectName) {
        await this.page.goto("/", { waitUntil: "domcontentloaded" });
        await this.gotoProject(projectName);
      }

      // Check if "Delete Project" button is already visible (we might already be in Settings)
      const deleteButton = this.getByRole("button", { name: "Delete Project" });
      const isDeleteButtonVisible = await deleteButton
        .isVisible({ timeout: 1000 })
        .catch(() => false);

      if (!isDeleteButtonVisible) {
        // Try to navigate to Settings from current page
        const settingsButton = this.getByText("Settings").first();
        const isSettingsVisible = await settingsButton
          .isVisible({ timeout: 1000 })
          .catch(() => false);

        if (isSettingsVisible) {
          await settingsButton.click();
        } else {
          // If Settings text is not visible, try to navigate via sidebar
          const settingsMenuItem = this.settingsMenuItem;
          const isSettingsMenuVisible = await settingsMenuItem
            .isVisible({ timeout: 1000 })
            .catch(() => false);

          if (isSettingsMenuVisible) {
            await settingsMenuItem.click({ timeout: 3000 });
          } else {
            console.warn("Could not find Settings, skipping project deletion");
            return;
          }
        }
      }

      // Now try to delete
      await this.getByRole("button", { name: "Delete Project" }).waitFor({
        state: "visible",
        timeout: 5000,
      });
      await this.getByRole("button", { name: "Delete Project" }).click();
      await this.getByRole("button", { name: "OK" }).click();
      await this.closeNotification();
    } catch (error) {
      console.warn("Failed to delete project:", error);
      // Attempt to navigate back to home if deletion fails
      await this.page.goto("/", { waitUntil: "domcontentloaded" }).catch(() => {
        console.warn("Failed to navigate to home page after deletion error");
      });
    }
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
