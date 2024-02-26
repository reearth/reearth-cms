import { expect, test } from "@reearth-cms/e2e/utils";

test("Integration CRUD and searching has succeeded", async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByText("My Integrations").click();

  await page.locator("div").filter({ hasText: "Create new integration" }).nth(4).click();
  await page.getByLabel("Integration Name").click();
  await page.getByLabel("Integration Name").fill("name");
  await page.getByLabel("Description").click();
  await page.getByLabel("Description").fill("description");
  await page.getByRole("button", { name: "Create" }).click();
  await page.getByText("Integrations", { exact: true }).click();
  await page.getByRole("button", { name: "api Connect Integration" }).click();
  await page
    .locator("div")
    .filter({ hasText: /^name$/ })
    .click();
  await page.getByRole("button", { name: "Connect", exact: true }).click();
  await expect(page.getByRole("alert").last()).toContainText(
    "Successfully connected integration to the workspace!",
  );
  await expect(page.getByRole("cell", { name: "name", exact: true })).toBeVisible();
  await page
    .getByRole("row", { name: "name READER kazuma setting" })
    .getByRole("cell")
    .nth(4)
    .click();
  await page.getByRole("row", { name: "name READER kazuma setting" }).locator("svg").click();
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
  await expect(page.getByRole("cell", { name: "WRITER" }).nth(1)).toBeVisible();
  await page.getByPlaceholder("Please enter").click();
  await page.getByPlaceholder("Please enter").fill("namee");
  await page.getByRole("button", { name: "search" }).click();
  await expect(page.getByRole("cell", { name: "name", exact: true })).not.toBeVisible();
  await page.getByPlaceholder("Please enter").click();
  await page.getByPlaceholder("Please enter").fill("name");
  await page.getByRole("button", { name: "search" }).click();
  await expect(page.getByRole("cell", { name: "name", exact: true })).toBeVisible();
  await page
    .getByRole("row", { name: "name WRITER kazuma setting" })
    .getByLabel("", { exact: true })
    .check();
  await page.getByText("Remove").click();
  await page.locator("a").nth(3).click();
  await expect(page.getByRole("alert").last()).toContainText(
    "One or more integrations were successfully deleted!",
  );
  await page.getByText("My Integrations").click();
  await page.getByText("namedescription").click();
  await page.getByRole("button", { name: "Remove Integration" }).click();
  await page.getByRole("button", { name: "OK" }).click();
});
