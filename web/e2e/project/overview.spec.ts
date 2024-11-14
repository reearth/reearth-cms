import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect, test } from "@reearth-cms/e2e/utils";

import { createProject, deleteProject } from "./utils/project";

test.beforeEach(async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
});

test.afterEach(async ({ page }) => {
  await deleteProject(page);
});

test("Model CRUD on Overview page has succeeded", async ({ page }) => {
  await expect(page.getByText("No Models yet")).toBeVisible();
  await page.getByRole("button", { name: "plus New Model" }).first().click();
  await expect(page.getByLabel("New Model").getByText("New Model")).toBeVisible();
  await page.getByLabel("Model name").click();
  await page.getByLabel("Model name").fill("model name");
  await page.getByLabel("Model description").click();
  await page.getByLabel("Model description").fill("model description");
  await page.getByLabel("Model key").click();
  await page.getByLabel("Model key").fill("model key");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await expect(page.getByTitle("model name")).toBeVisible();
  await expect(page.getByText("#model-key")).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "model name" }).locator("span")).toBeVisible();
  await page.getByText("Overview").click();
  await page.getByRole("list").locator("a").click();
  await page.getByText("Edit", { exact: true }).click();
  await page.getByLabel("Model name").click();
  await page.getByLabel("Model name").fill("new model name");
  await page.getByLabel("Model description").click();
  await page.getByLabel("Model description").fill("new model description");
  await page.getByLabel("Model key").click();
  await page.getByLabel("Model key").fill("new-model-key");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await expect(page.locator("#root")).toContainText("new model name");
  await expect(page.locator("#root")).toContainText("new model description");
  await page.getByRole("list").locator("a").click();
  await page.getByText("Delete").click();
  await page.getByRole("button", { name: "Delete Model" }).click();
  await closeNotification(page);
  await expect(page.locator("#root")).not.toContainText("new model name");
  await expect(page.getByText("No Models yet")).toBeVisible();
});

test("Creating Model by using the button on placeholder has succeeded", async ({ page }) => {
  await page.getByRole("button", { name: "plus New Model" }).last().click();
  await expect(page.getByLabel("New Model").getByText("New Model")).toBeVisible();
  await page.getByLabel("Model name").click();
  await page.getByLabel("Model name").fill("model name");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await expect(page.getByTitle("model name")).toBeVisible();
  await expect(page.getByText("#model-name")).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "model name" }).locator("span")).toBeVisible();
});
