import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { getId, getMultipleProjects } from "@reearth-cms/e2e/helpers/mock.helper";

test.describe.configure({ mode: "default" });

test.beforeEach(async ({ reearth }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
});

test.describe("Project CRUD and searching has succeeded", () => {
  // setup
  const PROJECT_NAME = getId();
  const PROJECT_DESCRIPTION = "project description";
  const NEW_PROJECT_NAME = `new ${PROJECT_NAME}`;
  const NEW_PROJECT_DESCRIPTION = `new ${PROJECT_DESCRIPTION}`;

  test("Create project", async ({ workspacePage }) => {
    const newProjectButton = workspacePage.newProjectButtonLast;
    await newProjectButton.click();

    await workspacePage.projectNameInput.fill(PROJECT_NAME);
    await workspacePage.projectDescriptionInput.fill(PROJECT_DESCRIPTION);

    await workspacePage.okButton.click();
    await workspacePage.closeNotification();
  });

  test("Read project and search project", async ({ workspacePage }) => {
    const projectCard = workspacePage.projectCardByName(PROJECT_NAME);
    await expect(projectCard).toBeVisible();
    await expect(projectCard.getByText(PROJECT_DESCRIPTION)).toBeVisible();

    await workspacePage.searchProjectsInput.fill("no project");
    await workspacePage.searchButton.click();
    await expect(projectCard).toBeHidden();

    await workspacePage.clearSearchButton.click();
    await expect(projectCard).toBeVisible();

    await projectCard.click();
    await expect(workspacePage.banner).toContainText(PROJECT_NAME);
  });

  test("Update project", async ({ projectPage, projectSettingsPage }) => {
    await projectPage.gotoProject(PROJECT_NAME);
    await projectSettingsPage.goToProjectSettings();
    await projectPage.nameInput.fill(NEW_PROJECT_NAME);
    await projectPage.descriptionInput.fill(NEW_PROJECT_DESCRIPTION);
    await projectPage.formSaveChangesButton.click();
    await projectPage.closeNotification();

    await expect(projectPage.projectSettingsHeading(NEW_PROJECT_NAME)).toBeVisible();
    await expect(projectPage.banner).toContainText(NEW_PROJECT_NAME);

    const ownerSwitch = projectPage.ownerSwitch;
    await ownerSwitch.click();
    await projectPage.saveChangesButtonSecond.click();

    await expect(ownerSwitch).toHaveAttribute("aria-checked", "true");

    await projectPage.closeNotification();
    await projectPage.modelsMenuItem.click();

    await expect(projectPage.banner).toContainText(NEW_PROJECT_NAME);
  });

  test("Delete project", async ({ projectPage, workspacePage, projectSettingsPage }) => {
    await projectPage.gotoProject(NEW_PROJECT_NAME);
    await projectSettingsPage.goToProjectSettings();
    const deleteButton = projectPage.deleteProjectButton;
    await deleteButton.waitFor({ state: "visible" });
    await deleteButton.click();
    await projectPage.okButton.click();
    await projectPage.closeNotification();
    await expect(workspacePage.projectTextByName("new project name", true)).toBeHidden();
  });
});

