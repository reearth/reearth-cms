import { expect, Locator } from "@playwright/test";

import { BasePage } from "./base.page";

export class ProjectLayoutPage extends BasePage {
  private get header(): Locator {
    return this.page.locator(".ant-layout-header");
  }

  private get projectNameInHeader(): Locator {
    return this.header.locator("p").nth(2);
  }

  private get settingsButton(): Locator {
    return this.getByText("Settings");
  }

  async navigateToAssets(): Promise<void> {
    await this.getByRole("menuitem", { name: "Asset" }).click();
  }

  async navigateToContent(): Promise<void> {
    await this.getByRole("menuitem", { name: "Content" }).click();
  }

  async navigateToSchema(): Promise<void> {
    await this.getByRole("menuitem", { name: "Schema" }).click();
  }

  async navigateToSettings(): Promise<void> {
    await this.settingsButton.first().click();
  }

  async expectProjectNameInHeader(projectName: string): Promise<void> {
    await expect(this.projectNameInHeader).toHaveText(projectName);
    await expect(this.header).toContainText(projectName);
  }
}
