// e2e/pages/workspace.page.ts
import { SortBy } from "@reearth-cms/components/molecules/Workspace/types";
import { type Locator } from "@reearth-cms/e2e/fixtures/test";

import { BasePage } from "./base.page";

export class WorkspacePage extends BasePage {
  // Workspace creation
  get createWorkspaceButton(): Locator {
    return this.getByTestId("workspace-create-button");
  }
  get createWorkspaceTabButton(): Locator {
    return this.getByRole("tab", { name: "workspace plus Create Workspace" });
  }
  get workspaceNameInput(): Locator {
    return this.getByTestId("workspace-name-input");
  }
  get workspaceCreateOkButton(): Locator {
    return this.getByTestId("workspace-create-ok-button");
  }
  get workspaceCreateCancelButton(): Locator {
    return this.getByTestId("workspace-create-cancel-button");
  }

  // Workspace settings
  get workspaceSettingsButton(): Locator {
    return this.getByText("Workspace Settings", { exact: true });
  }
  get workspaceNameSettingsInput(): Locator {
    return this.getByTestId("workspace-settings-name-input");
  }
  get saveChangesButton(): Locator {
    return this.getByTestId("workspace-settings-save-button");
  }
  get removeWorkspaceButton(): Locator {
    return this.getByTestId("workspace-settings-delete-button");
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
  get newProjectButton(): Locator {
    return this.getByTestId("workspace-new-project-button");
  }
  get newProjectButtonLast(): Locator {
    return this.getByTestId("workspace-new-project-button").last();
  }
  get projectNameInput(): Locator {
    return this.getByTestId("project-name-input");
  }
  get projectAliasInput(): Locator {
    return this.getByTestId("project-alias-input");
  }
  get projectDescriptionInput(): Locator {
    return this.getByTestId("project-description-input");
  }
  get projectCreateOkButton(): Locator {
    return this.getByTestId("project-create-ok-button");
  }
  get projectCreateCancelButton(): Locator {
    return this.getByTestId("project-create-cancel-button");
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

  async allProjectCards(): Promise<Locator[]> {
    return await this.locator(".ant-card").all();
  }

  get projectSelectSort(): Locator {
    return this.getByTestId("workspace-header-project-sort-select");
  }

  get projectSelectDefaultSort(): Locator {
    return this.projectSelectSort.getByTitle("Last Modified");
  }

  paginationEl(page: number): Locator {
    return this.getByTitle(page.toString(), { exact: true });
  }

  private get paginationJumpEl(): Locator {
    return this.getByRole("textbox", { name: "Page" });
  }

  async getVisibleProjects(): Promise<string[]> {
    const projectCards = await this.allProjectCards();
    const projectNames: string[] = [];

    for await (const project of projectCards) {
      const projectName = await project.locator("span").first().textContent();
      if (projectName) projectNames.push(projectName);
    }

    return projectNames;
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
    await this.createWorkspaceButton.click();
    await this.workspaceNameInput.click();
    await this.workspaceNameInput.fill(name);
    await this.workspaceCreateOkButton.click();
    await this.closeNotification();
  }

  async deleteWorkspace(): Promise<void> {
    await this.workspaceSettingsButton.click();
    await this.removeWorkspaceButton.click();
    await this.okButton.click();
    await this.closeNotification();
  }

  async clickPagination(page: number): Promise<void> {
    const pageEl = this.paginationEl(page);
    await pageEl.click();
  }

  async jumpToPage(page: number): Promise<void> {
    const jumpPageInputEl = this.paginationJumpEl;
    await jumpPageInputEl.fill(page.toString());
    await this.keypress("Enter");
  }

  async selectSortOption(option: SortBy): Promise<void> {
    await this.projectSelectSort.click();
    const lastModifiedOptionEl = this.getByTestId(`workspace-header-project-sort-option-${option}`);
    await lastModifiedOptionEl.click();
  }
}
