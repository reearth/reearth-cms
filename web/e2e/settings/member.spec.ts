import { expect, test } from "@reearth-cms/e2e/utils";

test("Searching current members has succeeded", async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Create a Workspace" }).click();
  await page.getByLabel("Workspace name").click();
  await page.getByLabel("Workspace name").fill("test workspace");
  await page.getByRole("button", { name: "OK" }).click();
  await page.getByText("Member").click();
  await expect(page.getByRole("cell", { name: "OWNER" })).toBeVisible();
  await page.getByPlaceholder("search for a member").click();
  await page.getByPlaceholder("search for a member").fill("no member");
  await page.getByRole("button", { name: "search" }).click();
  await expect(page.getByRole("cell", { name: "OWNER" })).not.toBeVisible();
  await page.getByRole("button", { name: "close-circle" }).click();
  await expect(page.getByRole("cell", { name: "OWNER" })).toBeVisible();
  await page.getByText("Workspace", { exact: true }).click();
  await page.getByRole("button", { name: "Remove Workspace" }).click();
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully deleted workspace!");
});
