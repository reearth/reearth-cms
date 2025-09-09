import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { type Page, type Locator } from "@reearth-cms/e2e/fixtures/test";

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
  constructor(protected page: Page) {}

  async goto(url: string, options?: { waitUntil?: "domcontentloaded" | "load" | "networkidle" }) {
    await this.page.goto(url, options);
  }

  async closeNotification() {
    await closeNotification(this.page);
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
}
