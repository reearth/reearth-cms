// e2e/pages/workspace.page.ts
import { SortBy } from "@reearth-cms/components/molecules/Workspace/types";
import { type Locator } from "@reearth-cms/e2e/fixtures/test";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";

import { BasePage } from "./base.page";

export class WorkspacePage extends BasePage {
  // Workspace creation
  public get createWorkspaceButton(): Locator {
    return this.getByRole("button", { name: "Create a Workspace" });
  }
  public get workspaceNameInput(): Locator {
    return this.getByLabel("Workspace name");
  }
  public get createWorkspaceTabButton(): Locator {
    return this.getByText("Create Workspace");
  }

  // Workspace settings
  public get workspaceSettingsButton(): Locator {
    return this.getByText("Workspace Settings", { exact: true });
  }
  public get workspaceNameSettingsInput(): Locator {
    return this.getByLabel("Workspace Name");
  }
  public get saveChangesButton(): Locator {
    return this.getByRole("button", { name: "Save changes" });
  }
  public get removeWorkspaceButton(): Locator {
    return this.getByRole("button", { name: "Remove Workspace" });
  }

  // Header and navigation
  public get header(): Locator {
    return this.locator("header");
  }
  public get firstWorkspaceLink(): Locator {
    return this.locator("a").first();
  }

  // Project management from workspace level
  public get newProjectButtonLast(): Locator {
    return this.getByRole("button", { name: "plus New Project" }).last();
  }
  public get projectNameInput(): Locator {
    return this.getByLabel("Project name");
  }
  public get projectDescriptionInput(): Locator {
    return this.getByLabel("Project description");
  }
  public get searchProjectsInput(): Locator {
    return this.getByPlaceholder("search projects");
  }
  public get clearSearchButton(): Locator {
    return this.getByRole("button", { name: "close-circle" });
  }
  public get banner(): Locator {
    return this.getByRole("banner");
  }

  private async allProjectCards(): Promise<Locator[]> {
    return await this.getByTestId(DATA_TEST_ID.ProjectCard__Wrapper).all();
  }

  private get projectSelectSort(): Locator {
    return this.getByTestId(DATA_TEST_ID.WorkspaceHeader__ProjectSortSelect);
  }

  public get projectSelectDefaultSort(): Locator {
    return this.projectSelectSort.getByTitle("Last Modified");
  }

  public paginationEl(page: number): Locator {
    return this.getByTitle(page.toString(), { exact: true });
  }

  private get paginationJumpEl(): Locator {
    return this.getByRole("textbox", { name: "Page" });
  }

  public async getVisibleProjects(): Promise<string[]> {
    this.assertWorkspaceContext();
    const projectCards = await this.allProjectCards();
    const projectNames: string[] = [];

    for await (const project of projectCards) {
      const projectName = await project.locator("span").first().textContent();
      if (projectName) projectNames.push(projectName);
    }

    return projectNames;
  }

  // Dynamic project card locators
  public projectCardByName(projectName: string): Locator {
    return this.getByTestId(DATA_TEST_ID.ProjectCard__Wrapper)
      .filter({ hasText: projectName })
      .first();
  }
  public projectTextByName(projectName: string, exact = false): Locator {
    return this.getByText(projectName, { exact });
  }

  // Dynamic workspace text locators
  public workspaceTextByName(workspaceName: string): Locator {
    return this.getByText(workspaceName);
  }

  // ========== URL Context Validation ==========

  private assertWorkspaceContext(): void {
    const url = this.page.url();
    if (!url.match(/\/workspace\/[^/]+/) || url.match(/\/project\//)) {
      throw new Error(
        `Expected page to be on a workspace URL (not inside a project).\n` +
          `  Current URL: ${url}`,
      );
    }
  }

  // ========== Action Methods (POM Pattern) ==========

  public async createWorkspace(name: string): Promise<void> {
    await this.createWorkspaceButton.click();
    await this.workspaceNameInput.click();
    await this.workspaceNameInput.fill(name);
    await this.okButton.click();
    await this.closeNotification();
  }

  public async deleteWorkspace(): Promise<void> {
    await this.workspaceSettingsButton.click();
    await this.removeWorkspaceButton.click();
    await this.okButton.click();
    await this.closeNotification();
  }

  public async clickPagination(page: number): Promise<void> {
    this.assertWorkspaceContext();
    const pageEl = this.paginationEl(page);
    await pageEl.click();
  }

  public async jumpToPage(page: number): Promise<void> {
    this.assertWorkspaceContext();
    const jumpPageInputEl = this.paginationJumpEl;
    await jumpPageInputEl.fill(page.toString());
    await this.keypress("Enter");
  }

  public async selectSortOption(option: SortBy): Promise<void> {
    this.assertWorkspaceContext();
    await this.projectSelectSort.click();
    const lastModifiedOptionEl = this.getByTestId(`workspace-header-project-sort-option-${option}`);
    await lastModifiedOptionEl.click();
  }
}
