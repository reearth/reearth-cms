import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { createModel } from "@reearth-cms/e2e/project/utils/model";
import { createProject, deleteProject } from "@reearth-cms/e2e/project/utils/project";
import { expect, test } from "@reearth-cms/e2e/utils";

test.beforeEach(async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
  await createModel(page);
});

test.afterEach(async ({ page }) => {
  await deleteProject(page);
});

test("Boolean field creating and updating has succeeded", async ({ page }) => {
  await page.locator("li").filter({ hasText: "Boolean" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("boolean1");
  await page.getByLabel("Settings").locator("#key").click();
  await page.getByLabel("Settings").locator("#key").fill("boolean1");
  await page.getByLabel("Settings").locator("#description").click();
  await page.getByLabel("Settings").locator("#description").fill("boolean1 description");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);

  await expect(page.getByLabel("Fields").getByRole("paragraph")).toContainText("boolean1#boolean1");
  await page.getByText("Content").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.locator("label")).toContainText("boolean1");
  await expect(page.getByRole("main")).toContainText("boolean1 description");

  await page.getByLabel("boolean1").click();
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await expect(page.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  await page.getByRole("cell").getByLabel("edit").locator("svg").click();
  await expect(page.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  await page.getByLabel("boolean1").click();
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await expect(page.getByRole("switch")).toHaveAttribute("aria-checked", "false");
});

test("Boolean field editing has succeeded", async ({ page }) => {
  await page.locator("li").filter({ hasText: "Boolean" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("boolean1");
  await page.getByLabel("Settings").locator("#key").click();
  await page.getByLabel("Settings").locator("#key").fill("boolean1");
  await page.getByLabel("Settings").locator("#description").click();
  await page.getByLabel("Settings").locator("#description").fill("boolean1 description");
  await page.getByRole("tab", { name: "Default value" }).click();
  await page.getByLabel("Set default value").click();
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("boolean1");
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await expect(page.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  await page.getByText("Schema").click();
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("new boolean1");
  await page.getByLabel("Field Key").click();
  await page.getByLabel("Field Key").fill("new-boolean1");
  await page.getByLabel("Description(optional)").click();
  await page.getByLabel("Description(optional)").fill("new boolean1 description");
  await page.getByLabel("Support multiple values").check();
  await expect(page.getByLabel("Use as title")).toBeHidden();
  await page.getByRole("tab", { name: "Validation" }).click();
  await expect(
    page.locator("label").filter({ hasText: "Make field required" }).locator("span").nth(1),
  ).toBeDisabled();
  await expect(
    page.locator("label").filter({ hasText: "Set field as unique" }).locator("span").nth(1),
  ).toBeDisabled();
  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByRole("switch").nth(0)).toHaveAttribute("aria-checked", "true");
  await page.getByRole("button", { name: "plus New" }).click();
  await expect(page.getByRole("switch").nth(1)).toHaveAttribute("aria-checked", "false");
  await page.getByRole("button", { name: "arrow-down" }).first().click();
  await expect(page.getByRole("switch").nth(0)).toHaveAttribute("aria-checked", "false");
  await expect(page.getByRole("switch").nth(1)).toHaveAttribute("aria-checked", "true");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await expect(page.getByText("new boolean1#new-boolean1")).toBeVisible();
  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("new boolean1");
  await expect(page.getByRole("switch", { name: "check" })).toBeVisible();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.getByRole("switch").nth(0)).toHaveAttribute("aria-checked", "false");
  await expect(page.getByRole("switch").nth(1)).toHaveAttribute("aria-checked", "true");
  await page.getByRole("button", { name: "plus New" }).click();
  await expect(page.getByRole("switch").nth(2)).toHaveAttribute("aria-checked", "false");
  await page.getByRole("button", { name: "arrow-up" }).nth(2).click();
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "x3" }).click();
  await expect(page.getByRole("tooltip")).toContainText("new boolean1");
  await expect(page.getByRole("switch").nth(1)).toHaveAttribute("aria-checked", "false");
  await expect(page.getByRole("switch").nth(2)).toHaveAttribute("aria-checked", "false");
  await expect(page.getByRole("switch").nth(3)).toHaveAttribute("aria-checked", "true");
});