test.describe("Project List", () => {
  const { PROJECT_ID_LIST, FIRST_PAGE_PROJECTS, SECOND_PAGE_PROJECTS, NAME_SEPARATOR } =
    getMultipleProjects();

  test.beforeEach(async ({ projectPage }) => {
    for await (const projectName of PROJECT_ID_LIST) {
      await projectPage.createProject(projectName);
    }
  });

  test("Project list pagination", async ({ workspacePage }) => {
    await test.step("Check first page", async () => {
      await workspacePage.clickPagination(1);

      for await (const projectName of FIRST_PAGE_PROJECTS) {
        const projectCard = workspacePage.projectCardByName(projectName);
        await expect(projectCard).toBeVisible();
      }
    });

    await test.step("Check second page", async () => {
      await workspacePage.clickPagination(2);

      for await (const projectName of SECOND_PAGE_PROJECTS) {
        const projectCard = workspacePage.projectCardByName(projectName);
        await expect(projectCard).toBeVisible();
      }
    });

    await test.step("Check jump page", async () => {
      await workspacePage.jumpToPage(2);

      for await (const projectName of SECOND_PAGE_PROJECTS) {
        const projectCard = workspacePage.projectCardByName(projectName);
        await expect(projectCard).toBeVisible();
      }
    });
  });

  test.describe("Project list sorting", () => {
    test("Check sort with createdAt (latest to oldest)", async ({ workspacePage }) => {
      await workspacePage.selectSortOption("id");
      const projectNames = await workspacePage.getVisibleProjects();

      const equality = projectNames.every(
        (project, index) => project === PROJECT_ID_LIST[index - 1],
      );
      expect(equality).toBe(true);
    });

    test("Check sort with updatedAt (latest to oldest)", async ({
      workspacePage,
      projectPage,
      projectSettingsPage,
    }) => {
      const firstProjectName = PROJECT_ID_LIST[0];
      const newFirstProjectName = "new-" + firstProjectName;

      await test.step("Update the first project", async () => {
        await workspacePage.searchProjectsInput.fill(firstProjectName);
        await workspacePage.searchButton.click();
        await projectPage.gotoProject(firstProjectName);
        await projectSettingsPage.goToProjectSettings();

        const nameEl = projectSettingsPage.projectName;
        await nameEl.fill(newFirstProjectName);
        await projectSettingsPage.saveSettings();
        await workspacePage.goto("/", { waitUntil: "domcontentloaded" });
      });

      await workspacePage.selectSortOption("updatedat");

      const projectCard = workspacePage.projectCardByName(newFirstProjectName);
      await expect(projectCard).toBeVisible();

      await test.step("Update the first project with new name for deletion", async () => {
        PROJECT_ID_LIST[0] = newFirstProjectName;
      });
    });

    test("Check sort with name (a-z)", async ({ workspacePage }) => {
      await workspacePage.selectSortOption("name");
      const projectNames = await workspacePage.getVisibleProjects();

      const equality = projectNames.every((project, index) => project === PROJECT_ID_LIST[index]);
      expect(equality).toBe(true);
    });
  });

  test("Check reset state: search input, sort select, pagination", async ({
    projectPage,
    workspacePage,
  }) => {
    const preCondition = async () => {
      await workspacePage.clickPagination(2);
      await workspacePage.selectSortOption("name");
    };

    const checkStatus = async (checkSort = false) => {
      const firstEl = workspacePage.paginationEl(1);
      await expect(firstEl).toBeVisible();
      await expect(firstEl).toContainClass("ant-pagination-item-active");

      if (checkSort) {
        await expect(workspacePage.projectSelectDefaultSort).toBeVisible();
      }
    };

    await test.step("Reset after sort change", async () => {
      await preCondition();
      await workspacePage.selectSortOption("id");
      await checkStatus();
    });

    await test.step("Reset after search project", async () => {
      await preCondition();
      await workspacePage.searchProjectsInput.fill(PROJECT_ID_LIST[0]);
      await workspacePage.searchButton.click();

      await checkStatus(true);
      await workspacePage.clearSearchButton.click();
    });

    await test.step("Reset after cancel search", async () => {
      await preCondition();

      await workspacePage.searchProjectsInput.fill(NAME_SEPARATOR);
      await workspacePage.searchButton.click();
      await workspacePage.clickPagination(2);
      await workspacePage.clearSearchButton.click();

      await checkStatus(true);
    });

    await test.step("Reset after create project", async () => {
      const projectName = getId();
      await projectPage.createProject(projectName);

      await checkStatus(true);

      await projectPage.gotoProject(projectName);
      await projectPage.deleteProject();
    });
  });

  test.afterEach(async ({ workspacePage, projectPage }) => {
    for await (const projectName of PROJECT_ID_LIST) {
      await workspacePage.searchProjectsInput.fill(projectName);
      await workspacePage.searchButton.click();
      await projectPage.gotoProject(projectName);
      await projectPage.deleteProject();
    }
  });
});
