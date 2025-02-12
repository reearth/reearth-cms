import { closeNotification } from "@reearth-cms/e2e/common/notification";
// eslint-disable-next-line import/order
import { expect, test } from "@reearth-cms/e2e/utils";

// import { config } from "../utils/config";

import { Selectors } from "@reearth-cms/selectors";

import { createProject, deleteProject } from "./utils/project";

test.beforeEach(async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
});

test.afterEach(async ({ page }) => {
  await deleteProject(page);
});

test("Update settings on Accessibility page has succeeded", async ({ page }) => {
  await page.getByTestId(Selectors.projectMenuAccessibility).click();
  await expect(page.getByRole("textbox")).not.toBeEmpty();
  const alias = await page.getByRole("textbox").inputValue();
  await expect(page.getByTestId(Selectors.accessibilitySaveChangesButton)).toBeDisabled();
  await page.getByTestId(Selectors.accessibilityPublicScopeSelect).click();
  await page.getByTestId(Selectors.accessibilityScopeOption("public")).click()
  await page.getByTestId(Selectors.accessibilitySwitch).click();
  await page.getByTestId(Selectors.accessibilitySaveChangesButton).click();
  await closeNotification(page);

  // Verify changes
  await expect(page.locator("form")).toContainText("Public");
  await expect(page.getByRole("textbox")).toHaveValue(alias);
  await expect(page.getByTestId(Selectors.accessibilitySwitch)).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await expect(page.getByTestId(Selectors.accessibilitySaveChangesButton)).toBeDisabled();
});

test("Setting public scope to Limited has succeeded", async ({ page }) => {
  await page.getByTestId(Selectors.projectMenuAccessibility).click();
  await page.getByTestId(Selectors.accessibilityPublicScopeSelect).click();
  await page.getByTestId(Selectors.accessibilityScopeOption("limited")).click();
  await expect(page.locator('input[type="password"]')).toBeHidden();
  await page.getByTestId(Selectors.accessibilitySaveChangesButton).click();
  await closeNotification(page);

  // Verify Limited scope
  await expect(page.locator("form")).toContainText("Limited");
  await expect(page.locator('input[type="password"]')).toHaveValue(/^secret_/);
  const token = await page.locator('input[type="password"]').inputValue();
  await page.getByRole("button", { name: "Re-generate" }).click();
  await closeNotification(page);

  // Verify new token
  await expect(page.locator('input[type="password"]')).toHaveValue(/^secret_/);
  await expect(page.locator('input[type="password"]')).not.toHaveValue(token);

  // Set back to Private
  await page.getByTestId(Selectors.accessibilityPublicScopeSelect).click();
  await page.getByTestId(Selectors.accessibilityScopeOption("private")).click();
  await page.getByTestId(Selectors.accessibilitySaveChangesButton).click();
  await closeNotification(page);
  await expect(page.locator('input[type="password"]')).toBeHidden();
});
