// e2e/pages/settings-scoped.page.ts
import { type Locator } from "@reearth-cms/e2e/fixtures/test";

import { BasePage } from "./base.page";

export abstract class SettingsScopedPage extends BasePage {
  get memberMenuItem(): Locator {
    return this.getByText("Member");
  }

  get integrationsMenuItem(): Locator {
    return this.getByText("Integrations", { exact: true });
  }

  get homeMenuItem(): Locator {
    return this.getByText("Home");
  }

  get settingsMenuItem(): Locator {
    return this.getByText("Settings").first();
  }
}
