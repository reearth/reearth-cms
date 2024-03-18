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

test("Option field creating and updating has succeeded", async ({ page }) => {
  await page.locator("li").filter({ hasText: "Option" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("option1");
  await page.getByLabel("Settings").locator("#key").click();
  await page.getByLabel("Settings").locator("#key").fill("option1");
  await page.getByLabel("Settings").locator("#description").click();
  await page.getByLabel("Settings").locator("#description").fill("option1 description");
  await page.getByRole("button", { name: "plus New" }).click();
  await page.locator("#values").nth(0).click();
  await page.locator("#values").nth(0).fill("first");
  await page.getByRole("button", { name: "plus New" }).click();
  await page.locator("#values").nth(1).click();
  await page.locator("#values").nth(1).fill("second");
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created field!");
  await closeNotification(page);

  await expect(page.getByLabel("Fields").getByRole("paragraph")).toContainText("option1 #option1");
  await page.getByText("Content").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.locator("label")).toContainText("option1");
  await expect(page.getByRole("main")).toContainText("option1 description");
  await page.getByLabel("option1").click();
  await expect(page.getByTitle("first").locator("div")).toBeVisible();
  await expect(page.getByTitle("second").locator("div")).toBeVisible();
  await page.getByTitle("first").locator("div").click();
  await expect(page.locator("#root").getByText("first").last()).toBeVisible();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created Item!");
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await expect(page.getByText("first")).toBeVisible();

  await page.getByRole("link", { name: "edit", exact: true }).click();
  await page.getByLabel("close-circle").locator("svg").click();
  await page.getByLabel("option1").click();
  await page.getByTitle("second").locator("div").click();
  await expect(page.locator("#root").getByText("second").last()).toBeVisible();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated Item!");
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await expect(page.getByText("second")).toBeVisible();
});

test("Option field editing has succeeded", async ({ page }) => {
  await page.locator("li").filter({ hasText: "Option" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("option1");
  await page.getByLabel("Settings").locator("#key").click();
  await page.getByLabel("Settings").locator("#key").fill("option1");
  await page.getByLabel("Settings").locator("#description").click();
  await page.getByLabel("Settings").locator("#description").fill("option1 description");
  await page.getByRole("button", { name: "plus New" }).click();
  await page.locator("#values").nth(0).click();
  await page.locator("#values").nth(0).fill("first");
  await page.getByRole("button", { name: "plus New" }).click();
  await page.locator("#values").nth(1).click();
  await page.locator("#values").nth(1).fill("second");
  await page.getByRole("button", { name: "plus New" }).click();
  await page.locator("#values").nth(2).click();
  await page.locator("#values").nth(2).fill("third");
  await page.getByRole("tab", { name: "Default value" }).click();
  await page.getByLabel("Set default value").click();
  await expect(page.getByTitle("first").locator("div")).toBeVisible();
  await expect(page.getByTitle("second").locator("div")).toBeVisible();
  await expect(page.getByTitle("third").locator("div")).toBeVisible();
  await page.getByTitle("second").locator("div").click();
  await page.getByRole("tab", { name: "Settings" }).click();
  await page.getByRole("button", { name: "delete" }).nth(1).click();
  await page.getByRole("button", { name: "plus New" }).click();
  await page.locator("#values").nth(2).click();
  await page.locator("#values").nth(2).fill("forth");
  await page.getByRole("tab", { name: "Default value" }).click();
  await page.getByLabel("Set default value").click();
  await expect(page.getByTitle("first").locator("div")).toBeVisible();
  await expect(page.getByTitle("second").locator("div")).not.toBeVisible();
  await expect(page.getByTitle("third").locator("div")).toBeVisible();
  await expect(page.getByTitle("forth").locator("div")).toBeVisible();
  await page.getByTitle("third").locator("div").click();
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created field!");
  await closeNotification(page);

  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("option1");
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.getByText("third")).toBeVisible();
  await page.getByText("third").click();
  await expect(page.getByTitle("first").locator("div")).toBeVisible();
  await expect(page.getByTitle("third").locator("div")).toBeVisible();
  await expect(page.getByTitle("forth").locator("div")).toBeVisible();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created Item!");
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await expect(page.getByText("third")).toBeVisible();

  await page.getByText("Schema").click();
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").press("Home");
  await page.getByLabel("Display name").fill("new option1");
  await page.getByLabel("Field Key").click();
  await page.getByLabel("Field Key").press("Home");
  await page.getByLabel("Field Key").fill("new-option1");
  await page.getByLabel("Description(optional)").click();
  await page.getByLabel("Description(optional)").press("Home");
  await page.getByLabel("Description(optional)").fill("new option1 description");
  await page.getByRole("button", { name: "plus New" }).click();
  await page.locator("#values").nth(3).click();
  await page.locator("#values").nth(3).fill("fifth");
  await page.getByLabel("Support multiple values").check();
  await page.getByLabel("Use as title").check();
  await page.getByRole("tab", { name: "Validation" }).click();
  await page.getByLabel("Make field required").check();
  await page.getByLabel("Set field as unique").check();
  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByText("third")).toBeVisible();
  await page.getByRole("button", { name: "plus New" }).click();
  await page.locator(".ant-select-selection-item").nth(1).click();
  await expect(page.getByTitle("first").locator("div")).toBeVisible();
  await expect(page.getByTitle("third").locator("div")).toBeVisible();
  await expect(page.getByTitle("forth").locator("div")).toBeVisible();
  await expect(page.getByTitle("fifth").locator("div")).toBeVisible();
  await page.getByRole("tab", { name: "Settings" }).click();
  await page.getByLabel("Set Options").click();
  await page.getByLabel("Set Options").fill("new first");
  await page.locator("#values").nth(1).click();
  await page.locator("#values").nth(1).fill("new third");
  await page.locator("#values").nth(2).click();
  await page.locator("#values").nth(2).fill("new forth");
  await page.locator("#values").nth(3).click();
  await page.locator("#values").nth(3).fill("new fifth");
  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByText("third")).not.toBeVisible();

  await page.getByRole("button", { name: "plus New" }).click();
  await page.locator(".ant-select-selection-item").nth(0).click();
  await expect(page.getByTitle("new first").locator("div")).toBeVisible();
  await expect(page.getByTitle("new third").locator("div")).toBeVisible();
  await expect(page.getByTitle("new forth").locator("div")).toBeVisible();
  await expect(page.getByTitle("new fifth").locator("div")).toBeVisible();
  await page.getByTitle("new first").locator("div").click();
  await page.getByRole("button", { name: "plus New" }).click();
  await page.locator(".ant-select-selection-item").nth(1).click();
  await page.getByTitle("new third").locator("div").last().click();
  await page.getByRole("button", { name: "delete" }).nth(1).click();
  await page.getByRole("button", { name: "plus New" }).click();
  await page.locator(".ant-select-selection-item").nth(1).click();
  await page.getByTitle("new third").locator("div").last().click();
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated field!");
  await closeNotification(page);
  await expect(page.getByText("new option1 *#new-option1(")).toBeVisible();
  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("option1");
  await expect(page.getByText("third")).toBeVisible();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.getByText("new option1(unique)Title")).toBeVisible();
  await expect(page.getByText("new first")).toBeVisible();
  await expect(page.getByText("new third")).toBeVisible();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created Item!");
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await expect(page.getByRole("cell", { name: "new first new third" })).toBeVisible();
});