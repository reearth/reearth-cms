// e2e/pages/member.page.ts
import { type Locator } from "@reearth-cms/e2e/fixtures/test";

import { BasePage } from "./base.page";

export class MemberPage extends BasePage {
  // Navigation
  get memberMenuItem(): Locator {
    return this.getByText("Member");
  }

  // Search functionality
  get searchInput(): Locator {
    return this.getByPlaceholder("input search text");
  }
  get searchButton(): Locator {
    return this.getByRole("button", { name: "search" });
  }
  get clearSearchButton(): Locator {
    return this.getByRole("button", { name: "close-circle" });
  }

  // Table elements
  cellByText(text: string, exact = false): Locator {
    return this.getByRole("cell", { name: text, exact });
  }
}