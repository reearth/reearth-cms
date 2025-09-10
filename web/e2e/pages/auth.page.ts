// e2e/pages/auth.page.ts
import { type Locator } from "@reearth-cms/e2e/fixtures/test";

import { BasePage } from "./base.page";

export class AuthPage extends BasePage {
  // Navigation and user menu
  get userMenuLink(): Locator {
    return this.locator("a").nth(1);
  }
  get logoutButton(): Locator {
    return this.getByText("Logout");
  }
}