import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect, test } from "@reearth-cms/e2e/utils";

import { config } from "../utils/config";

import { createProject, deleteProject } from "./utils/project";

test.beforeEach(async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
});

test.afterEach(async ({ page }) => {
  await deleteProject(page);
});

test("Update settings on Accesibility page has succeeded", async ({ page }) => {
  await page.getByText("Accessibility").click();
  await expect(page.getByRole("textbox")).not.toBeEmpty();
  const alias = await page.getByRole("textbox").inputValue();
  await expect(page.getByRole("button", { name: "Save changes" })).toBeDisabled();
  await page.getByText("Private").click();
  await page.getByText("Public", { exact: true }).click();
  await page.getByRole("switch").click();
  await page.getByRole("button", { name: "Save changes" }).click();
  await closeNotification(page);
  await expect(page.locator("form")).toContainText("Public");
  await expect(page.getByRole("textbox")).toHaveValue(alias);
  await expect(page.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  await expect(page.locator("tbody")).toContainText(`${config.api}/p/${alias}/assets`);
  await expect(page.getByRole("button", { name: "Save changes" })).toBeDisabled();
});

test("Setting public scope to Limited has succeeded", async ({ page }) => {
  await page.getByText("Accessibility").click();
  await page.getByText("Private").click();
  await page.getByText("Limited", { exact: true }).click();
  await expect(page.locator('input[type="password"]')).toBeHidden();
  await page.getByRole("button", { name: "Save changes" }).click();
  await closeNotification(page);
  await expect(page.locator("form")).toContainText("Limited");
  await expect(page.locator('input[type="password"]')).toHaveValue(/^secret_/);
  const token = await page.locator('input[type="password"]').inputValue();
  await page.getByRole("button", { name: "Re-generate" }).click();
  await closeNotification(page);
  await expect(page.locator('input[type="password"]')).toHaveValue(/^secret_/);
  await expect(page.locator('input[type="password"]')).not.toHaveValue(token);
  await page.getByText("Limited").first().click();
  await page.getByText("Private", { exact: true }).click();
  await page.getByRole("button", { name: "Save changes" }).click();
  await closeNotification(page);
  await expect(page.locator('input[type="password"]')).toBeHidden();
});
