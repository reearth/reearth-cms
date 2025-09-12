// e2e/pages/project.page.ts
import { type Locator } from "@reearth-cms/e2e/fixtures/test";

import { BasePage } from "./base.page";

export class ProjectPage extends BasePage {
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
  get modelListLink(): Locator {
    return this.getByRole("list").locator("a");
  }
  get editText(): Locator {
    return this.getByText("Edit", { exact: true });
  }
  get deleteText(): Locator {
    return this.getByText("Delete");
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
}
