import { Page } from "@playwright/test";

import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect, test } from "@reearth-cms/e2e/utils";

import { handleFieldForm } from "./utils/field";
import { crudGroup } from "./utils/group";
import { createModel, crudModel } from "./utils/model";
import { createProject, deleteProject } from "./utils/project";

async function deleteField(page: Page, name: string, key = name) {
  await page.getByLabel("delete").locator("svg").click();
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.locator("body")).toContainText("Successfully deleted field!");
  await closeNotification(page);
  await expect(page.getByText(`${name} #${key}`)).not.toBeVisible();
}

test("Model CRUD has succeeded", async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
  await crudModel(page);
  await deleteProject(page);
});

test("Group CRUD has succeeded", async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
  await crudGroup(page);
  await deleteProject(page);
});

test("Text field CRUD has succeeded", async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
  await createModel(page);
  await page
    .locator("li")
    .filter({ hasText: "TextHeading and titles, one-" })
    .locator("div")
    .first()
    .click();
  await handleFieldForm(page, "text");
  await expect(page.getByRole("alert").last()).toContainText("Successfully created field!");
  await closeNotification(page);
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  await handleFieldForm(page, "new text", "new-text");
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated field!");
  await closeNotification(page);
  await deleteField(page, "new text", "new-text");

  await deleteProject(page);
});
