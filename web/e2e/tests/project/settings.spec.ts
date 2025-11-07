import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";
import { t } from "@reearth-cms/e2e/support/i18n";
import { Constant } from "@reearth-cms/utils/constant";

const EXIST_PROJECT_NAME = getId();
const PROJECT_NAME = getId();
const NEW_PROJECT_NAME = getId();

test.beforeEach(async ({ reearth }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
});

test.describe("Project General Settings", () => {
  test("Update project general settings", async ({ page, projectSettingsPage, projectPage }) => {
    await test.step("Project creation setup", async () => {
      await projectPage.createProject(EXIST_PROJECT_NAME);
      await projectSettingsPage.goto("/");
      await projectPage.createProject(PROJECT_NAME);

      await projectPage.gotoProject(PROJECT_NAME);
      await projectSettingsPage.goToProjectSettings();
      await page.waitForTimeout(300);
    });

    await test.step("Check project settings heading", async () => {
      await expect(projectSettingsPage.settingsTitle(PROJECT_NAME)).toBeVisible();
      await page.waitForTimeout(300);
    });

    const nameEl = projectSettingsPage.projectName;

    await test.step("Check original name exists", async () => {
      await expect(nameEl).toBeVisible();
      await expect(nameEl).toHaveValue(PROJECT_NAME);
      await page.waitForTimeout(300);
    });

    const aliasEl = projectSettingsPage.projectAlias;

    await test.step("Check original alias exists", async () => {
      await expect(aliasEl).toBeVisible();
      await expect(aliasEl).toHaveValue(PROJECT_NAME);
      await page.waitForTimeout(300);
    });

    await test.step("Update project name and check result", async () => {
      await nameEl.fill(NEW_PROJECT_NAME);
      await projectSettingsPage.saveSettings();
      const newSettingsTitle = projectSettingsPage.settingsTitle(NEW_PROJECT_NAME);
      await expect(newSettingsTitle).toBeVisible();
      await page.waitForTimeout(300);
    });

    const errorEl = projectSettingsPage.errorMessage;

    await test.step("Alias illegal cases", async () => {
      await test.step("Alias illegal case 1", async () => {
        await aliasEl.clear();
        const errorMsg1 = t("{{field}} field is required!", { field: "alias" });
        await expect(errorEl).toHaveText(errorMsg1);
        await page.waitForTimeout(300);
      });

      await test.step("Alias illegal case 2", async () => {
        await aliasEl.fill("hell");
        const errorMsg2 = t("Your alias must be between {{min}} and {{max}} characters long.", {
          min: Constant.PROJECT_ALIAS.MIN_LENGTH,
          max: Constant.PROJECT_ALIAS.MAX_LENGTH,
        });
        await expect(errorEl).toHaveText(errorMsg2);
        await page.waitForTimeout(300);
      });

      await test.step("Alias illegal case 3", async () => {
        await aliasEl.fill("testAlias");
        const errorMsg3 = t(
          "Alias is invalid. Please use lowercase alphanumeric, hyphen and underscore characters only.",
        );
        await expect(errorEl).toHaveText(errorMsg3);
        await page.waitForTimeout(300);
      });

      await test.step("Alias illegal case 4", async () => {
        await aliasEl.fill("test-alias#");
        const errorMsg4 = t(
          "Alias is invalid. Please use lowercase alphanumeric, hyphen and underscore characters only.",
        );
        await expect(errorEl).toHaveText(errorMsg4);
        await page.waitForTimeout(300);
      });

      await test.step("Alias illegal case 5", async () => {
        await aliasEl.fill(EXIST_PROJECT_NAME);
        const errorMsg5 = t("Project alias is already taken");
        await expect(errorEl).toHaveText(errorMsg5);
        await page.waitForTimeout(300);
      });
      await page.waitForTimeout(300);
    });

    await test.step("Alias legal cases", async () => {
      await test.step("Alias legal case 1", async () => {
        await aliasEl.fill("test-alias-123");
        await expect(errorEl).toBeHidden();
        await page.waitForTimeout(300);
      });

      await test.step("Alias legal case 2", async () => {
        await aliasEl.fill("test_alias_123");
        await expect(errorEl).toBeHidden();
        await page.waitForTimeout(300);
      });
      await page.waitForTimeout(300);
    });

    await test.step("Delete all projects", async () => {
      const projects = [NEW_PROJECT_NAME, EXIST_PROJECT_NAME];

      for await (const project of projects) {
        await projectPage.gotoProject(project);
        await projectPage.deleteProject();
      }
      await page.waitForTimeout(300);
    });
  });
});
