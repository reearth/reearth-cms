import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect, test } from "@reearth-cms/e2e/utils";
import {getId} from "@reearth-cms/e2e/utils/mock";

test.afterEach(async ({ page }) => {
  await page.getByText("Settings").click();
  await page.getByRole("button", { name: "Delete Project" }).click();
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await expect(page.getByText("new project name", { exact: true })).toBeHidden();
});

test("Project CRUD and searching has succeeded", async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", {name: "plus New Project"}).last().click();
    const projectName = getId();
    const projectDescription = "project description";
    await page.getByLabel("Project name").fill(projectName);
    await page.getByLabel("Project description").fill(projectDescription);
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);

    await expect(page.getByText(projectName)).toBeVisible();
    await expect(page.getByText(projectDescription, {exact: true})).toBeVisible();
  await page.getByPlaceholder("search projects").fill("no project");
  await page.getByRole("button", { name: "search" }).click();
    await expect(page.getByText(projectName)).toBeHidden();
  await page.getByRole("button", { name: "close-circle" }).click();
    await expect(page.getByText(projectName)).toBeVisible();
    await page.getByText(projectName).click();
    await expect(page.getByText(projectName).nth(1)).toBeVisible();
    await expect(page.getByText(projectDescription)).toBeVisible();

  await page.getByText("Settings").click();
    const newProjectName = `new ${projectName}`;
    const newProjectDescription = `new ${projectDescription}`;
    await page.getByLabel("Name").fill(newProjectName);
    await page.getByLabel("Description").fill(newProjectDescription);
  await page.locator("form").getByRole("button", { name: "Save changes" }).click();
  await closeNotification(page);

    await expect(
        page.getByRole("heading", {name: `Project Settings / ${newProjectName}`}),
    ).toBeVisible();
    await expect(page.getByRole("banner")).toContainText(newProjectName);
  await page.getByRole("row", { name: "Owner" }).getByRole("switch").click();
  await page.getByRole("button", { name: "Save changes" }).nth(1).click();
  await expect(page.getByRole("row", { name: "Owner" }).getByRole("switch")).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await closeNotification(page);

  await page.getByText("Overview").click();
    await expect(page.getByRole("heading", {name: newProjectName})).toBeVisible();
    await expect(page.getByText(newProjectDescription)).toBeVisible();
});
