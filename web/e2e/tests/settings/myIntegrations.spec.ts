import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";

const NEW_PREFIX = "new-";
const INTEGRATION_NAME = "integration-" + getId();
const NEW_INTEGRATION_NAME = NEW_PREFIX + INTEGRATION_NAME;
const INTEGRATION_DESCRIPTION = "description-" + getId();
const NEW_INTEGRATION_DESCRIPTION = NEW_PREFIX + INTEGRATION_DESCRIPTION;
const WEBHOOK_NAME = "webhook-" + getId();
const WEBHOOK_SECRET = "secret-" + getId();
const NEW_WEBHOOK_SECRET = NEW_PREFIX + WEBHOOK_SECRET;
const NEW_WEBHOOK_NAME = NEW_PREFIX + WEBHOOK_NAME;
const WEBHOOK_URL = "http://test.com/";
const NEW_WEBHOOK_URL = "http://new.com/";

test.beforeEach(async ({ reearth, integrationsPage }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await integrationsPage.myIntegrationsMenuItem.click();
  await integrationsPage.createIntegrationButton.click();

  await integrationsPage.integrationNameInput.click();
  await integrationsPage.integrationNameInput.fill(INTEGRATION_NAME);
  await integrationsPage.descriptionInput.click();
  await integrationsPage.descriptionInput.fill(INTEGRATION_DESCRIPTION);
  await integrationsPage.createButton.click();
  await integrationsPage.closeNotification();

  await integrationsPage
    .integrationTextByName(INTEGRATION_NAME, INTEGRATION_DESCRIPTION)
    .last()
    .click();
});

test("MyIntegration CRUD has succeeded", async ({ integrationsPage }) => {
  // test.skip();
  await integrationsPage.integrationNameInput.click();
  await integrationsPage.integrationNameInput.fill(NEW_INTEGRATION_NAME);
  await integrationsPage.descriptionInput.click();
  await integrationsPage.descriptionInput.fill(NEW_INTEGRATION_DESCRIPTION);
  await integrationsPage.saveButton.click();
  await integrationsPage.closeNotification();

  await expect(integrationsPage.rootElement).toContainText(NEW_INTEGRATION_NAME);
  await integrationsPage.backButton.click();
  await expect(integrationsPage.mainElement).toContainText(NEW_INTEGRATION_DESCRIPTION);
  await integrationsPage.integrationLinkByText(NEW_INTEGRATION_DESCRIPTION).click();
  await integrationsPage.removeIntegrationButton.click();
  await integrationsPage.okButton.click();
  await integrationsPage.closeNotification();
  await expect(integrationsPage.mainElement).not.toContainText(NEW_INTEGRATION_DESCRIPTION);
});

test("Webhook CRUD has succeeded", async ({ integrationsPage }) => {
  // test.skip();
  await integrationsPage.webhookTab.click();
  await integrationsPage.newWebhookButton.click();
  await integrationsPage.webhookNameInput.click();
  await integrationsPage.webhookNameInput.fill(WEBHOOK_NAME);
  await integrationsPage.urlInput.click();
  await integrationsPage.urlInput.fill(WEBHOOK_URL);
  await integrationsPage.secretInput.click();
  await integrationsPage.secretInput.fill(WEBHOOK_SECRET);
  await integrationsPage.saveButton.click();
  await integrationsPage.closeNotification();
  await integrationsPage.arrowLeftButton.click();
  await expect(integrationsPage.tabPanel).toContainText(WEBHOOK_NAME);
  await expect(integrationsPage.tabPanel).toContainText(WEBHOOK_URL);

  await integrationsPage.settingButton.click();
  await integrationsPage.tabpanelNameInput.click();
  await integrationsPage.tabpanelNameInput.fill(NEW_WEBHOOK_NAME);
  await integrationsPage.urlInput.click();
  await integrationsPage.urlInput.fill(NEW_WEBHOOK_URL);
  await integrationsPage.secretInput.click();
  await integrationsPage.secretInput.fill(NEW_WEBHOOK_SECRET);
  await integrationsPage.createCheckbox.check({ force: true });
  await expect(integrationsPage.createCheckbox).toBeChecked();
  await integrationsPage.uploadCheckbox.check({ force: true });
  await expect(integrationsPage.uploadCheckbox).toBeChecked();
  await integrationsPage.saveButton.click({ force: true });
  await integrationsPage.closeNotification();
  await integrationsPage.arrowLeftButton.click({ force: true });
  await expect(integrationsPage.tabPanel).toContainText(NEW_WEBHOOK_NAME);
  await expect(integrationsPage.tabPanel).toContainText(NEW_WEBHOOK_URL);

  await integrationsPage.settingButton.click();
  await expect(integrationsPage.secretInput).toHaveValue(NEW_WEBHOOK_SECRET);
  await expect(integrationsPage.createCheckbox).toBeChecked();
  await expect(integrationsPage.uploadCheckbox).toBeChecked();
  await integrationsPage.arrowLeftButton.click();
  await integrationsPage.webhookSwitch.click();
  await expect(integrationsPage.webhookSwitchElement).toContainText("ON");
  await integrationsPage.closeNotification();
  await integrationsPage.deleteWebhookButton.click();
  await integrationsPage.closeNotification();
  await expect(integrationsPage.webhookLabel).not.toContainText(NEW_WEBHOOK_NAME);

  await integrationsPage.generalTab.click();
  await integrationsPage.removeIntegrationButton.click();
  await integrationsPage.okButton.click();
  await integrationsPage.closeNotification();
});
