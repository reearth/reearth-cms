// e2e/pages/project-settings.page.ts
import { type Locator } from "@reearth-cms/e2e/fixtures/test";

import { BasePage } from "./base.page";

export class ProjectSettingsPage extends BasePage {
  // locators
  public settingsTitle(projectName: string): Locator {
    return this.getByRole("heading", { name: projectName, exact: false });
  }

  public get projectName(): Locator {
    return this.getByLabel("name");
  }

  public get projectAlias(): Locator {
    return this.getByLabel("alias");
  }

  private get saveChanges(): Locator {
    return this.getByRole("button", { name: "Save Changes" }).first();
  }

  public get errorMessage(): Locator {
    return this.locator("#alias_help");
  }

  // actions
  public async goToProjectSettings(): Promise<void> {
    await this.getByText("Settings", { exact: true }).click();
  }

  public async saveSettings(): Promise<void> {
    await this.saveChanges.click();
    await this.closeNotification();
  }
}
