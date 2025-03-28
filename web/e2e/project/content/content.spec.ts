import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { crudComment } from "@reearth-cms/e2e/project/utils/comment";
import { handleFieldForm } from "@reearth-cms/e2e/project/utils/field";
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

test("Item CRUD and searching has succeeded", async ({ page }) => {
  await page.locator("li").filter({ hasText: "Text" }).locator("div").first().click();
  await handleFieldForm(page, "text");
  await page.getByText("Content").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByLabel("text").click();
  await page.getByLabel("text").fill("text");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await expect(page.getByRole("cell", { name: "text", exact: true })).toBeVisible();
  await page.getByPlaceholder("input search text").click();
  await page.getByPlaceholder("input search text").fill("no field");
  await page.getByRole("button", { name: "search" }).click();
  await expect(page.getByRole("cell", { name: "text", exact: true })).toBeHidden();
  await page.getByPlaceholder("input search text").fill("");
  await page.getByRole("button", { name: "search" }).click();
  await expect(page.getByRole("cell", { name: "text", exact: true })).toBeVisible();
  await page.getByRole("cell").getByLabel("edit").locator("svg").click();
  await page.getByLabel("text").click();

  await page.getByLabel("text").click();
  await page.getByLabel("text").fill("new text");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await expect(page.getByRole("cell", { name: "new text" })).toBeVisible();
  await page.getByLabel("", { exact: true }).check();
  await page.getByText("Delete").click();
  await closeNotification(page);
  await expect(page.getByRole("cell", { name: "new text" })).toBeHidden();
});

test("Publishing and Unpublishing item from edit page has succeeded", async ({ page }) => {
  await page.locator("li").filter({ hasText: "Text" }).locator("div").first().click();
  await handleFieldForm(page, "text");
  await page.getByText("Content").first().click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByLabel("text").click();
  await page.getByLabel("text").fill("text");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await expect(page.getByText("Draft")).toBeVisible();
  await page.getByRole("button", { name: "Publish" }).click();
  await closeNotification(page);
  await expect(page.getByText("Published")).toBeVisible();
  await page.getByLabel("Back").click();
  await expect(page.getByText("Published")).toBeVisible();
  await page.getByRole("cell").getByLabel("edit").locator("svg").click();
  await expect(page.getByText("Published")).toBeVisible();
  await page.getByRole("button", { name: "ellipsis" }).click();
  await page.getByText("Unpublish").click();
  await closeNotification(page);
  await expect(page.getByText("Draft")).toBeVisible();
  await page.getByLabel("Back").click();
  await expect(page.getByText("Draft")).toBeVisible();
});

test("Publishing and Unpublishing item from table has succeeded", async ({ page }) => {
  await page.locator("li").filter({ hasText: "Text" }).locator("div").first().click();
  await handleFieldForm(page, "text");
  await page.getByText("Content").first().click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByLabel("text").click();
  await page.getByLabel("text").fill("text");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await expect(page.getByText("Draft")).toBeVisible();
  await page.getByLabel("Back").click();
  await expect(page.getByText("Draft")).toBeVisible();
  await page.getByLabel("", { exact: true }).check();
  await page.getByText("Publish", { exact: true }).click();
  await page.getByRole("button", { name: "Yes" }).click();
  await closeNotification(page);
  await expect(page.getByText("Published")).toBeVisible();
  await page.getByText("Unpublish").click();
  await closeNotification(page);
  await expect(page.getByText("Draft")).toBeVisible();
  await page.getByRole("cell").getByLabel("edit").locator("svg").click();
  await expect(page.getByText("Draft")).toBeVisible();
});

test("Showing item title has succeeded", async ({ page }) => {
  await page.locator("li").filter({ hasText: "Text" }).locator("div").first().click();
  await handleFieldForm(page, "text");
  await page.getByText("Content").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.getByTitle("e2e model name", { exact: true })).toBeVisible();
  await page.getByLabel("text").click();
  await page.getByLabel("text").fill("text");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  const itemId = page.url().split("/").at(-1);
  await expect(page.getByTitle(`e2e model name / ${itemId}`, { exact: true })).toBeVisible();

  await page.getByText("Schema").click();
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  await page.getByLabel("Use as title").check();
  await page.getByRole("tab", { name: "Default value" }).click();
  await page.getByLabel("Set default value").click();
  await page.getByLabel("Set default value").fill("default text");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);

  await page.getByText("Content").click();
  await page.getByRole("cell").getByLabel("edit").locator("svg").click();
  await expect(page.getByTitle(`e2e model name / text`, { exact: true })).toBeVisible();
  await page.getByLabel("Back").click();

  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.getByTitle("e2e model name", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await expect(page.getByTitle(`e2e model name / default text`, { exact: true })).toBeVisible();
});

// eslint-disable-next-line playwright/expect-expect
test("Comment CRUD on Content page has succeeded", async ({ page }) => {
  await page.locator("li").filter({ hasText: "Text" }).locator("div").first().click();
  await handleFieldForm(page, "text");
  await page.getByText("Content").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByLabel("text").click();
  await page.getByLabel("text").fill("text");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);

  await page.getByLabel("Back").click();

  await page.getByRole("button", { name: "0" }).click();
  await crudComment(page);
});

// eslint-disable-next-line playwright/expect-expect
test("Comment CRUD on edit page has succeeded", async ({ page }) => {
  await page.locator("li").filter({ hasText: "Text" }).locator("div").first().click();
  await handleFieldForm(page, "text");
  await page.getByText("Content").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByLabel("text").click();
  await page.getByLabel("text").fill("text");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("comment").click();
  await crudComment(page);
});
