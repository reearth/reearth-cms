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

  test("@smoke Create project", async ({ workspacePage, page }) => {
    await test.step("Open new project dialog and fill details", async () => {
      const newProjectButton = workspacePage.newProjectButtonLast;
      await newProjectButton.click();

      await workspacePage.projectNameInput.fill(PROJECT_NAME);
      await workspacePage.projectDescriptionInput.fill(PROJECT_DESCRIPTION);

      await workspacePage.okButton.click();
      await workspacePage.closeNotification();
    });
  });

  test("Read project and search project", async ({ workspacePage, page }) => {
    await test.step("Verify project card is visible with description", async () => {
      const projectCard = workspacePage.projectCardByName(PROJECT_NAME);
      await expect(projectCard).toBeVisible();
      await expect(projectCard.getByText(PROJECT_DESCRIPTION)).toBeVisible();
    });

    await test.step("Search for non-existent project", async () => {
      const projectCard = workspacePage.projectCardByName(PROJECT_NAME);
      await workspacePage.searchProjectsInput.fill("no project");
      await workspacePage.searchButton.click();
      await expect(projectCard).toBeHidden();
    });

    await test.step("Clear search and verify project appears", async () => {
      const projectCard = workspacePage.projectCardByName(PROJECT_NAME);
      await workspacePage.clearSearchButton.click();
      await expect(projectCard).toBeVisible();
    });

    await test.step("Navigate to project", async () => {
      const projectCard = workspacePage.projectCardByName(PROJECT_NAME);
      await projectCard.click();
      await expect(workspacePage.banner).toContainText(PROJECT_NAME);
    });
  });

  test("@smoke Update project", async ({ projectPage, projectSettingsPage, page }) => {
    await test.step("Navigate to project settings and update name and description", async () => {
      await projectPage.gotoProject(PROJECT_NAME);
      await projectSettingsPage.goToProjectSettings();
      await projectPage.nameInput.fill(NEW_PROJECT_NAME);
      await projectPage.descriptionInput.fill(NEW_PROJECT_DESCRIPTION);
      await projectPage.formSaveChangesButton.click();
      await projectPage.closeNotification();

      await expect(projectPage.projectSettingsHeading(NEW_PROJECT_NAME)).toBeVisible();
      await expect(projectPage.banner).toContainText(NEW_PROJECT_NAME);
    });

    await test.step("Enable owner switch and verify", async () => {
      const ownerSwitch = projectPage.ownerSwitch;
      await ownerSwitch.click();
      await projectPage.saveChangesButtonSecond.click();

      await expect(ownerSwitch).toHaveAttribute("aria-checked", "true");

      await projectPage.closeNotification();
    });

    await test.step("Verify updated name persists after navigation", async () => {
      await projectPage.modelsMenuItem.click();
      await expect(projectPage.banner).toContainText(NEW_PROJECT_NAME);
    });
  });

  test("@smoke Delete project", async ({
    projectPage,
    workspacePage,
    projectSettingsPage,
    page,
  }) => {
    await test.step("Navigate to project settings and delete project", async () => {
      await projectPage.gotoProject(NEW_PROJECT_NAME);
      await projectSettingsPage.goToProjectSettings();
      const deleteButton = projectPage.deleteProjectButton;
      await deleteButton.waitFor({ state: "visible" });
      await deleteButton.click();
      await projectPage.confirmDeleteProjectButton.click();
      await projectPage.closeNotification();
    });

    await test.step("Verify project no longer appears in list", async () => {
      await expect(workspacePage.projectTextByName(NEW_PROJECT_NAME, true)).toBeHidden();
    });
  });
});

test.describe("Project List", () => {
  test.skip();
  const { PROJECT_ID_LIST, FIRST_PAGE_PROJECTS, SECOND_PAGE_PROJECTS, NAME_SEPARATOR } =
    getMultipleProjects();

  test.beforeEach(async ({ projectPage, page }) => {
    for await (const projectName of PROJECT_ID_LIST) {
      await projectPage.createProject(projectName);
      await page.waitForTimeout(300);
    }
  });

  test("Project list pagination", async ({ workspacePage, page }) => {
    await test.step("Check first page", async () => {
      await workspacePage.clickPagination(1);
      await page.waitForTimeout(300);

      for await (const projectName of FIRST_PAGE_PROJECTS) {
        const projectCard = workspacePage.projectCardByName(projectName);
        await expect(projectCard).toBeVisible();
      }
    });

    await test.step("Check second page", async () => {
      await workspacePage.clickPagination(2);
      await page.waitForTimeout(300);

      for await (const projectName of SECOND_PAGE_PROJECTS) {
        const projectCard = workspacePage.projectCardByName(projectName);
        await expect(projectCard).toBeVisible();
      }
    });

    await test.step("Check jump page", async () => {
      await workspacePage.jumpToPage(2);
      await page.waitForTimeout(300);

      for await (const projectName of SECOND_PAGE_PROJECTS) {
        const projectCard = workspacePage.projectCardByName(projectName);
        await expect(projectCard).toBeVisible();
      }
    });
  });

  test.describe("Project list sorting", () => {
    test("Check sort with createdAt (latest to oldest)", async ({ workspacePage, page }) => {
      await test.step("Sort by ID and verify order", async () => {
        await workspacePage.selectSortOption("id");
        const projectNames = await workspacePage.getVisibleProjects();

        const equality = projectNames.every(
          (project, index) => project === PROJECT_ID_LIST[index - 1],
        );
        expect(equality).toBe(true);
      });
    });

    test("Check sort with updatedAt (latest to oldest)", async ({
      workspacePage,
      projectPage,
      projectSettingsPage,
      page,
    }) => {
      const firstProjectName = PROJECT_ID_LIST[0];
      const newFirstProjectName = "new-" + firstProjectName;

      await test.step("Update the first project with new name for deletion", async () => {
        PROJECT_ID_LIST[0] = newFirstProjectName;
      });

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

      await test.step("Sort by updatedAt and verify updated project appears first", async () => {
        await workspacePage.selectSortOption("updatedat");

        const projectCard = workspacePage.projectCardByName(newFirstProjectName);
        await expect(projectCard).toBeVisible();
      });
    });

    test("Check sort with name (a-z)", async ({ workspacePage, page }) => {
      await test.step("Sort by name and verify alphabetical order", async () => {
        await workspacePage.selectSortOption("name");
        const projectNames = await workspacePage.getVisibleProjects();

        const equality = projectNames.every((project, index) => project === PROJECT_ID_LIST[index]);
        expect(equality).toBe(true);
      });
    });
  });

  test("Check reset state: search input, sort select, pagination", async ({
    projectPage,
    workspacePage,
    page,
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

  test.afterEach(async ({ workspacePage, projectPage, page }) => {
    for await (const projectName of PROJECT_ID_LIST) {
      await workspacePage.goto("/", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(300);
      await workspacePage.searchProjectsInput.fill(projectName);
      await workspacePage.searchButton.click();
      await page.waitForTimeout(300);
      const projectCard = workspacePage.projectCardByName(projectName);
      const isVisible = await projectCard.isVisible().catch(() => false);
      if (isVisible) {
        await projectPage.gotoProject(projectName);
        await page.waitForTimeout(300);
        await projectPage.deleteProject();
      }
    }
  });
});
