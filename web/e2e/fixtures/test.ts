import { test as base, type Page } from "@playwright/test";

import { AssetsPage } from "../pages/assets.page";
import { CommentsPage } from "../pages/comments.page";
import { ContentPage } from "../pages/content.page";
import { FieldEditorPage } from "../pages/field-editor.page";
import { HomePage } from "../pages/home.page";
import { ItemEditorPage } from "../pages/item-editor.page";
import { MetadataEditorPage } from "../pages/metadata-editor.page";
import { ProjectLayoutPage } from "../pages/project-layout.page";
import { ProjectSettingsPage } from "../pages/project-settings.page";
import { RequestPage } from "../pages/request.page";
import { SchemaPage } from "../pages/schema.page";
import { SettingsPage } from "../pages/settings.page";
import { WorkspacePage } from "../pages/workspace.page";
import { config, getAccessToken, type Config } from "../utils/config";

export type PageObjects = {
  homePage: HomePage;
  projectLayoutPage: ProjectLayoutPage;
  projectSettingsPage: ProjectSettingsPage;
  assetsPage: AssetsPage;
  workspacePage: WorkspacePage;
  schemaPage: SchemaPage;
  contentPage: ContentPage;
  itemEditorPage: ItemEditorPage;
  fieldEditorPage: FieldEditorPage;
  metadataEditorPage: MetadataEditorPage;
  requestPage: RequestPage;
  settingsPage: SettingsPage;
  commentsPage: CommentsPage;
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

  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  projectLayoutPage: async ({ page }, use) => {
    await use(new ProjectLayoutPage(page));
  },

  projectSettingsPage: async ({ page }, use) => {
    await use(new ProjectSettingsPage(page));
  },

  assetsPage: async ({ page }, use) => {
    await use(new AssetsPage(page));
  },

  workspacePage: async ({ page }, use) => {
    await use(new WorkspacePage(page));
  },

  schemaPage: async ({ page }, use) => {
    await use(new SchemaPage(page));
  },

  contentPage: async ({ page }, use) => {
    await use(new ContentPage(page));
  },

  itemEditorPage: async ({ page }, use) => {
    await use(new ItemEditorPage(page));
  },

  fieldEditorPage: async ({ page }, use) => {
    await use(new FieldEditorPage(page));
  },

  metadataEditorPage: async ({ page }, use) => {
    await use(new MetadataEditorPage(page));
  },

  requestPage: async ({ page }, use) => {
    await use(new RequestPage(page));
  },

  settingsPage: async ({ page }, use) => {
    await use(new SettingsPage(page));
  },

  commentsPage: async ({ page }, use) => {
    await use(new CommentsPage(page));
  },
});

export { expect, type Page, type type Locator } from "@playwright/test";
