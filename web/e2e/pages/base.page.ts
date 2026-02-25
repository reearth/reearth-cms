import { getAccessToken } from "@reearth-cms/e2e/config/config";
import { expect, type Page, type Locator } from "@reearth-cms/e2e/fixtures/test";
import { closeNotification } from "@reearth-cms/e2e/helpers/notification.helper";

type Role =
  | "alert"
  | "alertdialog"
  | "application"
  | "article"
  | "banner"
  | "blockquote"
  | "button"
  | "caption"
  | "cell"
  | "checkbox"
  | "code"
  | "columnheader"
  | "combobox"
  | "complementary"
  | "contentinfo"
  | "definition"
  | "deletion"
  | "dialog"
  | "directory"
  | "document"
  | "emphasis"
  | "feed"
  | "figure"
  | "form"
  | "generic"
  | "grid"
  | "gridcell"
  | "group"
  | "heading"
  | "img"
  | "insertion"
  | "link"
  | "list"
  | "listbox"
  | "listitem"
  | "log"
  | "main"
  | "marquee"
  | "math"
  | "meter"
  | "menu"
  | "menubar"
  | "menuitem"
  | "menuitemcheckbox"
  | "menuitemradio"
  | "navigation"
  | "none"
  | "note"
  | "option"
  | "paragraph"
  | "presentation"
  | "progressbar"
  | "radio"
  | "radiogroup"
  | "region"
  | "row"
  | "rowgroup"
  | "rowheader"
  | "scrollbar"
  | "search"
  | "searchbox"
  | "separator"
  | "slider"
  | "spinbutton"
  | "status"
  | "strong"
  | "subscript"
  | "superscript"
  | "switch"
  | "tab"
  | "table"
  | "tablist"
  | "tabpanel"
  | "term"
  | "textbox"
  | "time"
  | "timer"
  | "toolbar"
  | "tooltip"
  | "tree"
  | "treegrid"
  | "treeitem";

export abstract class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  public async goto(
    url: string,
    options: { waitUntil?: "domcontentloaded" | "load" | "networkidle" } = {
      waitUntil: "domcontentloaded",
    },
  ) {
    await this.page.goto(url, options);
    const token = getAccessToken();
    if (token) {
      await this.page.evaluate(`window.REEARTH_E2E_ACCESS_TOKEN = ${JSON.stringify(token)};`);
    }
  }

  public async expectURL(urlOrPattern: string | RegExp): Promise<void> {
    await expect(this.page).toHaveURL(urlOrPattern);
  }

  public async evaluate<T>(fn: () => T): Promise<T> {
    return this.page.evaluate(fn);
  }

  public viewportSize(): { width: number; height: number } | null {
    return this.page.viewportSize();
  }

  public async goBack(): Promise<void> {
    await this.page.goBack();
  }

  public async waitForLoadState(
    state?: "load" | "domcontentloaded" | "networkidle",
  ): Promise<void> {
    await this.page.waitForLoadState(state);
  }

  public url() {
    return this.page.url();
  }

  public async closeNotification(isSuccess = true) {
    await closeNotification(this.page, isSuccess);
  }

  public getByText(text: string | RegExp, options?: { exact?: boolean }): Locator {
    return this.page.getByText(text, options);
  }

  public getByTitle(text: string | RegExp, options?: { exact?: boolean }): Locator {
    return this.page.getByTitle(text, options);
  }

  public getByRole(role: Role, options?: { name?: string | RegExp; exact?: boolean }): Locator {
    return this.page.getByRole(role, options);
  }

  public getByTestId(testId: string | RegExp): Locator {
    return this.page.getByTestId(testId);
  }

  public getByLabel(
    text: string | RegExp,
    options?:
      | {
          exact?: boolean | undefined;
        }
      | undefined,
  ): Locator {
    return this.page.getByLabel(text, options);
  }

  public getByPlaceholder(placeholder: string): Locator {
    return this.page.getByPlaceholder(placeholder);
  }

  public locator(selector: string): Locator {
    return this.page.locator(selector);
  }

  public getCurrentItemId(): string {
    const url = this.page.url();
    return url.split("/").at(-1) as string;
  }

  public async keypress(key: string, delay?: number): Promise<void> {
    await this.page.keyboard.press(key, { delay });
  }

  public async waitForTimeout(timeout: number): Promise<void> {
    await this.page.waitForTimeout(timeout);
  }

  // Common locators shared across POMs
  public get okButton(): Locator {
    return this.getByRole("button", { name: "OK" });
  }

  public get cancelButton(): Locator {
    return this.getByRole("button", { name: "Cancel" });
  }

  public get saveButton(): Locator {
    return this.getByRole("button", { name: "Save" });
  }

  public get backButton(): Locator {
    return this.getByLabel("Back");
  }

  public get searchInput(): Locator {
    return this.getByPlaceholder("input search text");
  }

  public get searchButton(): Locator {
    return this.getByRole("button", { name: "search" });
  }

  public get rootElement(): Locator {
    return this.locator("#root");
  }
}
