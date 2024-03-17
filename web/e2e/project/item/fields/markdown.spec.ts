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

test("Markdown field editing has succeeded", async ({ page }) => {
  await page.locator("li").filter({ hasText: "Markdown" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("text1");
  await page.getByLabel("Settings").locator("#key").click();
  await page.getByLabel("Settings").locator("#key").fill("text1");
  await page.getByLabel("Settings").locator("#description").click();
  await page.getByLabel("Settings").locator("#description").fill("text1 description");
  await page.getByRole("tab", { name: "Default value" }).click();
  await page.locator(".css-1msv1zr").click();
  await page.getByLabel("Set default value").fill("text1 default value");
  await page.getByRole("button", { name: "OK" }).click();
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created field!");
  await closeNotification(page);
  await expect(page.getByText("text1 #text1")).toBeVisible();
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  await expect(page.getByLabel("Display name")).toBeVisible();
  await expect(page.getByLabel("Display name")).toHaveValue("text1");
  await expect(page.getByLabel("Settings").locator("#key")).toHaveValue("text1");
  await expect(page.getByLabel("Settings").locator("#description")).toHaveValue(
    "text1 description",
  );
  await expect(page.getByLabel("Support multiple values")).not.toBeChecked();
  await expect(page.getByLabel("Use as title")).not.toBeChecked();
  await page.getByRole("tab", { name: "Validation" }).click();
  await expect(page.getByLabel("Set maximum length")).toBeEmpty();
  await expect(page.getByLabel("Make field required")).not.toBeChecked();
  await expect(page.getByLabel("Set field as unique")).not.toBeChecked();
  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByLabel("Set default value")).toHaveValue("text1 default value");
  await page.getByRole("button", { name: "Cancel" }).click();
  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("text1");
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.locator("label")).toContainText("text1");
  await page.getByText("text1 description").click();
  await expect(page.getByRole("main")).toContainText("text1 description");
  await expect(page.getByLabel("text1")).toHaveValue("text1 default value");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created Item!");
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await page.locator(".ant-table-row > td:nth-child(9)").getByRole("button").click();
  await expect(page.getByRole("tooltip")).toContainText("text1text1 default value");
  await page.getByText("Schema").click();
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  await page.getByLabel("Support multiple values").check();
  await page.getByLabel("Use as title").check();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("new text1");
  await page.getByLabel("Field Key").click();
  await page.getByLabel("Field Key").fill("new-text1");
  await page.getByLabel("Description(optional)").click();
  await page.getByLabel("Description(optional)").fill("new text1 description");
  await page.getByRole("tab", { name: "Validation" }).click();
  await page.getByLabel("Set maximum length").click();
  await page.getByLabel("Set maximum length").fill("5");
  await page.getByLabel("Make field required").check();
  await page.getByLabel("Set field as unique").check();
  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByLabel("Set default value")).toHaveValue("text1 default value");
  await page.getByRole("button", { name: "plus New" }).click();
  await page.locator("div:nth-child(2) > .css-1ago99h > .css-1msv1zr").click();
  await page.getByRole("textbox").fill("text2");
  await page.locator("div:nth-child(1) > .css-1ago99h > .css-1msv1zr").click();
  await page.getByRole("textbox").fill("text1");

  await page.getByRole("button", { name: "arrow-down" }).first().click();
  await expect(page.locator("div:nth-child(2) > .css-1ago99h > .css-1msv1zr")).toContainText(
    "text1",
  );
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated field!");
  await closeNotification(page);
  await expect(page.getByText("new text1 *#new-text1(unique)")).toBeVisible();
  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("new text1");
  await page.locator(".ant-table-row > td:nth-child(9)").getByRole("button").click();
  await expect(page.getByRole("tooltip")).toContainText("text1text1 default value");
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.getByText("new text1(unique)")).toBeVisible();
  await page.getByText("new text1 description").click();
  await expect(page.getByText("new text1 description")).toBeVisible();
  await expect(page.locator("div:nth-child(1) > .css-1ago99h > .css-1msv1zr")).toContainText(
    "text2",
  );
  await expect(page.locator("div:nth-child(2) > .css-1ago99h > .css-1msv1zr")).toContainText(
    "text1",
  );
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created Item!");
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "x2" }).click();
  await expect(page.getByRole("main")).toContainText("new text1text2text1");
  await page.getByRole("cell", { name: "edit" }).nth(1).click();
  await expect(page.getByText("new text1(unique)")).toBeVisible();
  await page.getByRole("button", { name: "delete" }).first().click();
  await expect(page.getByText("Please input field!")).toBeVisible();
  await page.getByRole("button", { name: "plus New" }).click();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("input: updateItem value is required");
  await closeNotification(page);
  await page.locator("div:nth-child(1) > .css-1ago99h > .css-1msv1zr").click();
  await page.getByRole("textbox").fill("text");
  await page.getByRole("button", { name: "plus New" }).click();
  await page.getByRole("button", { name: "plus New" }).click();
  await page.locator("div:nth-child(2) > .css-1ago99h > .css-1msv1zr").click();
  await page.getByRole("textbox").fill("text2");
  await page.getByRole("button", { name: "arrow-up" }).nth(1).click();
  await expect(page.locator("div:nth-child(1) > .css-1ago99h > .css-1msv1zr")).toContainText(
    "text2",
  );
  await expect(page.locator("div:nth-child(2) > .css-1ago99h > .css-1msv1zr")).toContainText(
    "text",
  );
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated Item!");
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "x2" }).nth(1).click();
  await expect(page.getByRole("main")).toContainText("new text1text2text");
});
