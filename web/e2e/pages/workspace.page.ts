// e2e/pages/workspace.page.ts
import { type Locator } from "@reearth-cms/e2e/fixtures/test";

import { BasePage } from "./base.page";

export class WorkspacePage extends BasePage {
  // Workspace creation
  get createWorkspaceButton(): Locator {
    return this.getByRole("button", { name: "Create a Workspace" });
  }
  get workspaceNameInput(): Locator {
    return this.getByLabel("Workspace name");
  }
  get createWorkspaceTabButton(): Locator {
    return this.getByText("Create Workspace");
  }

  // Workspace settings
  get workspaceSettingsButton(): Locator {
    return this.getByText("Workspace Settings", { exact: true });
  }
  get workspaceNameSettingsInput(): Locator {
    return this.getByLabel("Workspace Name");
  }
  get saveChangesButton(): Locator {
    return this.getByRole("button", { name: "Save changes" });
  }
  get removeWorkspaceButton(): Locator {
    return this.getByRole("button", { name: "Remove Workspace" });
  }

  // Common buttons
  get okButton(): Locator {
    return this.getByRole("button", { name: "OK" });
  }

  // Header and navigation
  get header(): Locator {
    return this.locator("header");
  }
  get firstWorkspaceLink(): Locator {
    return this.locator("a").first();
  }

  // Project management from workspace level
  get newProjectButtonLast(): Locator {
    return this.getByRole("button", { name: "plus New Project" }).last();
  }
  get projectNameInput(): Locator {
    return this.getByLabel("Project name");
  }
  get projectDescriptionInput(): Locator {
    return this.getByLabel("Project description");
  }
  get searchProjectsInput(): Locator {
    return this.getByPlaceholder("search projects");
  }
  get searchButton(): Locator {
    return this.getByRole("button", { name: "search" });
  }
  get clearSearchButton(): Locator {
    return this.getByRole("button", { name: "close-circle" });
  }
  get banner(): Locator {
    return this.getByRole("banner");
  }

  // Dynamic project card locators
  projectCardByName(projectName: string): Locator {
    return this.locator(".ant-card").filter({ hasText: projectName }).first();
  }
  projectTextByName(projectName: string, exact = false): Locator {
    return this.getByText(projectName, { exact });
  }

  // Dynamic workspace text locators
  workspaceTextByName(workspaceName: string): Locator {
    return this.getByText(workspaceName);
  }

  // ========== Action Methods (POM Pattern) ==========

  async createWorkspace(name: string): Promise<void> {
    await this.getByRole("button", { name: "Create a Workspace" }).click();
    await this.getByLabel("Workspace name").click();
    await this.getByLabel("Workspace name").fill(name);
    await this.getByRole("button", { name: "OK" }).click();
    await this.closeNotification();
  }

  async deleteWorkspace(): Promise<void> {
    try {
      await this.getByText("Workspace Settings", { exact: true }).click();
      await this.getByRole("button", { name: "Remove Workspace" }).waitFor({
        state: "visible",
        timeout: 5000,
      });
      await this.getByRole("button", { name: "Remove Workspace" }).click();
      await this.getByRole("button", { name: "OK" }).click();
      await this.closeNotification();
    } catch (error) {
      console.warn("Failed to delete workspace:", error);
      // Attempt to navigate back to home if deletion fails
      await this.page.goto("/", { waitUntil: "domcontentloaded" }).catch(() => {
        console.warn("Failed to navigate to home page after deletion error");
      });
    }
  }
}
