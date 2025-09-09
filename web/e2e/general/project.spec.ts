import { expect, test } from "@reearth-cms/e2e/fixtures/test";

test.afterEach(async ({ projectSettingsPage, projectLayoutPage }) => {
  await projectLayoutPage.navigateToSettings();
  await projectSettingsPage.deleteProject();
});

test("Project CRUD and searching has succeeded", async ({
  reearth,
  homePage,
  projectLayoutPage,
  projectSettingsPage,
}) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });

  const { id: projectName, description: projectDescription } = await homePage.createProject();

  await homePage.expectProjectVisible(projectName, projectDescription);
  await homePage.searchProjects("no project");
  await homePage.expectProjectHidden(projectName);
  await homePage.clearSearch();
  await homePage.expectProjectVisible(projectName);
  await homePage.openProject(projectName);
  await projectLayoutPage.expectProjectNameInHeader(projectName);

  await projectLayoutPage.navigateToSettings();
  const newProjectName = `new ${projectName}`;
  const newProjectDescription = `new ${projectDescription}`;
  await projectSettingsPage.updateProject(newProjectName, newProjectDescription);

  await expect(
    projectSettingsPage.getByRole("heading", { name: `Project Settings / ${newProjectName}` }),
  ).toBeVisible();
  await projectSettingsPage.toggleMemberSwitch("Owner");
  await projectSettingsPage.getByRole("button", { name: "Save changes" }).nth(1).click();
  await expect(projectSettingsPage.getMemberRow("Owner").getByRole("switch")).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await projectSettingsPage.closeNotification();

  await projectLayoutPage.getByText("Models").click();
  await projectLayoutPage.expectProjectNameInHeader(newProjectName);
});
