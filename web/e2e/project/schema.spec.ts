import { Page } from "@playwright/test";

import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect, test } from "@reearth-cms/e2e/utils";

import { handleFieldForm } from "./utils/field";
import { createGroup, updateGroup, deleteGroup } from "./utils/group";
import { createModelFromSidebar, updateModel, deleteModel } from "./utils/model";
import { createProject, deleteProject } from "./utils/project";

async function deleteField(page: Page, name: string, key = name) {
  await page.getByLabel("delete").locator("svg").click();
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await expect(page.getByText(`${name} #${key}`)).toBeHidden();
}

test.beforeEach(async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
  await page.getByRole("menuitem", { name: "Schema" }).click();
});

test.afterEach(async ({ page }) => {
  await deleteProject(page);
});

test("Model CRUD has succeeded", async ({ page }) => {
  const modelName = "model name";
  const modelKey = "model-key";
  await createModelFromSidebar(page, modelName, modelKey);
  await expect(page.getByTitle(modelName, { exact: true })).toBeVisible();
  await expect(page.getByText(`#${modelKey}`)).toBeVisible();
  await expect(page.getByRole("menuitem", { name: modelName }).locator("span")).toBeVisible();

  const newModelName = "new model name";
  const newModelKey = "new-model-key";
  await updateModel(page, newModelName, newModelKey);
  await expect(page.getByTitle(newModelName)).toBeVisible();
  await expect(page.getByText(`#${newModelKey}`)).toBeVisible();
  await expect(page.getByRole("menuitem", { name: newModelName }).locator("span")).toBeVisible();

  await deleteModel(page);
  await expect(page.getByTitle(newModelName)).toBeHidden();
});

test("Model reordering has succeeded", async ({ page }) => {
  const modelName1 = "model1";
  const modelName2 = "model2";
  const modelName3 = "model3";

  await createModelFromSidebar(page, modelName1);
  await createModelFromSidebar(page, modelName2);
  await expect(page.getByRole("main").getByRole("menuitem").nth(0)).toContainText(modelName1);
  await expect(page.getByRole("main").getByRole("menuitem").nth(1)).toContainText(modelName2);

  await page
    .getByRole("menuitem", { name: modelName2 })
    .dragTo(page.getByRole("menuitem", { name: modelName1 }));
  await closeNotification(page);
  await expect(page.getByRole("main").getByRole("menuitem").nth(0)).toContainText(modelName2);
  await expect(page.getByRole("main").getByRole("menuitem").nth(1)).toContainText(modelName1);

  await createModelFromSidebar(page, modelName3);
  await expect(page.getByRole("main").getByRole("menuitem").nth(0)).toContainText(modelName2);
  await expect(page.getByRole("main").getByRole("menuitem").nth(1)).toContainText(modelName1);
  await expect(page.getByRole("main").getByRole("menuitem").nth(2)).toContainText(modelName3);
});

test("Group CRUD has succeeded", async ({ page }) => {
  const groupName = "e2e group name";
  const groupKey = "e2e-group-key";
  const updateGroupName = "new e2e group name";
  const updateGroupKey = "new-e2e-group-key";

  await createGroup(page, groupName, groupKey);
  await expect(page.getByTitle(groupName, { exact: true })).toBeVisible();
  await expect(page.getByText(`#${groupKey}`)).toBeVisible();

  await updateGroup(page, updateGroupName, updateGroupKey);
  await expect(page.getByTitle(updateGroupName)).toBeVisible();
  await expect(page.getByText(`#${updateGroupKey}`)).toBeVisible();
  await expect(page.getByRole("menuitem", { name: updateGroupName })).toBeVisible();

  await deleteGroup(page);
  await expect(page.getByTitle(updateGroupName)).toBeHidden();
});

