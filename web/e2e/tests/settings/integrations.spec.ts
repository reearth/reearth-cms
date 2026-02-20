import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";

let id: string;

test.beforeEach(async ({ reearth }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  id = getId();
});

test.afterEach(async ({ integrationsPage }) => {
  await integrationsPage.myIntegrationsMenuItem.click();
  await expect(integrationsPage.integrationTextById(id)).toBeVisible();
  await integrationsPage.integrationTextById(id).click();
  await integrationsPage.removeIntegrationButton.click();
  await integrationsPage.okButton.click();
  await expect(integrationsPage.integrationTextById(id)).toBeHidden();
});

test("Integration CRUD and searching has succeeded", async ({ integrationsPage, page }) => {
  await test.step("Create integration", async () => {
    await integrationsPage.myIntegrationsMenuItem.click();
    await expect(integrationsPage.createIntegrationButton).toBeVisible();
    await integrationsPage.createIntegrationButton.click();
    await expect(integrationsPage.integrationNameInput).toBeVisible();
    await integrationsPage.integrationNameInput.click();
    await integrationsPage.integrationNameInput.fill(id);
    await integrationsPage.descriptionInput.click();
    await integrationsPage.descriptionInput.fill("e2e integration description");
    await integrationsPage.createButton.click();
    await integrationsPage.closeNotification();
  });

  await test.step("Connect integration", async () => {
    await integrationsPage.integrationsMenuItem.click();

    await expect(integrationsPage.connectIntegrationButton).toBeVisible();
    await integrationsPage.connectIntegrationButton.click();
    await expect(integrationsPage.integrationTextById(id)).toBeVisible();
    await integrationsPage.integrationTextById(id).click();
    await expect(integrationsPage.connectButton).toBeVisible();
    await integrationsPage.connectButton.click();
    await integrationsPage.closeNotification();
  });

  await test.step("Verify integration is connected", async () => {
    await expect(integrationsPage.integrationCellById(id)).toBeVisible();
    await expect(integrationsPage.connectIntegrationButton).toBeVisible();
    await integrationsPage.connectIntegrationButton.click();
    await expect(integrationsPage.dialogIntegrationTextById(id)).toBeHidden();
    await expect(integrationsPage.cancelButton).toBeVisible();
    await integrationsPage.cancelButton.click();
  });

  await test.step("Search and update role", async () => {
    await integrationsPage.searchInput.click();
    await integrationsPage.searchInput.fill(id);
    await integrationsPage.searchButton.click();

    await expect(integrationsPage.settingSvgButton).toBeVisible();
    await integrationsPage.settingSvgButton.click();
    await expect(integrationsPage.readerRoleOption).toBeVisible();
    await integrationsPage.readerRoleOption.click();
    await integrationsPage.writerRoleOption.click();
    await expect(integrationsPage.saveButton).toBeVisible();
    await integrationsPage.saveButton.click();
    await integrationsPage.closeNotification();
    await expect(integrationsPage.writerCell).toBeVisible();
  });

  await test.step("Test search filtering", async () => {
    await integrationsPage.searchInput.click();
    await integrationsPage.searchInput.fill("no integration");
    await integrationsPage.searchButton.click();

    await expect(integrationsPage.integrationCellById(id)).toBeHidden();
    await integrationsPage.searchInput.click();
    await integrationsPage.searchInput.fill(id);
    await integrationsPage.searchButton.click();

    await expect(integrationsPage.integrationCellById(id)).toBeVisible();
  });

  await test.step("Remove integration and verify", async () => {
    await expect(integrationsPage.selectAllCheckbox).toBeVisible();
    await integrationsPage.selectAllCheckbox.check();
    await expect(integrationsPage.removeText).toBeVisible();
    await integrationsPage.removeText.click();
    await integrationsPage.closeNotification();
    await expect(integrationsPage.connectIntegrationButton).toBeVisible();
    await integrationsPage.connectIntegrationButton.click();
    await expect(integrationsPage.dialogIntegrationTextById(id)).toBeVisible();
    await expect(integrationsPage.cancelButton).toBeVisible();
    await integrationsPage.cancelButton.click();
  });
});
