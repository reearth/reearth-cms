// e2e/pages/settings-scoped.page.ts
import { type Locator } from "@reearth-cms/e2e/fixtures/test";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";

import { BasePage } from "./base.page";

export abstract class SettingsScopedPage extends BasePage {
  get memberMenuItem(): Locator {
    return this.getByTestId(DATA_TEST_ID.WorkspaceMenu__MemberItem);
  }

  get integrationsMenuItem(): Locator {
    return this.getByTestId(DATA_TEST_ID.WorkspaceMenu__IntegrationsItem);
  }

  get homeMenuItem(): Locator {
    return this.getByTestId(DATA_TEST_ID.WorkspaceMenu__HomeItem);
  }

  get settingsMenuItem(): Locator {
    return this.getByTestId(DATA_TEST_ID.WorkspaceMenu__SettingsItem);
  }
}
