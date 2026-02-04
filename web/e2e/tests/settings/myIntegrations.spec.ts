import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";

let integrationName: string;
let newIntegrationName: string;
let newDescription: string;

test.beforeEach(async ({ reearth, integrationsPage }) => {
  integrationName = getId();
  newIntegrationName = getId();
  newDescription = `newDescription-${getId()}`;
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await integrationsPage.myIntegrationsMenuItem.click();
  await integrationsPage.createIntegrationButton.click();

  await integrationsPage.integrationNameInput.click();
  await integrationsPage.integrationNameInput.fill(integrationName);
  await integrationsPage.descriptionInput.click();
  await integrationsPage.descriptionInput.fill(newDescription);
  await integrationsPage.createButton.click();
  await integrationsPage.closeNotification();

  await integrationsPage.integrationTextByName(integrationName, newDescription).last().click();
});

test("MyIntegration CRUD has succeeded", async ({ integrationsPage, page }) => {
  await test.step("Update integration name and description", async () => {
    await integrationsPage.integrationNameInput.click();
    await integrationsPage.integrationNameInput.fill(newIntegrationName);
    await integrationsPage.descriptionInput.click();
    await integrationsPage.descriptionInput.fill(newDescription);
    await integrationsPage.saveButton.click();
    await integrationsPage.closeNotification();
    await page.waitForTimeout(300);
  });

  await test.step("Verify updated integration details", async () => {
    await expect(integrationsPage.rootElement).toContainText(newIntegrationName);
    await integrationsPage.backButton.click();
    await expect(integrationsPage.MyIntegrationListWrapper).toContainText(newDescription);
    await page.waitForTimeout(300);
  });

  await test.step("Delete integration", async () => {
    await integrationsPage.integrationLinkByText(newDescription).click();
    await integrationsPage.removeIntegrationButton.click();
    await integrationsPage.okButton.click();
    await integrationsPage.closeNotification();
    // Wait for navigation back to the list and ensure the deleted item is no longer visible
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(300);
    await expect(integrationsPage.integrationLinkByText(newDescription)).toBeHidden();
    await page.waitForTimeout(300);
  });
});

test("Webhook CRUD has succeeded", async ({ integrationsPage, page }) => {
  await test.step("Create webhook with basic configuration", async () => {
    await expect(integrationsPage.webhookTab).toBeVisible();
    await integrationsPage.webhookTab.click();
    await page.waitForTimeout(300);
    await expect(integrationsPage.newWebhookButton).toBeVisible();
    await integrationsPage.newWebhookButton.click();
    await expect(integrationsPage.webhookNameInput).toBeVisible();
    await integrationsPage.webhookNameInput.click();
    await integrationsPage.webhookNameInput.fill("webhook name");
    await expect(integrationsPage.urlInput).toBeVisible();
    await integrationsPage.urlInput.click();
    await integrationsPage.urlInput.fill("http://test.com");
    await expect(integrationsPage.secretInput).toBeVisible();
    await integrationsPage.secretInput.click();
    await integrationsPage.secretInput.fill("secret");
    await expect(integrationsPage.saveButton).toBeVisible();
    await integrationsPage.saveButton.click();
    await integrationsPage.closeNotification();
    await page.waitForTimeout(300);
  });

  await test.step("Verify webhook created with correct details", async () => {
    await expect(integrationsPage.arrowLeftButton).toBeVisible();
    await integrationsPage.arrowLeftButton.click();
    await page.waitForTimeout(300);
    await expect(integrationsPage.tabPanel).toContainText("webhook name");
    await expect(integrationsPage.tabPanel).toContainText("http://test.com");
    await page.waitForTimeout(300);
  });

  await test.step("Update webhook settings and enable triggers", async () => {
    await expect(integrationsPage.settingButton).toBeVisible();
    await integrationsPage.settingButton.click();
    await page.waitForTimeout(300);
    await expect(integrationsPage.tabpanelNameInput).toBeVisible();
    await integrationsPage.tabpanelNameInput.click();
    await integrationsPage.tabpanelNameInput.fill("new webhook name");
    await expect(integrationsPage.urlInput).toBeVisible();
    await integrationsPage.urlInput.click();
    await integrationsPage.urlInput.fill("http://new.com");
    await expect(integrationsPage.secretInput).toBeVisible();
    await integrationsPage.secretInput.click();
    await integrationsPage.secretInput.fill("new secret");
    await expect(integrationsPage.createCheckbox).toBeVisible();
    await integrationsPage.createCheckbox.click();
    await expect(integrationsPage.createCheckbox).toBeChecked();
    await expect(integrationsPage.uploadCheckbox).toBeVisible();
    await integrationsPage.uploadCheckbox.click();
    await expect(integrationsPage.uploadCheckbox).toBeChecked();
    await expect(integrationsPage.saveButton).toBeVisible();
    await integrationsPage.saveButton.click();
    await integrationsPage.closeNotification();
    await page.waitForTimeout(300);
  });

  await test.step("Verify webhook updated correctly", async () => {
    await expect(integrationsPage.arrowLeftButton).toBeVisible();
    await integrationsPage.arrowLeftButton.click();
    await page.waitForTimeout(300);
    await expect(integrationsPage.tabPanel).toContainText("new webhook name");
    await expect(integrationsPage.tabPanel).toContainText("http://new.com");
    await page.waitForTimeout(300);
  });

  await test.step("Verify webhook settings persisted", async () => {
    await expect(integrationsPage.settingButton).toBeVisible();
    await integrationsPage.settingButton.click();
    await page.waitForTimeout(300);
    await expect(integrationsPage.secretInput).toHaveValue("new secret");
    await expect(integrationsPage.createCheckbox).toBeChecked();
    await expect(integrationsPage.uploadCheckbox).toBeChecked();
    await expect(integrationsPage.arrowLeftButton).toBeVisible();
    await integrationsPage.arrowLeftButton.click();
    await page.waitForTimeout(300);
  });

  await test.step("Enable webhook and verify status", async () => {
    await expect(integrationsPage.webhookSwitch).toBeVisible();
    await integrationsPage.webhookSwitch.click();
    await page.waitForTimeout(300);
    await expect(integrationsPage.webhookSwitchElement).toContainText("ON");
    await integrationsPage.closeNotification();
    await page.waitForTimeout(300);
  });

  await test.step("Delete webhook", async () => {
    await expect(integrationsPage.deleteWebhookButton).toBeVisible();
    await integrationsPage.deleteWebhookButton.click();
    await page.waitForTimeout(300);
    await integrationsPage.closeNotification();
    await expect(integrationsPage.webhookLabel).not.toContainText("new webhook name");
    await page.waitForTimeout(300);
  });

  await test.step("Clean up: remove integration", async () => {
    await expect(integrationsPage.generalTab).toBeVisible();
    await integrationsPage.generalTab.click();
    await page.waitForTimeout(300);
    await expect(integrationsPage.removeIntegrationButton).toBeVisible();
    await integrationsPage.removeIntegrationButton.click();
    await expect(integrationsPage.okButton).toBeVisible();
    await integrationsPage.okButton.click();
    await integrationsPage.closeNotification();
    await page.waitForTimeout(300);
  });
});
