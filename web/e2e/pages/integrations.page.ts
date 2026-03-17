// e2e/pages/integrations.page.ts
import { type Locator } from "@reearth-cms/e2e/fixtures/test";
import { t } from "@reearth-cms/e2e/support/i18n";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";

import { SettingsScopedPage } from "./settings-scoped.page";

export class IntegrationsPage extends SettingsScopedPage {
  // Navigation
  public get myIntegrationsMenuItem(): Locator {
    return this.getByText(t("My Integrations"));
  }

  // Integration management
  public get createIntegrationButton(): Locator {
    return this.getByRole("button", { name: `plus ${t("Create new integration")}` });
  }
  public get integrationNameInput(): Locator {
    return this.getByLabel(t("Integration Name"));
  }
  public get descriptionInput(): Locator {
    return this.getByLabel(t("Description"));
  }
  public get createButton(): Locator {
    return this.getByRole("button", { name: t("Create"), exact: true });
  }
  public get removeIntegrationButton(): Locator {
    return this.getByTestId(
      DATA_TEST_ID.MyIntegrations__Settings__DangerZone__RemoveIntegrationButton,
    );
  }
  public override get okButton(): Locator {
    return this.getByTestId(
      DATA_TEST_ID.MyIntegrations__Settings__DangerZone__ConfirmRemoveIntegrationButton,
    );
  }

  // Webhook management
  public get webhookTab(): Locator {
    return this.getByRole("tab", { name: t("Webhook") });
  }
  public get generalTab(): Locator {
    return this.getByRole("tab", { name: t("General") });
  }
  public get newWebhookButton(): Locator {
    return this.getByRole("button", { name: `plus ${t("new webhook")}` }).first();
  }
  public get webhookNameInput(): Locator {
    return this.getByRole("tabpanel").getByLabel(t("Name"));
  }
  public get urlInput(): Locator {
    return this.getByLabel(t("Url"));
  }
  public get secretInput(): Locator {
    return this.getByLabel(t("Secret"));
  }
  public get createCheckbox(): Locator {
    return this.getByRole("checkbox", { name: t("Create") });
  }
  public get uploadCheckbox(): Locator {
    return this.getByRole("checkbox", { name: t("Upload") });
  }
  public get arrowLeftButton(): Locator {
    return this.getByRole("button", { name: "arrow-left" });
  }
  public get settingButton(): Locator {
    return this.getByRole("button", { name: "setting" });
  }
  public get webhookSwitch(): Locator {
    return this.getByRole("switch", { name: "OFF" });
  }
  public get deleteWebhookButton(): Locator {
    return this.getByRole("button", { name: "delete" });
  }

  // Content areas
  public get mainElement(): Locator {
    return this.getByRole("main");
  }
  public get tabPanel(): Locator {
    return this.getByRole("tabpanel");
  }
  public get webhookLabel(): Locator {
    return this.getByLabel(t("Webhook"));
  }

  // Dynamic text locators
  public integrationTextByName(name: string, description: string): Locator {
    return this.getByText(`${name}${description}`, { exact: true });
  }

  public integrationLinkByText(text: string): Locator {
    return this.getByText(text);
  }

  // Switch elements
  public get webhookSwitchElement(): Locator {
    return this.getByRole("switch");
  }

  // Input fields in tabpanel
  public get tabpanelNameInput(): Locator {
    return this.getByRole("tabpanel").getByLabel(t("Name"));
  }

  // Integration management
  public get connectIntegrationButton(): Locator {
    return this.getByRole("button", { name: `api ${t("Connect Integration")}` }).first();
  }

  public get connectButton(): Locator {
    return this.getByRole("button", { name: t("Connect"), exact: true });
  }

  public override get cancelButton(): Locator {
    return this.getByRole("button", { name: t("Cancel"), exact: true });
  }

  public get settingSvgButton(): Locator {
    return this.getByRole("cell", { name: "setting" }).locator("svg");
  }

  public get readerRoleOption(): Locator {
    return this.getByTitle("Reader").last();
  }

  public get writerRoleOption(): Locator {
    return this.getByTitle("Writer");
  }

  public get writerCell(): Locator {
    return this.getByRole("cell", { name: "WRITER" });
  }

  public get selectAllCheckbox(): Locator {
    return this.getByLabel("", { exact: true });
  }

  public get removeText(): Locator {
    return this.getByText(t("Remove"));
  }

  // Dynamic locators for integration-specific content
  public integrationTextById(id: string): Locator {
    return this.getByText(id, { exact: true }).first();
  }

  public integrationCellById(id: string): Locator {
    return this.getByRole("cell", { name: id, exact: true });
  }

  public dialogIntegrationTextById(id: string): Locator {
    return this.getByRole("dialog").getByText(id, { exact: true });
  }
}
