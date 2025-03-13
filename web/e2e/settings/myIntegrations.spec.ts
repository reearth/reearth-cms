import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect, test } from "@reearth-cms/e2e/utils";

test.beforeEach(async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByText("My Integrations").click();
  await page.getByRole("button", { name: "plus Create new integration" }).click();

  await page.getByLabel("Integration Name").click();
  await page.getByLabel("Integration Name").fill("name");
  await page.getByLabel("Description").click();
  await page.getByLabel("Description").fill("description");
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await closeNotification(page);

  await page.getByText("namedescription", { exact: true }).last().click();
});

test("MyIntegration CRUD has succeeded", async ({ page }) => {
  await page.getByLabel("Integration Name").click();
  await page.getByLabel("Integration Name").fill("newName");
  await page.getByLabel("Description").click();
  await page.getByLabel("Description").fill("newDescription");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);

  await expect(page.locator("#root")).toContainText("newName");
  await page.getByLabel("Back").click();
  await expect(page.getByRole("main")).toContainText("newNamenewDescription");
  await page.getByText("newNamenewDescription").click();
  await page.getByRole("button", { name: "Remove Integration" }).click();
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await expect(page.getByRole("main")).not.toContainText("newNamenewDescription");
});

test("Webhook CRUD has succeeded", async ({ page }) => {
  await page.getByRole("tab", { name: "Webhook" }).click();
  await page.getByRole("button", { name: "plus new webhook" }).first().click();
  await page.getByRole("tabpanel").getByLabel("Name").click();
  await page.getByRole("tabpanel").getByLabel("Name").fill("webhook name");
  await page.getByLabel("Url").click();
  await page.getByLabel("Url").fill("http://test.com");
  await page.getByLabel("Secret").click();
  await page.getByLabel("Secret").fill("secret");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByRole("button", { name: "arrow-left" }).click();
  await expect(page.getByRole("tabpanel")).toContainText("webhook name");
  await expect(page.getByRole("tabpanel")).toContainText("http://test.com");

  await page.getByRole("button", { name: "setting" }).click();
  await page.getByRole("tabpanel").getByLabel("Name").click();
  await page.getByRole("tabpanel").getByLabel("Name").fill("new webhook name");
  await page.getByLabel("Url").click();
  await page.getByLabel("Url").fill("http://new.com");
  await page.getByLabel("Secret").click();
  await page.getByLabel("Secret").fill("new secret");
  await page.getByLabel("Create").check();
  await expect(page.getByLabel("Create")).toBeChecked();
  await page.getByLabel("Upload").check();
  await expect(page.getByLabel("Upload")).toBeChecked();
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByRole("button", { name: "arrow-left" }).click();
  await expect(page.getByRole("tabpanel")).toContainText("new webhook name");
  await expect(page.getByRole("tabpanel")).toContainText("http://new.com");

  await page.getByRole("button", { name: "setting" }).click();
  await expect(page.getByLabel("Secret")).toHaveValue("new secret");
  await expect(page.getByLabel("Create")).toBeChecked();
  await expect(page.getByLabel("Upload")).toBeChecked();
  await page.getByRole("button", { name: "arrow-left" }).click();
  await page.getByRole("switch", { name: "OFF" }).click();
  await expect(page.getByRole("switch")).toContainText("ON");
  await closeNotification(page);
  await page.getByRole("button", { name: "delete" }).click();
  await closeNotification(page);
  await expect(page.getByLabel("Webhook")).not.toContainText("new webhook name");

  await page.getByRole("tab", { name: "General" }).click();
  await page.getByRole("button", { name: "Remove Integration" }).click();
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
});
