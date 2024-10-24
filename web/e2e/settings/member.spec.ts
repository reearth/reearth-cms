import { createWorkspace, deleteWorkspace } from "@reearth-cms/e2e/project/utils/workspace";
import { expect, test } from "@reearth-cms/e2e/utils";

test.beforeEach(async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createWorkspace(page);
});

test.afterEach(async ({ page }) => {
  await deleteWorkspace(page);
});

test("Searching current members has succeeded", async ({ page }) => {
  await page.getByText("Member").click();
  await expect(page.getByRole("cell", { name: "OWNER" })).toBeVisible();
  await page.getByPlaceholder("input search text").click();
  await page.getByPlaceholder("input search text").fill("no member");
  await page.getByRole("button", { name: "search" }).click();
  await expect(page.getByRole("cell", { name: "OWNER" })).toBeHidden();
  await page.getByRole("button", { name: "close-circle" }).click();
  await expect(page.getByRole("cell", { name: "OWNER" })).toBeVisible();
});
