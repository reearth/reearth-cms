import { type Locator } from "@reearth-cms/e2e/fixtures/test";

import { BasePage } from "./base.page";

export class ProjectSettingsPage extends BasePage {
  private get nameInput(): Locator {
    return this.getByLabel("Name");
  }

  private get descriptionInput(): Locator {
    return this.getByLabel("Description");
  }

  private get saveButton(): Locator {
    return this.locator("form").getByRole("button", { name: "Save changes" });
  }

  private get deleteButton(): Locator {
    return this.getByRole("button", { name: "Delete Project" });
  }

  private get confirmDeleteButton(): Locator {
    return this.getByRole("button", { name: "OK" });
  }

  async updateProject(name: string, description: string): Promise<void> {
    await this.nameInput.fill(name);
    await this.descriptionInput.fill(description);
    await this.saveButton.click();
    await this.closeNotification();
  }

  async deleteProject(): Promise<void> {
    await this.deleteButton.waitFor({ state: "visible" });
    await this.deleteButton.click();
    await this.confirmDeleteButton.click();
    await this.closeNotification();
  }

  getMemberRow(role: string): Locator {
    return this.getByRole("row", { name: role });
  }

  async toggleMemberSwitch(role: string): Promise<void> {
    const memberRow = this.getMemberRow(role);
    const memberSwitch = memberRow.getByRole("switch");
    await memberSwitch.click();
  }

  // Accessibility settings methods
  async navigateToAccessibility(): Promise<void> {
    await this.getByText("Accessibility").click();
  }
}
