import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";

let integrationName: string;
let newIntegrationName: string;

test.beforeEach(async ({ reearth, integrationsPage }) => {
  integrationName = getId();
  newIntegrationName = getId();
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await integrationsPage.myIntegrationsMenuItem.click();
  await integrationsPage.createIntegrationButton.click();

  await integrationsPage.integrationNameInput.click();
  await integrationsPage.integrationNameInput.fill(integrationName);
  await integrationsPage.descriptionInput.click();
  await integrationsPage.descriptionInput.fill("description");
  await integrationsPage.createButton.click();
  await integrationsPage.closeNotification();

  await integrationsPage.integrationTextByName(integrationName, "description").last().click();
});

test("MyIntegration CRUD has succeeded", async ({ integrationsPage }) => {
  test.slow();
  await integrationsPage.integrationNameInput.click();
  await integrationsPage.integrationNameInput.fill(newIntegrationName);
  await integrationsPage.descriptionInput.click();
  await integrationsPage.descriptionInput.fill("newDescription");
  await integrationsPage.saveButton.click();
  await integrationsPage.closeNotification();

  await expect(integrationsPage.rootElement).toContainText(newIntegrationName);
  await integrationsPage.backButton.click();
  await expect(integrationsPage.mainElement).toContainText("newDescription");
  await integrationsPage.integrationLinkByText("newDescription").click();
  await integrationsPage.removeIntegrationButton.click();
  await integrationsPage.okButton.click();
  await integrationsPage.closeNotification();
  await expect(integrationsPage.mainElement).not.toContainText("newDescription");
});

test("Webhook CRUD has succeeded", async ({ integrationsPage }) => {
  await integrationsPage.webhookTab.click();
  await integrationsPage.newWebhookButton.click();
  await integrationsPage.webhookNameInput.click();
  await integrationsPage.webhookNameInput.fill("webhook name");
  await integrationsPage.urlInput.click();
  await integrationsPage.urlInput.fill("http://test.com");
  await integrationsPage.secretInput.click();
  await integrationsPage.secretInput.fill("secret");
  await integrationsPage.saveButton.click();
  await integrationsPage.closeNotification();
  await integrationsPage.arrowLeftButton.click();
  await expect(integrationsPage.tabPanel).toContainText("webhook name");
  await expect(integrationsPage.tabPanel).toContainText("http://test.com");

  await integrationsPage.settingButton.click();
  await integrationsPage.tabpanelNameInput.click();
  await integrationsPage.tabpanelNameInput.fill("new webhook name");
  await integrationsPage.urlInput.click();
  await integrationsPage.urlInput.fill("http://new.com");
  await integrationsPage.secretInput.click();
  await integrationsPage.secretInput.fill("new secret");
  await integrationsPage.createCheckbox.setChecked(true, { force: true });
  await expect(integrationsPage.createCheckbox).toBeChecked();
  await integrationsPage.uploadCheckbox.check();
  await expect(integrationsPage.uploadCheckbox).toBeChecked();
  await integrationsPage.saveButton.click();
  await integrationsPage.closeNotification();
  await integrationsPage.arrowLeftButton.click();
  await expect(integrationsPage.tabPanel).toContainText("new webhook name");
  await expect(integrationsPage.tabPanel).toContainText("http://new.com");

  await integrationsPage.settingButton.click();
  await expect(integrationsPage.secretInput).toHaveValue("new secret");
  await expect(integrationsPage.createCheckbox).toBeChecked();
  await expect(integrationsPage.uploadCheckbox).toBeChecked();
  await integrationsPage.arrowLeftButton.click();
  await integrationsPage.webhookSwitch.click();
  await expect(integrationsPage.webhookSwitchElement).toContainText("ON");
  await integrationsPage.closeNotification();
  await integrationsPage.deleteWebhookButton.click();
  await integrationsPage.closeNotification();
  await expect(integrationsPage.webhookLabel).not.toContainText("new webhook name");

  await integrationsPage.generalTab.click();
  await integrationsPage.removeIntegrationButton.click();
  await integrationsPage.okButton.click();
  await integrationsPage.closeNotification();
});
