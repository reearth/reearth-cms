import { expect, Locator } from '@playwright/test';

import { getId } from '@reearth-cms/e2e/utils/mock';

import { BasePage } from './base.page';

export class HomePage extends BasePage {
  private get newProjectButton(): Locator {
    return this.getByRole('button', { name: 'plus New Project' });
  }

  private get searchInput(): Locator {
    return this.getByPlaceholder('search projects');
  }

  private get searchButton(): Locator {
    return this.getByRole('button', { name: 'search' });
  }

  private get clearSearchButton(): Locator {
    return this.getByRole('button', { name: 'close-circle' });
  }

  async createProject(name?: string, description?: string): Promise<{ id: string; description: string }> {
    const projectId = name || getId();
    const projectDescription = description || 'project description';

    await this.newProjectButton.first().click();
    await this.getByLabel('Project name').fill(projectId);
    await this.getByLabel('Project description').fill(projectDescription);
    await this.getByRole('button', { name: 'OK' }).click();
    await this.closeNotification();

    return { id: projectId, description: projectDescription };
  }

  async searchProjects(searchTerm: string): Promise<void> {
    await this.searchInput.fill(searchTerm);
    await this.searchButton.click();
  }

  async clearSearch(): Promise<void> {
    await this.clearSearchButton.click();
  }

  async openProject(projectName: string): Promise<void> {
    const projectCard = this.getProjectCard(projectName);
    await projectCard.click();
  }

  getProjectCard(projectName: string): Locator {
    return this.locator('.ant-card').filter({ hasText: projectName }).first();
  }

  async expectProjectVisible(projectName: string, description?: string): Promise<void> {
    const projectCard = this.getProjectCard(projectName);
    await expect(projectCard).toBeVisible();
    if (description) {
      await expect(projectCard.getByText(description)).toBeVisible();
    }
  }

  async expectProjectHidden(projectName: string): Promise<void> {
    const projectCard = this.getProjectCard(projectName);
    await expect(projectCard).toBeHidden();
  }
}