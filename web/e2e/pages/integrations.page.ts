// e2e/pages/integrations.page.ts
import { type Locator } from "@reearth-cms/e2e/fixtures/test";

import { BasePage } from "./base.page";

export class IntegrationsPage extends BasePage {
  // Workspace Integrations - Main table and actions
  get connectIntegrationButton(): Locator {
    return this.getByTestId("integration-connect-button").first();
  }
  get searchInput(): Locator {
    return this.getByTestId("integration-search-input");
  }
  get settingsButton(): Locator {
    return this.getByTestId("integration-settings-button");
  }
  get removeButton(): Locator {
    return this.getByTestId("integration-remove-button");
  }

  // Integration Connect Modal
  get integrationConnectModal(): Locator {
    return this.getByTestId("integration-connect-modal");
  }
  get integrationConnectOkButton(): Locator {
    return this.getByTestId("integration-connect-ok-button");
  }
  get integrationConnectCancelButton(): Locator {
    return this.getByTestId("integration-connect-cancel-button");
  }

  // Integration Settings Modal
  get integrationSettingsModal(): Locator {
    return this.getByTestId("integration-settings-modal");
  }
  get integrationRoleSelect(): Locator {
    return this.getByTestId("integration-role-select");
  }
  get integrationSettingsSaveButton(): Locator {
    return this.getByTestId("integration-settings-save-button");
  }
  get integrationSettingsCancelButton(): Locator {
    return this.getByTestId("integration-settings-cancel-button");
  }

  // My Integrations - Creation and management
  get myIntegrationNameInput(): Locator {
    return this.getByTestId("myintegration-name-input");
  }
  get myIntegrationDescriptionInput(): Locator {
    return this.getByTestId("myintegration-description-input");
  }
  get myIntegrationCreateModal(): Locator {
    return this.getByTestId("myintegration-create-modal");
  }
  get myIntegrationCreateOkButton(): Locator {
    return this.getByTestId("myintegration-create-ok-button");
  }
  get myIntegrationCreateCancelButton(): Locator {
    return this.getByTestId("myintegration-create-cancel-button");
  }
  get myIntegrationTokenInput(): Locator {
    return this.getByTestId("myintegration-token-input");
  }
  get myIntegrationRegenerateButton(): Locator {
    return this.getByTestId("myintegration-regenerate-button");
  }
  get myIntegrationSaveButton(): Locator {
    return this.getByTestId("myintegration-save-button");
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
    return this.getByTestId("webhook-name-input");
  }
  get webhookUrlInput(): Locator {
    return this.getByTestId("webhook-url-input");
  }
  get webhookSecretInput(): Locator {
    return this.getByTestId("webhook-secret-input");
  }
  get webhookSaveButton(): Locator {
    return this.getByTestId("webhook-save-button");
  }
  get webhookBackButton(): Locator {
    return this.getByTestId("webhook-back-button");
  }
  get webhookTriggerCheckboxGroup(): Locator {
    return this.getByTestId("webhook-trigger-checkboxgroup");
  }
  get webhookSwitch(): Locator {
    return this.getByRole("switch", { name: "OFF" });
  }
  get deleteWebhookButton(): Locator {
    return this.getByRole("button", { name: "delete" });
  }

  // Dynamic webhook trigger checkbox
  webhookTriggerCheckbox(triggerName: string): Locator {
    return this.getByTestId(`webhook-trigger-${triggerName.toLowerCase()}-checkbox`);
  }

  // Legacy locators (kept for backwards compatibility with existing tests)
  get integrationsMenuItem(): Locator {
    return this.getByText("Integrations", { exact: true });
  }
  get myIntegrationsMenuItem(): Locator {
    return this.getByText("My Integrations");
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

  // Aliases for backwards compatibility (map old names to new data-testid locators)
  get createIntegrationButton(): Locator {
    return this.getByRole("button", { name: "plus Create new integration" });
  }
  get integrationNameInput(): Locator {
    return this.myIntegrationNameInput;
  }
  get descriptionInput(): Locator {
    return this.myIntegrationDescriptionInput;
  }
  get createButton(): Locator {
    return this.myIntegrationCreateOkButton;
  }
  get connectButton(): Locator {
    return this.integrationConnectOkButton;
  }
  get cancelButton(): Locator {
    return this.integrationConnectCancelButton;
  }
  get searchButton(): Locator {
    return this.getByRole("button", { name: "search" });
  }
  get settingSvgButton(): Locator {
    return this.settingsButton;
  }
  get saveButton(): Locator {
    return this.integrationSettingsSaveButton;
  }
  get removeText(): Locator {
    return this.removeButton;
  }
  get okButton(): Locator {
    return this.getByRole("button", { name: "OK" });
  }
  get removeIntegrationButton(): Locator {
    return this.getByTestId("remove-integration");
  }
  get urlInput(): Locator {
    return this.webhookUrlInput;
  }
  get secretInput(): Locator {
    return this.webhookSecretInput;
  }
  get arrowLeftButton(): Locator {
    return this.webhookBackButton;
  }
  get settingButton(): Locator {
    return this.getByRole("button", { name: "setting" });
  }
  get tabpanelNameInput(): Locator {
    return this.webhookNameInput;
  }
  get createCheckbox(): Locator {
    return this.webhookTriggerCheckbox("onitemcreate");
  }
  get uploadCheckbox(): Locator {
    return this.webhookTriggerCheckbox("onassetupload");
  }
  get rootElement(): Locator {
    return this.locator("main");
  }
  get backButton(): Locator {
    return this.getByLabel("Back");
  }
  get mainElement(): Locator {
    return this.locator("main");
  }
  get tabPanel(): Locator {
    return this.getByRole("tabpanel");
  }
  get webhookSwitchElement(): Locator {
    return this.webhookSwitch;
  }
  get webhookLabel(): Locator {
    return this.getByText("Webhook");
  }

  // Dynamic locators for integration-specific content
  integrationTextByName(name: string, description: string): Locator {
    return this.getByText(`${name}${description}`, { exact: true });
  }
  integrationLinkByText(text: string): Locator {
    return this.getByText(text);
  }
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
