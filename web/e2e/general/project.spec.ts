import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect, test } from "@reearth-cms/e2e/utils";
import { getId } from "@reearth-cms/e2e/utils/mock";

test.afterEach(async ({ page }) => {
  await page.getByText("Settings").click();
  await page.getByRole("button", { name: "Delete Project" }).click();
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await expect(page.getByText("new project name", { exact: true })).toBeHidden();
});

test("Project CRUD and searching has succeeded", async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "plus New Project" }).last().click();
  await page.getByLabel("Project name").click();
  await page.getByLabel("Project name").fill("project name");
  await page.getByLabel("Project alias").click();
  await page.getByLabel("Project alias").fill(getId());
  await page.getByLabel("Project description").click();
  await page.getByLabel("Project description").fill("project description");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);

  await expect(page.getByText("project name", { exact: true })).toBeVisible();
  await expect(page.getByText("project description", { exact: true })).toBeVisible();
  await page.getByPlaceholder("search projects").click();
  await page.getByPlaceholder("search projects").fill("no project");
  await page.getByRole("button", { name: "search" }).click();
  await expect(page.getByText("project name", { exact: true })).toBeHidden();
  await page.getByRole("button", { name: "close-circle" }).click();
  await expect(page.getByText("project name", { exact: true })).toBeVisible();
  await page.getByText("project name", { exact: true }).click();
  await expect(page.getByText("project name").nth(1)).toBeVisible();
  await expect(page.getByText("project description")).toBeVisible();

  await page.getByText("Settings").click();
  await page.getByLabel("Name").click();
  await page.getByLabel("Name").fill("new project name");
  await page.getByLabel("Description").click();
  await page.getByLabel("Description").fill("new project description");
  await page.locator("form").getByRole("button", { name: "Save changes" }).click();
  await closeNotification(page);

  await expect(page.locator("#root")).toContainText("Project Settings / new project name");
  await expect(page.locator("header")).toContainText("new project name");
  await page.getByRole("row", { name: "Owner" }).getByRole("switch").click();
  await page.getByRole("button", { name: "Save changes" }).nth(1).click();
  await expect(page.getByRole("row", { name: "Owner" }).getByRole("switch")).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await closeNotification(page);

  await page.getByText("Overview").click();
  await expect(page.locator("#root")).toContainText("new project name");
  await expect(page.locator("#root")).toContainText("new project description");
});
