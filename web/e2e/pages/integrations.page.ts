// e2e/pages/integrations.page.ts
import { type Locator } from "@reearth-cms/e2e/fixtures/test";

import { BasePage } from "./base.page";

export class IntegrationsPage extends BasePage {
  // Navigation
  get myIntegrationsMenuItem(): Locator {
    return this.getByText("My Integrations");
  }

  // Integration management
  get createIntegrationButton(): Locator {
    return this.getByRole("button", { name: "plus Create new integration" });
  }
  get integrationNameInput(): Locator {
    return this.getByLabel("Integration Name");
  }
  get descriptionInput(): Locator {
    return this.getByLabel("Description");
  }
  get createButton(): Locator {
    return this.getByRole("button", { name: "Create", exact: true });
  }
  get saveButton(): Locator {
    return this.getByRole("button", { name: "Save" });
  }
  get removeIntegrationButton(): Locator {
    return this.getByRole("button", { name: "Remove Integration" });
  }
  get okButton(): Locator {
    return this.getByRole("button", { name: "OK" });
  }
  get backButton(): Locator {
    return this.getByLabel("Back");
  }

  // Webhook management
  get webhookTab(): Locator {
    return this.getByRole("tab", { name: "Webhook" });
  }
  get generalTab(): Locator {
    return this.getByRole("tab", { name: "General" });
  }
  get newWebhookButton(): Locator {
    return this.getByRole("button", { name: "plus new webhook" }).first();
  }
  get webhookNameInput(): Locator {
    return this.getByRole("tabpanel").getByLabel("Name");
  }
  get urlInput(): Locator {
    return this.getByLabel("Url");
  }
  get secretInput(): Locator {
    return this.getByLabel("Secret");
  }
  get createCheckbox(): Locator {
    return this.getByLabel("Create");
  }
  get uploadCheckbox(): Locator {
    return this.getByLabel("Upload");
  }
  get arrowLeftButton(): Locator {
    return this.getByRole("button", { name: "arrow-left" });
  }
  get settingButton(): Locator {
    return this.getByRole("button", { name: "setting" });
  }
  get webhookSwitch(): Locator {
    return this.getByRole("switch", { name: "OFF" });
  }
  get deleteWebhookButton(): Locator {
    return this.getByRole("button", { name: "delete" });
  }

  // Content areas
  get rootElement(): Locator {
    return this.locator("#root");
  }
  get mainElement(): Locator {
    return this.getByRole("main");
  }
  get tabPanel(): Locator {
    return this.getByRole("tabpanel");
  }
  get webhookLabel(): Locator {
    return this.getByLabel("Webhook");
  }

  // Dynamic text locators
  integrationTextByName(name: string, description: string): Locator {
    return this.getByText(`${name}${description}`, { exact: true });
  }

  integrationLinkByText(text: string): Locator {
    return this.getByText(text);
  }

  // Switch elements
  get webhookSwitchElement(): Locator {
    return this.getByRole("switch");
  }

  // Input fields in tabpanel
  get tabpanelNameInput(): Locator {
    return this.getByRole("tabpanel").getByLabel("Name");
  }

  // New locators for integration management
  get integrationsMenuItem(): Locator {
    return this.getByText("Integrations", { exact: true });
  }

  get connectIntegrationButton(): Locator {
    return this.getByRole("button", { name: "api Connect Integration" }).first();
  }

  get connectButton(): Locator {
    return this.getByRole("button", { name: "Connect", exact: true });
  }

  get cancelButton(): Locator {
    return this.getByRole("button", { name: "Cancel", exact: true });
  }

  get searchInput(): Locator {
    return this.getByPlaceholder("input search text");
  }

  get searchButton(): Locator {
    return this.getByRole("button", { name: "search" });
  }

  get settingSvgButton(): Locator {
    return this.getByRole("cell", { name: "setting" }).locator("svg");
  }

  get readerRoleOption(): Locator {
    return this.locator("div")
      .filter({ hasText: /^Reader$/ })
      .nth(4);
  }

  get writerRoleOption(): Locator {
    return this.getByTitle("Writer");
  }

  get writerCell(): Locator {
    return this.getByRole("cell", { name: "WRITER" });
  }

  get selectAllCheckbox(): Locator {
    return this.getByLabel("", { exact: true });
  }

  get removeText(): Locator {
    return this.getByText("Remove");
  }

  // Dynamic locators for integration-specific content
  integrationTextById(id: string): Locator {
    return this.getByText(id, { exact: true }).first();
  }

  integrationCellById(id: string): Locator {
    return this.getByRole("cell", { name: id, exact: true });
  }

  dialogIntegrationTextById(id: string): Locator {
    return this.getByRole("dialog").getByText(id, { exact: true });
  }
}
