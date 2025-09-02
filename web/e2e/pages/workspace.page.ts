import { expect, Locator } from "@reearth-cms/e2e/fixtures/test";

import { BasePage } from "./base.page";

export class WorkspacePage extends BasePage {
  private get createWorkspaceButton(): Locator {
    return this.getByRole("button", { name: "Create a Workspace" });
  }

  private get workspaceNameInput(): Locator {
    return this.getByLabel("Workspace name");
  }

  private get workspaceNameUpdateInput(): Locator {
    return this.getByLabel("Workspace Name");
  }

  private get okButton(): Locator {
    return this.getByRole("button", { name: "OK" });
  }

  private get saveChangesButton(): Locator {
    return this.getByRole("button", { name: "Save changes" });
  }

  private get removeWorkspaceButton(): Locator {
    return this.getByRole("button", { name: "Remove Workspace" });
  }

  private get workspaceSettingsButton(): Locator {
    return this.getByText("Workspace", { exact: true });
  }

  private get createWorkspaceTab(): Locator {
    return this.getByText("Create Workspace");
  }

  private get firstLink(): Locator {
    return this.locator("a").first();
  }

  private get header(): Locator {
    return this.locator("header");
  }

  async createWorkspace(workspaceName = "e2e workspace name"): Promise<void> {
    await this.createWorkspaceButton.click();
    await this.workspaceNameInput.fill(workspaceName);
    await this.okButton.click();
    await this.closeNotification();
  }

  async createWorkspaceFromTab(workspaceName = "workspace name"): Promise<void> {
    await this.firstLink.click();
    await this.createWorkspaceTab.click();
    await this.workspaceNameInput.fill(workspaceName);
    await this.okButton.click();
    await this.closeNotification();
  }

  async updateWorkspaceName(newName: string): Promise<void> {
    await this.workspaceSettingsButton.click();
    await this.workspaceNameUpdateInput.fill(newName);
    await this.saveChangesButton.click();
    await this.closeNotification();
  }

  async deleteWorkspace(): Promise<void> {
    await this.workspaceSettingsButton.click();
    await this.removeWorkspaceButton.click();
    await this.okButton.click();
    await this.closeNotification();
  }

  async expectWorkspaceNameInHeader(workspaceName: string): Promise<void> {
    await expect(this.header).toContainText(workspaceName);
  }

  async expectWorkspaceHidden(workspaceName: string): Promise<void> {
    await expect(this.getByText(workspaceName)).toBeHidden();
  }

  async navigateToFirstLink(): Promise<void> {
    await this.firstLink.click();
  }
}
