// e2e/pages/project-scoped.page.ts
import { expect, type Locator } from "@reearth-cms/e2e/fixtures/test";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";

import { BasePage } from "./base.page";

export abstract class ProjectScopedPage extends BasePage {
  // Project sidebar navigation
  get schemaMenuItem(): Locator {
    return this.getByRole("menuitem", { name: "Schema" });
  }

  get contentMenuItem(): Locator {
    return this.getByRole("menuitem", { name: "Content" });
  }

  get assetMenuItem(): Locator {
    return this.getByRole("menuitem", { name: "Asset" });
  }

  get settingsMenuItem(): Locator {
    return this.getByText("Settings").first();
  }

  get accessibilityMenuItem(): Locator {
    return this.getByText("Accessibility");
  }

  // Project lifecycle
  async createProject(name: string): Promise<void> {
    await this.getByRole("button", { name: "plus New Project" }).first().click();
    await this.getByRole("dialog").locator("#name").fill(name);
    await this.getByRole("button", { name: "OK" }).click();
    await this.closeNotification();
  }

  async gotoProject(name: string): Promise<void> {
    await this.getByText(name, { exact: true }).click();
    const projectName = this.locator(".ant-layout-header p").nth(2);
    await expect(projectName).toHaveText(name);
  }

  async deleteProject(): Promise<void> {
    // Close any open modals/dialogs before attempting to delete
    const modalWrap = this.page.locator(".ant-modal-wrap");
    const isModalVisible = await modalWrap
      .first()
      .isVisible({ timeout: 500 })
      .catch(() => false);

    if (isModalVisible) {
      const modalStyle = await modalWrap
        .first()
        .evaluate(el => window.getComputedStyle(el).pointerEvents)
        .catch(() => "auto");

      if (modalStyle !== "none") {
        const modalClose = this.page.locator(".ant-modal-close");
        const isCloseButtonVisible = await modalClose
          .first()
          .isVisible({ timeout: 500 })
          .catch(() => false);

        if (isCloseButtonVisible) {
          try {
            await modalClose.first().click({ timeout: 2000 });
            await modalWrap
              .first()
              .waitFor({ state: "hidden", timeout: 2000 })
              .catch(() => {});
          } catch {
            await this.page.keyboard.press("Escape");
            await this.page.waitForTimeout(300);
          }
        } else {
          await this.page.keyboard.press("Escape");
          await this.page.waitForTimeout(300);
        }
      }
    }

    await this.getByText("Settings").first().click();
    await this.getByTestId(DATA_TEST_ID.ProjectSettings__DangerZone__DeleteProjectButton).click();
    await this.getByTestId(
      DATA_TEST_ID.ProjectSettings__DangerZone__ConfirmDeleteProjectButton,
    ).click();
    await this.closeNotification();
  }

  async createModelFromOverview(name = "e2e model name", key?: string): Promise<void> {
    await this.getByRole("button", { name: "plus New Model" }).first().click();
    await this.getByLabel("Model name").fill(name);
    if (key) {
      await this.getByLabel("Model key").fill(key);
    }
    await this.getByRole("button", { name: "OK" }).click();
    await this.closeNotification();
  }
}
