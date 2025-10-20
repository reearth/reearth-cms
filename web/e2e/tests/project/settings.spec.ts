import i18next from "i18next";
import Backend from "i18next-fs-backend";

import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";
import { Constant } from "@reearth-cms/utils/constant";

const EXIST_PROJECT_NAME = getId();
const PROJECT_NAME = getId();
const NEW_PROJECT_NAME = getId();

test.beforeEach(async ({ reearth }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });

  await i18next.use(Backend).init({
    lng: "en",
    backend: {
      loadPath: "@reearth-cms/e2e/translations/en.yml",
    },
  });
});

test.describe("Project General Settings", () => {
  test("Update project general settings", async ({ projectSettingsPage, projectPage }) => {
    await test.step("Project creation setup", async () => {
      await projectPage.createProject(EXIST_PROJECT_NAME);
      await projectSettingsPage.goto("/");
      await projectPage.createProject(PROJECT_NAME);

      await projectPage.gotoProject(PROJECT_NAME);
      await projectSettingsPage.goToProjectSettings();
    });

    await test.step("Check project settings heading", async () => {
      await expect(projectSettingsPage.settingsTitle(PROJECT_NAME)).toBeVisible();
    });

    const nameEl = projectSettingsPage.projectName;

    await test.step("Check original name exists", async () => {
      await expect(nameEl).toBeVisible();
      await expect(nameEl).toHaveValue(PROJECT_NAME);
    });

    const aliasEl = projectSettingsPage.projectAlias;

    await test.step("Check original alias exists", async () => {
      await expect(aliasEl).toBeVisible();
      await expect(aliasEl).toHaveValue(PROJECT_NAME);
    });

    await test.step("Update project name and check result", async () => {
      await nameEl.fill(NEW_PROJECT_NAME);
      await projectSettingsPage.saveSettings();
      const newSettingsTitle = projectSettingsPage.settingsTitle(NEW_PROJECT_NAME);
      await expect(newSettingsTitle).toBeVisible();
    });

    const errorEl = projectSettingsPage.errorMessage;

    await test.step("Alias illegal cases", async () => {
      await test.step("Alias illegal case 1", async () => {
        await aliasEl.clear();
        const errorMsg1 = i18next.t("{{field}} field is required!", { field: "alias" });
        await expect(errorEl).toHaveText(errorMsg1);
      });

      await test.step("Alias illegal case 2", async () => {
        await aliasEl.fill("hell");
        const errorMsg2 = i18next.t(
          "Your alias must be between {{min}} and {{max}} characters long.",
          {
            min: Constant.PROJECT_ALIAS.MIN_LENGTH,
            max: Constant.PROJECT_ALIAS.MAX_LENGTH,
          },
        );
        await expect(errorEl).toHaveText(errorMsg2);
      });

      await test.step("Alias illegal case 3", async () => {
        await aliasEl.fill("testAlias");
        const errorMsg3 = i18next.t(
          "Alias is invalid. Please use lowercase alphanumeric, hyphen and underscore characters only.",
        );
        await expect(errorEl).toHaveText(errorMsg3);
      });

      await test.step("Alias illegal case 4", async () => {
        await aliasEl.fill("test-alias#");
        const errorMsg4 = i18next.t(
          "Alias is invalid. Please use lowercase alphanumeric, hyphen and underscore characters only.",
        );
        await expect(errorEl).toHaveText(errorMsg4);
      });

      await test.step("Alias illegal case 5", async () => {
        await aliasEl.fill(EXIST_PROJECT_NAME);
        const errorMsg5 = i18next.t("Project alias is already taken");
        await expect(errorEl).toHaveText(errorMsg5);
      });
    });

    await test.step("Alias legal cases", async () => {
      await test.step("Alias legal case 1", async () => {
        await aliasEl.fill("test-alias-123");
        await expect(errorEl).toBeHidden();
      });

      await test.step("Alias legal case 2", async () => {
        await aliasEl.fill("test_alias_123");
        await expect(errorEl).toBeHidden();
      });
    });

    await test.step("Delete all projects", async () => {
      const projects = [NEW_PROJECT_NAME, EXIST_PROJECT_NAME];

      for await (const project of projects) {
        await projectPage.gotoProject(project);
        await projectPage.deleteProject();
      }
    });
  });
});
