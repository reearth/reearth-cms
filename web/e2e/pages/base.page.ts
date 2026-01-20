import { type Page, type Locator } from "@reearth-cms/e2e/fixtures/test";
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

  async goto(url: string, options?: { waitUntil?: "domcontentloaded" | "load" | "networkidle" }) {
    await this.page.goto(url, options);
  }

  url() {
    return this.page.url();
  }

  async closeNotification(isSuccess = true) {
    await closeNotification(this.page, isSuccess);
  }

  getByText(text: string | RegExp, options?: { exact?: boolean }): Locator {
    return this.page.getByText(text, options);
  }

  getByTitle(text: string | RegExp, options?: { exact?: boolean }): Locator {
    return this.page.getByTitle(text, options);
  }

  getByRole(role: Role, options?: { name?: string | RegExp; exact?: boolean }): Locator {
    return this.page.getByRole(role, options);
  }

  getByTestId(testId: string | RegExp): Locator {
    return this.page.getByTestId(testId);
  }

  getByLabel(
    text: string | RegExp,
    options?:
      | {
          exact?: boolean | undefined;
        }
      | undefined,
  ): Locator {
    return this.page.getByLabel(text, options);
  }

  getByPlaceholder(placeholder: string): Locator {
    return this.page.getByPlaceholder(placeholder);
  }

  locator(selector: string): Locator {
    return this.page.locator(selector);
  }

  getCurrentItemId(): string {
    const url = this.page.url();
    return url.split("/").at(-1) as string;
  }

  async keypress(key: string, delay?: number): Promise<void> {
    await this.page.keyboard.press(key, { delay });
  }

  async keyboardType(text: string, option: { delay?: number } = {}): Promise<void> {
    await this.page.keyboard.type(text, option);
  }
}
