import { closeNotification } from "@reearth-cms/e2e/helpers/notification.helper";
import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";

let id: string;

test.beforeEach(() => {
  id = getId();
});

test.afterEach(async ({ integrationsPage }) => {
  await integrationsPage.myIntegrationsMenuItem.click();
  await integrationsPage.integrationTextById(id).click();
  await integrationsPage.removeIntegrationButton.click();
  await integrationsPage.okButton.click();
});

test("Integration CRUD and searching has succeeded", async ({
  reearth,
  page,
  integrationsPage,
}) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await integrationsPage.myIntegrationsMenuItem.click();

  await integrationsPage.createIntegrationButton.click();
  await integrationsPage.integrationNameInput.click();
  await integrationsPage.integrationNameInput.fill(id);
  await integrationsPage.descriptionInput.click();
  await integrationsPage.descriptionInput.fill("e2e integration description");
  await integrationsPage.createButton.click();
  await closeNotification(page);
  await integrationsPage.integrationsMenuItem.click();
  await integrationsPage.connectIntegrationButton.click();
  await integrationsPage.integrationTextById(id).click();
  await integrationsPage.connectButton.click();
  await closeNotification(page);
  await expect(integrationsPage.integrationCellById(id)).toBeVisible();
  await integrationsPage.connectIntegrationButton.click();
  await expect(integrationsPage.dialogIntegrationTextById(id)).toBeHidden();
  await integrationsPage.cancelButton.click();
  await integrationsPage.searchInput.click();
  await integrationsPage.searchInput.fill(id);
  await integrationsPage.searchButton.click();
  await integrationsPage.settingSvgButton.click();
  await integrationsPage.readerRoleOption.click();
  await integrationsPage.writerRoleOption.click();
  await integrationsPage.saveButton.click();
  await closeNotification(page);
  await expect(integrationsPage.writerCell).toBeVisible();
  await integrationsPage.searchInput.click();
  await integrationsPage.searchInput.fill("no integration");
  await integrationsPage.searchButton.click();
  await expect(integrationsPage.integrationCellById(id)).toBeHidden();
  await integrationsPage.searchInput.click();
  await integrationsPage.searchInput.fill(id);
  await integrationsPage.searchButton.click();
  await expect(integrationsPage.integrationCellById(id)).toBeVisible();
  await integrationsPage.selectAllCheckbox.check();
  await integrationsPage.removeText.click();
  await closeNotification(page);
  await integrationsPage.connectIntegrationButton.click();
  await expect(integrationsPage.dialogIntegrationTextById(id)).toBeVisible();
  await integrationsPage.cancelButton.click();
});
