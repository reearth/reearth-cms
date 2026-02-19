// e2e/pages/member.page.ts
import { type Locator } from "@reearth-cms/e2e/fixtures/test";

import { SettingsScopedPage } from "./settings-scoped.page";

export class MemberPage extends SettingsScopedPage {
  // Search functionality
  get clearSearchButton(): Locator {
    return this.getByRole("button", { name: "close-circle" });
  }

  // Table elements
  cellByText(text: string, exact = false): Locator {
    return this.getByRole("cell", { name: text, exact });
  }
}
