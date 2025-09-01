import { test as base } from '@reearth-cms/e2e/utils';

import { AssetsPage } from '../pages/assets.page';
import { CommentsPage } from '../pages/comments.page';
import { ContentPage } from '../pages/content.page';
import { FieldEditorPage } from '../pages/field-editor.page';
import { HomePage } from '../pages/home.page';
import { ItemEditorPage } from '../pages/item-editor.page';
import { MetadataEditorPage } from '../pages/metadata-editor.page';
import { ProjectLayoutPage } from '../pages/project-layout.page';
import { ProjectSettingsPage } from '../pages/project-settings.page';
import { RequestPage } from '../pages/request.page';
import { SchemaPage } from '../pages/schema.page';
import { SettingsPage } from '../pages/settings.page';
import { WorkspacePage } from '../pages/workspace.page';

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

export const test = base.extend<PageObjects>({
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

export { expect } from '@playwright/test';