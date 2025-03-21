import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect, test } from "@reearth-cms/e2e/utils";
import { getId } from "@reearth-cms/e2e/utils/mock";

let id: string;

test.beforeEach(() => {
  id = getId();
});

test.afterEach(async ({ page }) => {
  await page.getByText("My Integrations").click();
  await page.getByText(id).first().click();
  await page.getByRole("button", { name: "Remove Integration" }).click();
  await page.getByRole("button", { name: "OK" }).click();
});

test("Integration CRUD and searching has succeeded", async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByText("My Integrations").click();

  await page.getByRole("button", { name: "plus Create new integration" }).click();
  await page.getByLabel("Integration Name").click();
  await page.getByLabel("Integration Name").fill(id);
  await page.getByLabel("Description").click();
  await page.getByLabel("Description").fill("e2e integration description");
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await closeNotification(page);
  await page.getByText("Integrations", { exact: true }).click();
  await page.getByRole("button", { name: "api Connect Integration" }).first().click();
  await page.getByText(id, { exact: true }).first().click();
  await page.getByRole("button", { name: "Connect", exact: true }).click();
  await closeNotification(page);
  await expect(page.getByRole("cell", { name: id, exact: true })).toBeVisible();
  await page.getByRole("button", { name: "api Connect Integration" }).first().click();
  await expect(page.getByRole("dialog").getByText(id, { exact: true })).toBeHidden();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await page.getByPlaceholder("input search text").click();
  await page.getByPlaceholder("input search text").fill(id);
  await page.getByRole("button", { name: "search" }).click();
  await page.getByRole("cell", { name: "setting" }).locator("svg").click();
  await page
    .locator("div")
    .filter({ hasText: /^Reader$/ })
    .nth(4)
    .click();
  await page.getByTitle("Writer").click();
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await expect(page.getByRole("cell", { name: "WRITER" })).toBeVisible();
  await page.getByPlaceholder("input search text").click();
  await page.getByPlaceholder("input search text").fill("no integration");
  await page.getByRole("button", { name: "search" }).click();
  await expect(page.getByRole("cell", { name: id, exact: true })).toBeHidden();
  await page.getByPlaceholder("input search text").click();
  await page.getByPlaceholder("input search text").fill(id);
  await page.getByRole("button", { name: "search" }).click();
  await expect(page.getByRole("cell", { name: id, exact: true })).toBeVisible();
  await page.getByLabel("", { exact: true }).check();
  await page.getByText("Remove").click();
  await closeNotification(page);
  await page.getByRole("button", { name: "api Connect Integration" }).first().click();
  await expect(page.getByRole("dialog").getByText(id, { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
});