test("Group creating from adding field has succeeded", async ({ page }) => {
  await createModelFromSidebar(page);
  await page.locator("li").filter({ hasText: "Group" }).locator("div").first().click();
  await page.getByRole("button", { name: "Create Group" }).click();
  await expect(page.getByLabel("New Group")).toContainText("New Group");
  await expect(page.getByRole("button", { name: "OK" })).toBeDisabled();

  await page.getByLabel("New Group").locator("#name").click();
  await page.getByLabel("New Group").locator("#name").fill("e2e group name");
  await page.getByLabel("New Group").locator("#key").click();
  await page.getByLabel("New Group").locator("#key").fill("e2e-group-key");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await expect(
    page.getByRole("menuitem", { name: "e2e group name" }).locator("span"),
  ).toBeVisible();
  await expect(page.getByText("e2e group name#e2e-group-key")).toBeVisible();
  await expect(page.getByText("FieldsMeta Data")).toBeHidden();
  await expect(page.locator("li").getByText("Reference", { exact: true })).toBeHidden();
  await expect(page.locator("li").getByText("Group", { exact: true })).toBeHidden();
  await page.locator("li").filter({ hasText: "Text" }).locator("div").first().click();
  await handleFieldForm(page, "text");
  await page.getByText("e2e model name").click();
  await page.locator("li").getByText("Group", { exact: true }).click();
  await expect(page.getByText("Create Group Field")).toBeVisible();
  await page.locator(".ant-select-selector").click();
  await expect(page.getByText("e2e group name #e2e-group-key")).toBeVisible();
  await page.getByRole("button", { name: "Cancel" }).click();
});

test("Group reordering has succeeded", async ({ page }) => {
  await createGroup(page, "group1", "group1");
  await createGroup(page, "group2", "group2");
  await expect(
    page.getByRole("main").getByRole("menu").last().getByRole("menuitem").nth(0),
  ).toContainText("group1");
  await expect(
    page.getByRole("main").getByRole("menu").last().getByRole("menuitem").nth(1),
  ).toContainText("group2");
  await page
    .getByRole("main")
    .getByRole("menu")
    .last()
    .getByRole("menuitem")
    .nth(1)
    .dragTo(page.getByRole("main").getByRole("menu").last().getByRole("menuitem").nth(0));
  await closeNotification(page);
  await expect(
    page.getByRole("main").getByRole("menu").last().getByRole("menuitem").nth(0),
  ).toContainText("group2");
  await expect(
    page.getByRole("main").getByRole("menu").last().getByRole("menuitem").nth(1),
  ).toContainText("group1");
  await createGroup(page, "group3", "group3");
  await expect(
    page.getByRole("main").getByRole("menu").last().getByRole("menuitem").nth(0),
  ).toContainText("group2");
  await expect(
    page.getByRole("main").getByRole("menu").last().getByRole("menuitem").nth(1),
  ).toContainText("group1");
  await expect(
    page.getByRole("main").getByRole("menu").last().getByRole("menuitem").nth(2),
  ).toContainText("group3");
});

// eslint-disable-next-line playwright/expect-expect
test("Text field CRUD has succeeded", async ({ page }) => {
  await createModelFromSidebar(page);
  await page.locator("li").filter({ hasText: "Text" }).locator("div").first().click();
  await handleFieldForm(page, "text");
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  await handleFieldForm(page, "new text", "new-text");
  await deleteField(page, "new text", "new-text");
});

test("Schema reordering has succeeded", async ({ page }) => {
  await createModelFromSidebar(page);
  await page.locator("li").filter({ hasText: /Text/ }).locator("div").first().click();
  await handleFieldForm(page, "text1");
  await page.locator("li").filter({ hasText: /Text/ }).locator("div").first().click();
  await handleFieldForm(page, "text2");
  await expect(page.getByLabel("Fields").locator(".draggable-item").nth(0)).toContainText(
    "text1#text1",
  );
  await expect(page.getByLabel("Fields").locator(".draggable-item").nth(1)).toContainText(
    "text2#text2",
  );
  await page
    .getByLabel("Fields")
    .locator(".grabbable")
    .nth(1)
    .dragTo(page.getByLabel("Fields").locator(".draggable-item").nth(0));
  await closeNotification(page);
  await expect(page.getByLabel("Fields").locator(".draggable-item").nth(0)).toContainText(
    "text2#text2",
  );
  await expect(page.getByLabel("Fields").locator(".draggable-item").nth(1)).toContainText(
    "text1#text1",
  );
});
