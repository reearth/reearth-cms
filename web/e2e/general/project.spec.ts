import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { test, expect } from "@reearth-cms/e2e/fixtures/test";

test.afterEach(async ({ page }) => {
  await page.getByText("Settings").click();
  const deleteButton = page.getByRole("button", { name: "Delete Project" });
  await deleteButton.waitFor({ state: "visible" });
  await deleteButton.click();
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await expect(page.getByText("new project name", { exact: true })).toBeHidden();
});

test("Project CRUD and searching has succeeded", async ({
  reearth,
  page,
  homePage,
}) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });

  const { id: projectName, description: projectDescription } = await homePage.createProject();

  await homePage.expectProjectVisible(projectName, projectDescription);
  await homePage.searchProjects("no project");
  await homePage.expectProjectHidden(projectName);
  await homePage.clearSearch();
  await homePage.expectProjectVisible(projectName);
  await homePage.openProject(projectName);
  await expect(page.getByRole("banner")).toContainText(projectName);

  await page.getByText("Settings").click();
  const newProjectName = `new ${projectName}`;
  const newProjectDescription = `new ${projectDescription}`;
  await page.getByLabel("Name").fill(newProjectName);
  await page.getByLabel("Description").fill(newProjectDescription);
  await page.locator("form").getByRole("button", { name: "Save changes" }).click();
  await closeNotification(page);

  await expect(
    page.getByRole("heading", { name: `Project Settings / ${newProjectName}` }),
  ).toBeVisible();
  await expect(page.getByRole("banner")).toContainText(newProjectName);
  const ownerSwitch = page.getByRole("row", { name: "Owner" }).getByRole("switch");
  await ownerSwitch.click();
  await page.getByRole("button", { name: "Save changes" }).nth(1).click();
  await expect(ownerSwitch).toHaveAttribute("aria-checked", "true");
  await closeNotification(page);

  await page.getByText("Models").click();
  await expect(page.getByRole("banner")).toContainText(projectName);
});
