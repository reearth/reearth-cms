// e2e/pages/project-scoped.page.ts
import { expect, type Locator } from "@reearth-cms/e2e/fixtures/test";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";

import { BasePage } from "./base.page";

export abstract class ProjectScopedPage extends BasePage {
  // Project sidebar navigation
  public get schemaMenuItem(): Locator {
    return this.getByRole("menuitem", { name: "Schema" });
  }

  public get contentMenuItem(): Locator {
    return this.getByRole("menuitem", { name: "Content" });
  }

  public get assetMenuItem(): Locator {
    return this.getByRole("menuitem", { name: "Asset" });
  }

  public get settingsMenuItem(): Locator {
    return this.getByTestId(DATA_TEST_ID.ProjectMenu__SettingsItem);
  }

  public get accessibilityMenuItem(): Locator {
    return this.getByTestId(DATA_TEST_ID.ProjectMenu__AccessibilityItem);
  }

  // Project lifecycle
  public async createProject(name: string): Promise<void> {
    await this.getByTestId(DATA_TEST_ID.Workspace__NewProjectButton).click();
    await this.getByRole("dialog").locator("#name").fill(name);
    await this.getByRole("button", { name: "OK" }).click();
    await this.closeNotification();
  }

  public async gotoProject(name: string): Promise<void> {
    await this.getByText(name, { exact: true }).click();
    const projectName = this.getByTestId(DATA_TEST_ID.Header__ProjectName);
    await expect(projectName).toHaveText(name);
  }

  public async deleteProject(): Promise<void> {
    // Dismiss any open modal by pressing Escape
    await this.page.keyboard.press("Escape");
    await this.page.waitForTimeout(300);

    // Fallback: if Escape is disabled (Ant Design keyboard=false), click Cancel button
    const dialog = this.getByRole("dialog");
    if (await dialog.isVisible({ timeout: 300 }).catch(() => false)) {
      await this.cancelButton.click();
      await this.page.waitForTimeout(300);
    }

    await this.getByTestId(DATA_TEST_ID.ProjectMenu__SettingsItem).click();
    await this.getByTestId(DATA_TEST_ID.ProjectSettings__DangerZone__DeleteProjectButton).click();
    await this.getByTestId(
      DATA_TEST_ID.ProjectSettings__DangerZone__ConfirmDeleteProjectButton,
    ).click();
    await this.closeNotification();
  }

  public async createModelFromOverview(name = "e2e model name", key?: string): Promise<void> {
    await this.getByTestId(DATA_TEST_ID.ProjectOverview__NewModelButton).click();
    await this.getByLabel("Model name").fill(name);
    if (key) {
      await this.getByLabel("Model key").fill(key);
    }
    await this.getByRole("button", { name: "OK" }).click();
    await this.closeNotification();
  }
}
