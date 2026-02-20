// e2e/pages/project-settings.page.ts
import { type Locator } from "@reearth-cms/e2e/fixtures/test";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";

import { ProjectScopedPage } from "./project-scoped.page";

export class ProjectSettingsPage extends ProjectScopedPage {
  // locators
  public settingsTitle(projectName: string): Locator {
    return this.getByRole("heading", { name: projectName, exact: false });
  }

  public get projectName(): Locator {
    return this.getByTestId(DATA_TEST_ID.ProjectSettings__GeneralForm__NameInput);
  }

  public get projectAlias(): Locator {
    return this.getByTestId(DATA_TEST_ID.ProjectSettings__GeneralForm__AliasInput);
  }

  private get saveChanges(): Locator {
    return this.getByTestId(DATA_TEST_ID.ProjectSettings__GeneralForm__SaveButton);
  }

  public get errorMessage(): Locator {
    // Ant Design renders form field errors in a container with id="${fieldName}_help".
    // Note: antd v5.24.3 ErrorList does NOT render role="alert", so getByRole is unusable.
    return this.getByTestId(DATA_TEST_ID.ProjectSettings__GeneralForm__AliasField).locator(
      "#alias_help",
    );
  }

  // actions
  public async goToProjectSettings(): Promise<void> {
    await this.settingsMenuItem.click();
  }

  public async saveSettings(): Promise<void> {
    await this.saveChanges.click();
    await this.closeNotification();
  }
}
