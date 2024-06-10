import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect, test } from "@reearth-cms/e2e/utils";

test("Workspace CRUD has succeeded", async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Create a Workspace" }).click();
  await page.getByLabel("Workspace name").click();
  await page.getByLabel("Workspace name").fill("workspace name");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);

  await page.getByText("Workspace", { exact: true }).click();
  await page.getByLabel("Workspace Name").click();
  await page.getByLabel("Workspace Name").fill("new workspace name");
  await page.getByRole("button", { name: "Save changes" }).click();
  await closeNotification(page);

  await expect(page.locator("header")).toContainText("new workspace name");
  await page.getByRole("button", { name: "Remove Workspace" }).click();
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);

  await page.locator("a").first().click();
  await expect(page.getByText("new workspace name")).toBeHidden();
});

test("Workspace Creating from tab has succeeded", async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await page.locator("a").first().click();
  await page.getByText("Create Workspace").click();
  await page.getByLabel("Workspace name").click();
  await page.getByLabel("Workspace name").fill("workspace name");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await expect(page.locator("header")).toContainText("workspace name");

  await page.getByText("Workspace", { exact: true }).click();
  await page.getByRole("button", { name: "Remove Workspace" }).click();
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
});
