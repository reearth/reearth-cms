import { type Locator, type Page } from "@reearth-cms/e2e/fixtures/test";
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
  | "menu"
  | "menubar"
  | "menuitem"
  | "menuitemcheckbox"
  | "menuitemradio"
  | "meter"
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

  getByText(text: RegExp | string, options?: { exact?: boolean }): Locator {
    return this.page.getByText(text, options);
  }

  getByTitle(text: RegExp | string, options?: { exact?: boolean }): Locator {
    return this.page.getByTitle(text, options);
  }

  getByRole(role: Role, options?: { exact?: boolean; name?: RegExp | string }): Locator {
    return this.page.getByRole(role, options);
  }

  getByTestId(testId: RegExp | string): Locator {
    return this.page.getByTestId(testId);
  }

  getByLabel(
    text: RegExp | string,
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
}
