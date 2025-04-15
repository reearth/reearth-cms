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

test("Float field creating and updating has succeeded", async ({ page }) => {
  await page.locator("li").filter({ hasText: "Float" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("float1");
  await page.getByLabel("Settings").locator("#key").click();
  await page.getByLabel("Settings").locator("#key").fill("float1");
  await page.getByLabel("Settings").locator("#description").click();
  await page.getByLabel("Settings").locator("#description").fill("float1 description");

  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);

  await expect(page.getByLabel("Fields").getByRole("paragraph")).toContainText("float1#float1");
  await page.getByText("Content").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.locator("label")).toContainText("float1");
  await expect(page.getByRole("main")).toContainText("float1 description");
  await page.getByLabel("float1").click();
  await page.getByLabel("float1").fill("1.1");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await expect(page.getByRole("cell", { name: "1.1", exact: true })).toBeVisible();

  await page.getByRole("cell").getByLabel("edit").locator("svg").click();
  await expect(page.getByLabel("float1")).toHaveValue("1.1");
  await page.getByLabel("float1").click();
  await page.getByLabel("float1").fill("2.2");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await expect(page.getByRole("cell", { name: "2.2", exact: true })).toBeVisible();
});

test("Float field editing has succeeded", async ({ page }) => {
  await page.locator("li").filter({ hasText: "Float" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("float1");
  await page.getByLabel("Settings").locator("#key").click();
  await page.getByLabel("Settings").locator("#key").fill("float1");
  await page.getByLabel("Settings").locator("#description").click();
  await page.getByLabel("Settings").locator("#description").fill("float1 description");
  await page.getByRole("tab", { name: "Default value" }).click();
  await page.getByLabel("Set default value").click();
  await page.getByLabel("Set default value").fill("1.1");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);

  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("float1");
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await expect(page.getByRole("cell", { name: "1.1", exact: true })).toBeVisible();

  await page.getByText("Schema").click();
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  await page.getByRole("tab", { name: "Settings" }).click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("new float1");
  await page.getByLabel("Field Key").click();
  await page.getByLabel("Field Key").fill("new-float1");
  await page.getByLabel("Description(optional)").click();
  await page.getByLabel("Description(optional)").fill("new float1 description");
  await page.getByLabel("Support multiple values").check();
  await expect(page.getByLabel("Use as title")).toBeHidden();
  await page.getByRole("tab", { name: "Validation" }).click();
  await page.getByLabel("Set minimum value").click();
  await page.getByLabel("Set minimum value").fill("10.1");
  await page.getByLabel("Set maximum value").click();
  await page.getByLabel("Set maximum value").fill("2.1");
  await expect(page.getByRole("button", { name: "OK" })).toBeDisabled();
  await page.getByLabel("Set minimum value").click();
  await page.getByLabel("Set minimum value").fill("2.1");
  await page.getByLabel("Set maximum value").click();
  await page.getByLabel("Set maximum value").fill("10.1");
  await page.getByLabel("Make field required").check();
  await page.getByLabel("Set field as unique").check();
  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByLabel("Set default value")).toBeVisible();
  await expect(page.getByLabel("Set default value")).toHaveValue("1.1");
  await expect(page.getByRole("button", { name: "OK" })).toBeDisabled();
  await page.getByLabel("Set default value").click();
  await page.getByLabel("Set default value").fill("11.1");
  await expect(page.getByRole("button", { name: "OK" })).toBeDisabled();
  await page.getByLabel("Set default value").click();
  await page.getByLabel("Set default value").fill("2.2");
  await page.getByRole("button", { name: "plus New" }).click();
  await page.locator("#defaultValue").nth(1).click();
  await page.locator("#defaultValue").nth(1).fill("3.3");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);

  await expect(page.getByText("new float1 *#new-float1(unique)")).toBeVisible();
  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("new float1");
  await expect(page.getByRole("cell", { name: "1.1", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.getByText("new float1(unique)")).toBeVisible();
  await expect(page.getByRole("spinbutton").nth(0)).toHaveValue("2.2");
  await expect(page.getByRole("spinbutton").nth(1)).toHaveValue("3.3");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "x2" }).click();
  await expect(page.getByRole("tooltip")).toContainText("new float12.23.3");
});
