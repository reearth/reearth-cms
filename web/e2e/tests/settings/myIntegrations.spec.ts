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
  test.skip();

  await test.step("Update integration name and description", async () => {
    await integrationsPage.integrationNameInput.click();
    await integrationsPage.integrationNameInput.fill(newIntegrationName);
    await integrationsPage.descriptionInput.click();
    await integrationsPage.descriptionInput.fill("newDescription");
    await integrationsPage.saveButton.click();
    await integrationsPage.closeNotification();
  });

  await test.step("Verify updated integration details", async () => {
    await expect(integrationsPage.rootElement).toContainText(newIntegrationName);
    await integrationsPage.backButton.click();
    await expect(integrationsPage.mainElement).toContainText("newDescription");
  });

  await test.step("Delete integration", async () => {
    await integrationsPage.integrationLinkByText("newDescription").click();
    await integrationsPage.removeIntegrationButton.click();
    await integrationsPage.okButton.click();
    await integrationsPage.closeNotification();
    await expect(integrationsPage.mainElement).not.toContainText("newDescription");
  });
});

test("Webhook CRUD has succeeded", async ({ integrationsPage }) => {
  test.skip();

  await test.step("Create webhook with basic configuration", async () => {
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
  });

  await test.step("Verify webhook created with correct details", async () => {
    await integrationsPage.arrowLeftButton.click();
    await expect(integrationsPage.tabPanel).toContainText("webhook name");
    await expect(integrationsPage.tabPanel).toContainText("http://test.com");
  });

  await test.step("Update webhook settings and enable triggers", async () => {
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
  });

  await test.step("Verify webhook updated correctly", async () => {
    await integrationsPage.arrowLeftButton.click();
    await expect(integrationsPage.tabPanel).toContainText("new webhook name");
    await expect(integrationsPage.tabPanel).toContainText("http://new.com");
  });

  await test.step("Verify webhook settings persisted", async () => {
    await integrationsPage.settingButton.click();
    await expect(integrationsPage.secretInput).toHaveValue("new secret");
    await expect(integrationsPage.createCheckbox).toBeChecked();
    await expect(integrationsPage.uploadCheckbox).toBeChecked();
    await integrationsPage.arrowLeftButton.click();
  });

  await test.step("Enable webhook and verify status", async () => {
    await integrationsPage.webhookSwitch.click();
    await expect(integrationsPage.webhookSwitchElement).toContainText("ON");
    await integrationsPage.closeNotification();
  });

  await test.step("Delete webhook", async () => {
    await integrationsPage.deleteWebhookButton.click();
    await integrationsPage.closeNotification();
    await expect(integrationsPage.webhookLabel).not.toContainText("new webhook name");
  });

  await test.step("Clean up: remove integration", async () => {
    await integrationsPage.generalTab.click();
    await integrationsPage.removeIntegrationButton.click();
    await integrationsPage.okButton.click();
    await integrationsPage.closeNotification();
  });
});
