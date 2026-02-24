// e2e/pages/project-scoped.page.ts
import { expect, type Locator, type Page } from "@reearth-cms/e2e/fixtures/test";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";

import { BasePage } from "./base.page";

// ── Project URL auto-tracking ──
// Shared across all ProjectScopedPage instances per Page object.
// Updated automatically on every navigation via framenavigated listener.
const projectBaseUrls = new WeakMap<Page, string>();
const trackedPages = new WeakSet<Page>();

function setupProjectUrlTracking(page: Page): void {
  if (trackedPages.has(page)) return;
  trackedPages.add(page);
  page.on("framenavigated", frame => {
    if (frame !== page.mainFrame()) return;
    const match = page.url().match(/(\/workspace\/[^/]+\/project\/[^/]+)/);
    if (match) {
      projectBaseUrls.set(page, match[1]);
    }
  });
}

export abstract class ProjectScopedPage extends BasePage {
  constructor(page: Page) {
    super(page);
    setupProjectUrlTracking(page);
  }

  /** Last known project base URL (auto-tracked via framenavigated). */
  private get projectBaseUrl(): string | undefined {
    return projectBaseUrls.get(this.page);
  }

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
    return this.page.getByRole("menuitem").filter({
      has: this.page.getByTestId(DATA_TEST_ID.ProjectMenu__SettingsItem),
    });
  }

  public get accessibilityMenuItem(): Locator {
    return this.page.getByRole("menuitem").filter({
      has: this.page.getByTestId(DATA_TEST_ID.ProjectMenu__AccessibilityItem),
    });
  }

  // Project lifecycle
  public async createProject(name: string): Promise<void> {
    await this.getByTestId(DATA_TEST_ID.Workspace__HeaderActions)
      .getByTestId(DATA_TEST_ID.Workspace__NewProjectButton)
      .click();
    await this.getByRole("dialog").locator("#name").fill(name);
    await this.getByRole("button", { name: "OK" }).click();
    await this.closeNotification();
  }

  public async gotoProject(name: string): Promise<void> {
    await this.getByTestId(DATA_TEST_ID.ProjectCard__Wrapper)
      .filter({ hasText: name })
      .click();
    const projectName = this.getByTestId(DATA_TEST_ID.Header__ProjectName);
    await expect(projectName).toHaveText(name);
    // projectBaseUrl is auto-set by the framenavigated listener — no manual storage needed
  }

  /**
   * Assert that the page is in a project context.
   * Throws a clear error with the current URL and last known project URL.
   */
  protected assertProjectContext(): void {
    if (!this.page.url().match(/\/workspace\/[^/]+\/project\/[^/]+/)) {
      throw new Error(
        `Expected page to be on a project URL.\n` +
          `  Current URL: ${this.page.url()}\n` +
          `  Last tracked project: ${this.projectBaseUrl ?? "none"}`,
      );
    }
  }

  /**
   * Navigate to a project sub-page using the stored project base URL.
   * Fails fast with a clear error if no project URL has been tracked.
   */
  protected async gotoProjectSubPage(subPath: string): Promise<void> {
    if (!this.projectBaseUrl) {
      throw new Error(
        `Cannot navigate to ${subPath}: no project URL tracked.\n` +
          `  Call gotoProject() first, or navigate to any project page.`,
      );
    }
    await this.page.goto(this.projectBaseUrl + subPath);
  }

  public async deleteProject(): Promise<void> {
    // Dismiss any open modal by pressing Escape
    await this.keypress("Escape");
    const dialog = this.getByRole("dialog");
    try {
      await dialog.waitFor({ state: "hidden", timeout: 1000 });
    } catch {
      // Fallback: if Escape didn't work, try Cancel then X close button
      if (await dialog.isVisible({ timeout: 300 }).catch(() => false)) {
        try {
          await this.cancelButton.click({ timeout: 2000 });
        } catch {
          // No Cancel button (e.g. Import Schema dialog) — try X close button
          await dialog
            .locator('[aria-label="Close"]')
            .click({ timeout: 2000 })
            .catch(() => {});
        }
        await dialog.waitFor({ state: "hidden", timeout: 2000 }).catch(() => {});
      }
    }

    // Navigate to project settings via direct URL (resilient to sidebar state)
    if (this.projectBaseUrl) {
      await this.gotoProjectSubPage("/settings");
    } else {
      await this.settingsMenuItem.click();
    }
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
