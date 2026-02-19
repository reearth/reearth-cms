// e2e/pages/schema.page.ts
import { type Locator } from "@reearth-cms/e2e/fixtures/test";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";

import { ProjectScopedPage } from "./project-scoped.page";

export class SchemaPage extends ProjectScopedPage {
  // Model actions
  get plusAddButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.Schema__ModelAddButton);
  }
  get firstPlusAddButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.Schema__ModelAddButton);
  }
  get modelNameInput(): Locator {
    return this.locator("#name");
  }
  get modelKeyInput(): Locator {
    return this.locator("#key");
  }
  get modelNameLabel(): Locator {
    return this.getByLabel("Model name");
  }
  get modelKeyLabel(): Locator {
    return this.getByLabel("Model key");
  }
  get importSchemaDialog(): Locator {
    return this.getByRole("dialog", { name: "Import Schema" });
  }
  get importSchemaOuterButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.ModelFieldList__ImportSchemaButton);
  }
  get importSchemaModalImportButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.ImportSchemaModal__ImportButton);
  }
  modelMenuItem(name: string): Locator {
    return this.getByRole("menuitem", { name });
  }
  modelMenuItems(): Locator {
    return this.getByRole("main").getByRole("menuitem");
  }

  // Group actions
  get addGroupButton(): Locator {
    return this.getByRole("button", { name: "Create Group" });
  }
  get newGroupDialog(): Locator {
    return this.getByLabel("New Group");
  }
  get groupNameInput(): Locator {
    return this.getByLabel("New Group").locator("#name");
  }
  get groupKeyInput(): Locator {
    return this.getByLabel("New Group").locator("#key");
  }
  groupMenuItem(name: string): Locator {
    return this.getByRole("menuitem", { name });
  }
  get groupMenuItems(): Locator {
    return this.getByRole("main").getByRole("menu").last().getByRole("menuitem");
  }

  // Field actions
  fieldTypeButton(type: string): Locator {
    return this.locator("li").filter({ hasText: type }).locator("div").first();
  }
  get fieldEditButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.Schema__FieldEllipsisButton);
  }
  get fieldsContainer(): Locator {
    return this.getByLabel("Fields");
  }
  get draggableItems(): Locator {
    return this.getByTestId(DATA_TEST_ID.Schema__FieldListItem);
  }
  get grabbableItems(): Locator {
    return this.getByTestId(DATA_TEST_ID.Schema__FieldDragHandle);
  }

  // Group field specific
  get createGroupFieldButton(): Locator {
    return this.getByText("Create Group Field");
  }
  get groupSelectTrigger(): Locator {
    return this.getByTestId(DATA_TEST_ID.Schema__GroupSelect);
  }

  // Content sections
  get fieldsMetaDataText(): Locator {
    return this.getByTestId(DATA_TEST_ID.Schema__FieldsTabs);
  }

  get metaDataTab(): Locator {
    return this.getByTestId(DATA_TEST_ID.Schema__MetaDataTab);
  }

  // Dynamic methods for model names
  modelByText(modelName: string): Locator {
    return this.getByText(modelName);
  }

  // Field list item
  fieldEllipsisIcon(fieldText: string): Locator {
    return this.locator("li").filter({ hasText: fieldText }).getByTestId(DATA_TEST_ID.Schema__FieldEllipsisButton);
  }

  // Group field specific methods
  groupNameByText(groupName: string): Locator {
    return this.getByText(groupName);
  }

  // Dynamic text selection
  textByExact(text: string): Locator {
    return this.getByText(text, { exact: true });
  }

  firstTextByExact(text: string): Locator {
    return this.getByText(text, { exact: true }).first();
  }

  lastTextByExact(text: string): Locator {
    return this.getByText(text, { exact: true }).last();
  }

  // Schema tab for filtered navigation
  get schemaSpanText(): Locator {
    return this.getByTestId(DATA_TEST_ID.ProjectMenu__SchemaItem);
  }

  // Tag metadata specific
  get tagListItem(): Locator {
    return this.getByRole("listitem").filter({ hasText: "Tag" });
  }

  // Menu items
  menuItemByName(itemName: string): Locator {
    return this.getByRole("menuitem", { name: itemName });
  }

  // Text metadata specific
  get textListItem(): Locator {
    return this.getByRole("listitem").filter({ hasText: "Text" });
  }

  // Boolean metadata specific
  get booleanListItem(): Locator {
    return this.getByRole("listitem").filter({ hasText: "Boolean" });
  }

  // Checkbox metadata specific
  get checkBoxListItem(): Locator {
    return this.getByRole("listitem").filter({ hasText: "Check Box" });
  }

  // Navigation elements
  get schemaText(): Locator {
    return this.getByTestId(DATA_TEST_ID.ProjectMenu__SchemaItem);
  }

  get contentText(): Locator {
    return this.getByTestId(DATA_TEST_ID.ProjectMenu__ContentItem);
  }

  // Field text display
  fieldText(fieldName: string, key: string): Locator {
    return this.getByText(`${fieldName}#${key}`);
  }

  // Unique field text display
  uniqueFieldText(fieldName: string, key: string): Locator {
    return this.getByText(`${fieldName} *#${key}(unique)`);
  }

  // ========== Action Methods (POM Pattern) ==========

  // Model CRUD operations
  async createModel(name: string, key?: string): Promise<void> {
    await this.getByLabel("Model name").fill(name);
    if (key) {
      await this.getByLabel("Model key").fill(key);
    }
    await this.getByRole("button", { name: "OK" }).click();
    await this.closeNotification();
  }

  async createModelFromSidebar(name = "e2e model name", key?: string): Promise<void> {
    await this.getByTestId(DATA_TEST_ID.Schema__ModelAddButton).click();
    await this.createModel(name, key);
  }

  async updateModel(name: string, key: string): Promise<void> {
    await this.getByRole("button", { name: "more" }).hover();
    await this.getByText("Edit", { exact: true }).click();
    await this.getByLabel("Update Model").locator("#name").fill(name);
    await this.getByLabel("Update Model").locator("#key").fill(key);
    await this.getByRole("button", { name: "OK" }).click();
    await this.closeNotification();
  }

  async deleteModel(): Promise<void> {
    await this.getByRole("button", { name: "more" }).hover();
    await this.getByText("Delete", { exact: true }).click();
    await this.getByRole("button", { name: "Delete Model" }).click();
    await this.closeNotification();
  }

  // Group CRUD operations
  async createGroup(name: string, key?: string): Promise<void> {
    await this.getByTestId(DATA_TEST_ID.Schema__GroupAddButton).click();
    await this.getByLabel("Group name").fill(name);
    if (key) {
      await this.getByLabel("Group key").fill(key);
    }
    await this.getByRole("button", { name: "OK" }).click();
    await this.closeNotification();
  }

  async updateGroup(name: string, key?: string): Promise<void> {
    await this.getByRole("button", { name: "more" }).hover();
    await this.getByText("Edit", { exact: true }).click();
    await this.getByLabel("Update Group").locator("#name").fill(name);
    if (key) {
      await this.getByLabel("Update Group").locator("#key").fill(key);
    }
    await this.getByRole("button", { name: "OK" }).click();
    await this.closeNotification();
  }

  async deleteGroup(): Promise<void> {
    await this.getByRole("button", { name: "more" }).hover();
    await this.getByText("Delete", { exact: true }).click();
    await this.getByRole("button", { name: "Delete Group" }).click();
    await this.closeNotification();
  }

  modelMenuItemSpan(name: string): Locator {
    return this.getByRole("menuitem", { name }).locator("span");
  }

  groupMenuItemSpan(name: string): Locator {
    return this.getByRole("menuitem", { name }).locator("span");
  }
}
