import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";

test.afterEach(async ({ projectPage, workspacePage }) => {
  await projectPage.settingsMenuItem.click();
  const deleteButton = projectPage.deleteProjectButton;
  await deleteButton.waitFor({ state: "visible" });
  await deleteButton.click();
  await projectPage.okButton.click();
  await projectPage.closeNotification();
  await expect(workspacePage.projectTextByName("new project name", true)).toBeHidden();
});

test("Project CRUD and searching has succeeded", async ({
  reearth,
  workspacePage,
  projectPage,
}) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  const newProjectButton = workspacePage.newProjectButtonLast;
  await newProjectButton.click();
  const projectName = getId();
  const projectDescription = "project description";
  await workspacePage.projectNameInput.fill(projectName);
  await workspacePage.projectDescriptionInput.fill(projectDescription);
  await workspacePage.okButton.click();
  await workspacePage.closeNotification();

  const projectCard = workspacePage.projectCardByName(projectName);
  await expect(projectCard).toBeVisible();
  await expect(projectCard.getByText(projectDescription)).toBeVisible();
  await workspacePage.searchProjectsInput.fill("no project");
  await workspacePage.searchButton.click();
  await expect(projectCard).toBeHidden();
  await workspacePage.clearSearchButton.click();
  await expect(projectCard).toBeVisible();
  await projectCard.click();
  await expect(workspacePage.banner).toContainText(projectName);

  await projectPage.settingsMenuItem.click();
  const newProjectName = `new ${projectName}`;
  const newProjectDescription = `new ${projectDescription}`;
  await projectPage.nameInput.fill(newProjectName);
  await projectPage.descriptionInput.fill(newProjectDescription);
  await projectPage.formSaveChangesButton.click();
  await projectPage.closeNotification();

  await expect(projectPage.projectSettingsHeading(newProjectName)).toBeVisible();
  await expect(projectPage.banner).toContainText(newProjectName);
  const ownerSwitch = projectPage.ownerSwitch;
  await ownerSwitch.click();
  await projectPage.saveChangesButtonSecond.click();
  await expect(ownerSwitch).toHaveAttribute("aria-checked", "true");
  await projectPage.closeNotification();

  await projectPage.modelsMenuItem.click();
  await expect(projectPage.banner).toContainText(projectName);
});
