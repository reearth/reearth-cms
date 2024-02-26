import { expect, test } from "@reearth-cms/e2e/utils";

import { createProject, deleteProject } from "./utils";

test("Model CRUD on Overview page has succeeded", async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);

  await page.getByRole("button", { name: "plus New Model" }).click();
  await page.getByLabel("Model name").click();
  await page.getByLabel("Model name").fill("model name");
  await page.getByLabel("Model description").click();
  await page.getByLabel("Model description").fill("model description");
  await page.getByLabel("Model key").click();
  await page.getByLabel("Model key").fill("model key");
  await expect(page.getByRole("button", { name: "Ok" })).not.toBeEnabled();
  await page.getByLabel("Model key").click();
  await page.getByLabel("Model key").fill("model-key");
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created model!");
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
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated model!");
  await expect(page.locator("#root")).toContainText("new model name");
  await expect(page.locator("#root")).toContainText("new model description");
  await page.getByRole("list").locator("a").click();
  await page.getByText("Delete").click();
  await page.getByRole("button", { name: "Delete Model" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully deleted model!");
  await expect(page.locator("#root")).not.toContainText("new model name");

  await deleteProject(page);
});
