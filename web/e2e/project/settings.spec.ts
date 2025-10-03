import i18next from "i18next";
// eslint-disable-next-line import/no-extraneous-dependencies
import Backend from "i18next-fs-backend";

import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { Constant } from "@reearth-cms/utils/constant";

import { createProject, deleteProject } from "./utils/project";

const EXIST_PROJECT_NAME = "exist-project";
const PROJECT_NAME = "test-project";
const NEW_PROJECT_NAME = "new-test-project";

test.beforeEach(async ({ reearth }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });

  await i18next.use(Backend).init({
    lng: "en",
    backend: {
      loadPath: "@reearth-cms/e2e/translations/en.yml",
    },
  });
});

test.afterEach(async ({ page: _page, reearth: _reearth }) => {});

test.describe("Project General Settings", () => {
  test("Update project general settings", async ({ reearth, page }) => {
    await test.step("Project creation setup", async () => {
      await createProject(page, EXIST_PROJECT_NAME);
      await reearth.goto("/");
      await createProject(page, PROJECT_NAME);

      await page.getByText("Settings", { exact: true }).click();
    });

    await test.step("Check project settings heading", async () => {
      const settingsTitle = page.getByRole("heading", { name: PROJECT_NAME, exact: false });
      await expect(settingsTitle).toBeVisible();
    });

    const nameEl = page.getByLabel("name");

    await test.step("Check original name exists", async () => {
      await expect(nameEl).toBeVisible();
      await expect(nameEl).toHaveValue(PROJECT_NAME);
    });

    const aliasEl = page.getByLabel("alias");

    await test.step("Check original alias exists", async () => {
      await expect(aliasEl).toBeVisible();
      await expect(aliasEl).toHaveValue(PROJECT_NAME);
    });

    await test.step("Update project name and check result", async () => {
      await nameEl.fill(NEW_PROJECT_NAME);
      await page.getByRole("button", { name: "Save Changes" }).first().click();
      const newSettingsTitle = page.getByRole("heading", { name: NEW_PROJECT_NAME, exact: false });
      await expect(newSettingsTitle).toBeVisible();
    });

    const errorEl = page.locator("#alias_help");

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
        "Alias is invalid. Please use lowercase alphanumeric, hyphen, underscore, and dot characters only.",
      );
      await expect(errorEl).toHaveText(errorMsg3);
    });

    await test.step("Alias illegal case 4", async () => {
      await aliasEl.fill("test-alias#");
      const errorMsg4 = i18next.t(
        "Alias is invalid. Please use lowercase alphanumeric, hyphen, underscore, and dot characters only.",
      );
      await expect(errorEl).toHaveText(errorMsg4);
    });

    await test.step("Alias illegal case 5", async () => {
      await aliasEl.fill(EXIST_PROJECT_NAME);
      const errorMsg5 = i18next.t("Project alias is already taken");
      await expect(errorEl).toHaveText(errorMsg5);
    });

    await test.step("Alias legal case 1", async () => {
      await aliasEl.fill("test-alias-123");
      await expect(errorEl).toBeHidden();
    });

    await test.step("Alias legal case 2", async () => {
      await aliasEl.fill("test_alias_123");
      await expect(errorEl).toBeHidden();
    });

    await test.step("Delete all projects", async () => {
      await deleteProject(page, reearth, NEW_PROJECT_NAME);
      await deleteProject(page, reearth, EXIST_PROJECT_NAME);
    });
  });
});
