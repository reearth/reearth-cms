import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { handleFieldForm } from "@reearth-cms/e2e/project/utils/field";
import { createModelFromOverview } from "@reearth-cms/e2e/project/utils/model";
import { createProject, deleteProject } from "@reearth-cms/e2e/project/utils/project";
import { expect, test } from "@reearth-cms/e2e/utils";

test.beforeEach(async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
  await createModelFromOverview(page);

  await page.getByRole("listitem").filter({ hasText: /Text/ }).first().click();
  await handleFieldForm(page, "text");
  await page.getByRole("menuitem", { name: "Content" }).click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByLabel("text").fill("test");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByRole("menuitem", { name: "Schema" }).click();
  await page.getByRole("tab", { name: "Meta Data" }).click();
  await page.getByRole("listitem").filter({ hasText: "Boolean" }).click();
  await handleFieldForm(page, "boolean");
  await page.getByRole("menuitem", { name: "Content" }).click();
});

test.afterEach(async ({ page }) => {
  await deleteProject(page);
});

test("Updating metadata added later from table has succeeded", async ({ page }) => {
  await page.getByRole("switch").click();
  await closeNotification(page);
  await page.getByRole("switch").click();
  await closeNotification(page);
  await page.getByRole("switch").click();
  await closeNotification(page);
  await page.getByRole("cell").getByLabel("edit").locator("svg").click();
  await expect(page.getByLabel("boolean")).toHaveAttribute("aria-checked", "true");
});

test("Updating metadata added later from edit page has succeeded", async ({ page }) => {
  await page.getByRole("cell").getByLabel("edit").locator("svg").click();
  await expect(page.getByLabel("text")).toHaveValue("test");
  await page.getByLabel("boolean").click();
  await closeNotification(page);
  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByRole("switch")).toHaveAttribute("aria-checked", "true");
});
