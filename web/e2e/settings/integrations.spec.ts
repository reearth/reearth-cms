import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect, test } from "@reearth-cms/e2e/utils";

test("Integration CRUD and searching has succeeded", async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByText("My Integrations").click();

  await page.locator("div").filter({ hasText: "Create new integration" }).nth(4).click();
  await page.getByLabel("Integration Name").click();
  await page.getByLabel("Integration Name").fill("e2e integration name");
  await page.getByLabel("Description").click();
  await page.getByLabel("Description").fill("e2e integration description");
  await page.getByRole("button", { name: "Create" }).click();
  await page.locator("a").nth(3).click();
  await page.getByText("Integrations", { exact: true }).click();
  await page.getByRole("button", { name: "api Connect Integration" }).click();
  await page
    .locator("div")
    .filter({ hasText: /^e2e integration name$/ })
    .click();
  await page.getByRole("button", { name: "Connect", exact: true }).click();
  await expect(page.getByRole("alert").last()).toContainText(
    "Successfully connected integration to the workspace!",
  );
  await closeNotification(page);
  await page.locator("a").nth(3).click();
  await expect(page.getByRole("cell", { name: "e2e integration name", exact: true })).toBeVisible();
  await page.getByPlaceholder("Please enter").click();
  await page.getByPlaceholder("Please enter").fill("e2e integration name");
  await page.getByRole("button", { name: "search" }).click();
  await page.getByRole("cell", { name: "setting" }).locator("svg").click();
  await page
    .locator("div")
    .filter({ hasText: /^Reader$/ })
    .nth(4)
    .click();
  await page.getByTitle("Writer").click();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText(
    "Successfully updated workspace integration!",
  );
  await closeNotification(page);
  await page.locator("a").nth(3).click();
  await expect(page.getByRole("cell", { name: "WRITER" })).toBeVisible();
  await page.getByPlaceholder("Please enter").click();
  await page.getByPlaceholder("Please enter").fill("no integration");
  await page.getByRole("button", { name: "search" }).click();
  await expect(
    page.getByRole("cell", { name: "e2e integration name", exact: true }),
  ).not.toBeVisible();
  await page.getByPlaceholder("Please enter").click();
  await page.getByPlaceholder("Please enter").fill("e2e integration name");
  await page.getByRole("button", { name: "search" }).click();
  await expect(page.getByRole("cell", { name: "e2e integration name", exact: true })).toBeVisible();
  await page.getByLabel("", { exact: true }).check();
  await page.getByText("Remove").click();
  await expect(page.getByRole("alert").last()).toContainText(
    "One or more integrations were successfully deleted!",
  );
  await closeNotification(page);
  await page.getByText("My Integrations").click();
  await page.getByText("e2e integration namee2e").click();
  await page.getByRole("button", { name: "Remove Integration" }).click();
  await page.getByRole("button", { name: "OK" }).click();
});
