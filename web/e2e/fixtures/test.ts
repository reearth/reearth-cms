import { test as base, type Page } from "@playwright/test";

import { config, getAccessToken, type Config } from "../config/config";
import { AssetsPage } from "../pages/assets.page";
import { ContentPage } from "../pages/content.page";
import { FieldEditorPage } from "../pages/field-editor.page";
import { IntegrationsPage } from "../pages/integrations.page";
import { LoginPage } from "../pages/login.page";
import { MemberPage } from "../pages/member.page";
import { ProjectSettingsPage } from "../pages/project-settings.page";
import { ProjectPage } from "../pages/project.page";
import { RequestPage } from "../pages/request.page";
import { SchemaPage } from "../pages/schema.page";
import { SettingsPage } from "../pages/settings.page";
import { WorkspacePage } from "../pages/workspace.page";

export type PageObjects = {
  assetsPage: AssetsPage;
  loginPage: LoginPage;
  contentPage: ContentPage;
  fieldEditorPage: FieldEditorPage;
  integrationsPage: IntegrationsPage;
  memberPage: MemberPage;
  projectPage: ProjectPage;
  requestPage: RequestPage;
  schemaPage: SchemaPage;
  settingsPage: SettingsPage;
  workspacePage: WorkspacePage;
  projectSettingsPage: ProjectSettingsPage;
};

export type Reearth = {
  goto: Page["goto"];
  token: string | undefined;
  gql: <T = unknown>(
    query: string,
    variables?: Record<string, unknown>,
    options?: { ignoreError?: boolean },
  ) => Promise<T>;
} & Config;

type Fixtures = { reearth: Reearth } & PageObjects;

export const test = base.extend<Fixtures>({
  reearth: async ({ page, request }, use) => {
    use({
      ...config,
      token: getAccessToken(),
      async goto(url, options) {
        const res = await page.goto(url, options);
        if (this.token) {
          await page.evaluate(`window.REEARTH_E2E_ACCESS_TOKEN = ${JSON.stringify(this.token)};`);
        }
        return res;
      },
      async gql(query, variables, options) {
        if (!this.token) throw new Error("access token is not initialized");

        const resp = await request.post(config.api + "/graphql", {
          data: {
            query,
            variables,
          },
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });

        const body = await resp.json();
        if (!options?.ignoreError && (!resp.ok() || body.errors)) {
          throw new Error(`GraphQL error: ${JSON.stringify(body)}`);
        }

        return body;
      },
    });
  },

  assetsPage: async ({ page }, use) => {
    await use(new AssetsPage(page));
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  contentPage: async ({ page }, use) => {
    await use(new ContentPage(page));
  },

  fieldEditorPage: async ({ page }, use) => {
    await use(new FieldEditorPage(page));
  },

  memberPage: async ({ page }, use) => {
    await use(new MemberPage(page));
  },

  projectPage: async ({ page }, use) => {
    await use(new ProjectPage(page));
  },

  projectSettingsPage: async ({ page }, use) => {
    await use(new ProjectSettingsPage(page));
  },

  requestPage: async ({ page }, use) => {
    await use(new RequestPage(page));
  },

  schemaPage: async ({ page }, use) => {
    await use(new SchemaPage(page));
  },

  settingsPage: async ({ page }, use) => {
    await use(new SettingsPage(page));
  },

  workspacePage: async ({ page }, use) => {
    await use(new WorkspacePage(page));
  },

  integrationsPage: async ({ page }, use) => {
    await use(new IntegrationsPage(page));
  },
});

export { expect, type Page, type Locator } from "@playwright/test";
