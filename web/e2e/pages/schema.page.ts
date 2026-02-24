// e2e/pages/schema.page.ts
import { type Locator } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";

import { ProjectScopedPage } from "./project-scoped.page";

export class SchemaPage extends ProjectScopedPage {
  // Model actions
  public get plusAddButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.Schema__ModelAddButton);
  }
  public get modelNameInput(): Locator {
    return this.locator("#name");
  }
  public get modelKeyInput(): Locator {
    return this.locator("#key");
  }
  public get modelNameLabel(): Locator {
    return this.getByLabel("Model name");
  }
  public get modelKeyLabel(): Locator {
    return this.getByLabel("Model key");
  }
  public get importSchemaDialog(): Locator {
    return this.getByRole("dialog", { name: "Import Schema" });
  }
  public get importSchemaOuterButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.ModelFieldList__ImportSchemaButton);
  }
  public get importSchemaModalImportButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.ImportSchemaModal__ImportButton);
  }
  public modelMenuItems(): Locator {
    return this.getByRole("main").getByRole("menuitem");
  }

  // Group actions
  public get addGroupButton(): Locator {
    return this.getByRole("button", { name: "Create Group" });
  }
  public get newGroupDialog(): Locator {
    return this.getByLabel("New Group");
  }
  public get groupNameInput(): Locator {
    return this.newGroupDialog.locator("#name");
  }
  public get groupKeyInput(): Locator {
    return this.newGroupDialog.locator("#key");
  }
  public get groupMenuItems(): Locator {
    return this.getByRole("main").getByRole("menu").last().getByRole("menuitem");
  }

  // Field actions
  public fieldTypeButton(type: string): Locator {
    return this.locator("li").filter({ hasText: type }).locator("div").first();
  }
  public get fieldEditButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.Schema__FieldEllipsisButton);
  }
  public get fieldsContainer(): Locator {
    return this.getByLabel("Fields");
  }
  public get draggableItems(): Locator {
    return this.getByTestId(DATA_TEST_ID.Schema__FieldListItem);
  }
  public get grabbableItems(): Locator {
    return this.getByTestId(DATA_TEST_ID.Schema__FieldDragHandle);
  }

  // Group field specific
  public get createGroupFieldButton(): Locator {
    return this.getByText("Create Group Field");
  }
  public get groupSelectTrigger(): Locator {
    return this.getByTestId(DATA_TEST_ID.Schema__GroupSelect);
  }

  // Content sections
  public get fieldsMetaDataText(): Locator {
    return this.getByTestId(DATA_TEST_ID.Schema__FieldsTabs);
  }

  public get metaDataTab(): Locator {
    return this.getByTestId(DATA_TEST_ID.Schema__MetaDataTab);
  }

  // Dynamic methods for model names
  public modelByText(modelName: string): Locator {
    return this.getByText(modelName);
  }

  // Field list item
  public fieldEllipsisIcon(fieldText: string): Locator {
    return this.locator("li")
      .filter({ hasText: fieldText })
      .getByTestId(DATA_TEST_ID.Schema__FieldEllipsisButton);
  }

  // Group field specific methods
  public groupNameByText(groupName: string): Locator {
    return this.getByText(groupName);
  }

  // Dynamic text selection
  public textByExact(text: string): Locator {
    return this.getByText(text, { exact: true });
  }

  public firstTextByExact(text: string): Locator {
    return this.getByText(text, { exact: true }).first();
  }

  public lastTextByExact(text: string): Locator {
    return this.getByText(text, { exact: true }).last();
  }

  // Tag metadata specific
  public get tagListItem(): Locator {
    return this.getByRole("listitem").filter({ hasText: "Tag" });
  }

  // Menu items
  public menuItemByName(itemName: string): Locator {
    return this.getByRole("menuitem", { name: itemName });
  }

  // Text metadata specific
  public get textListItem(): Locator {
    return this.getByRole("listitem").filter({ hasText: "Text" });
  }

  // Boolean metadata specific
  public get booleanListItem(): Locator {
    return this.getByRole("listitem").filter({ hasText: "Boolean" });
  }

  // Checkbox metadata specific
  public get checkBoxListItem(): Locator {
    return this.getByRole("listitem").filter({ hasText: "Check Box" });
  }

  // Navigation elements
  public get schemaText(): Locator {
    return this.getByTestId(DATA_TEST_ID.ProjectMenu__SchemaItem);
  }

  public get contentText(): Locator {
    return this.getByTestId(DATA_TEST_ID.ProjectMenu__ContentItem);
  }

  // Field text display
  public fieldText(fieldName: string, key: string): Locator {
    return this.getByText(`${fieldName}#${key}`);
  }

  // Unique field text display
  public uniqueFieldText(fieldName: string, key: string): Locator {
    return this.getByText(`${fieldName} *#${key}(unique)`);
  }

  // ========== Action Method Locators (private) ==========

  private get moreButton(): Locator {
    return this.getByRole("button", { name: "more" });
  }
  private get editMenuItemText(): Locator {
    return this.getByText("Edit", { exact: true });
  }
  private get deleteMenuItemText(): Locator {
    return this.getByText("Delete", { exact: true });
  }

  // Update Model dialog
  private get updateModelDialog(): Locator {
    return this.getByLabel("Update Model");
  }
  private get updateModelNameInput(): Locator {
    return this.updateModelDialog.locator("#name");
  }
  private get updateModelKeyInput(): Locator {
    return this.updateModelDialog.locator("#key");
  }
  private get deleteModelConfirmButton(): Locator {
    return this.getByRole("button", { name: "Delete Model" });
  }

  // Create Group form
  private get groupAddButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.Schema__GroupAddButton);
  }
  private get groupNameLabel(): Locator {
    return this.getByLabel("Group name");
  }
  private get groupKeyLabel(): Locator {
    return this.getByLabel("Group key");
  }

  // Update Group dialog
  private get updateGroupDialog(): Locator {
    return this.getByLabel("Update Group");
  }
  private get updateGroupNameInput(): Locator {
    return this.updateGroupDialog.locator("#name");
  }
  private get updateGroupKeyInput(): Locator {
    return this.updateGroupDialog.locator("#key");
  }
  private get deleteGroupConfirmButton(): Locator {
    return this.getByRole("button", { name: "Delete Group" });
  }

  // ========== Action Methods (POM Pattern) ==========

  // Model CRUD operations
  public async createModel(name: string, key?: string): Promise<void> {
    await this.fillModelFormAndSubmit(name, key);
  }

  public async createModelFromSidebar(name = `model-${getId()}`, key?: string): Promise<void> {
    await this.plusAddButton.click();
    await this.fillModelFormAndSubmit(name, key);
  }

  public async updateModel(name: string, key: string): Promise<void> {
    await this.moreButton.hover();
    await this.editMenuItemText.click();
    await this.updateModelNameInput.fill(name);
    await this.updateModelKeyInput.fill(key);
    await this.okButton.click();
    await this.closeNotification();
  }

  public async deleteModel(): Promise<void> {
    await this.moreButton.hover();
    await this.deleteMenuItemText.click();
    await this.deleteModelConfirmButton.click();
    await this.closeNotification();
  }

  // Group CRUD operations
  public async createGroup(name: string, key?: string): Promise<void> {
    await this.groupAddButton.click();
    await this.groupNameLabel.fill(name);
    if (key) {
      await this.groupKeyLabel.fill(key);
    }
    await this.okButton.click();
    await this.closeNotification();
  }

  public async updateGroup(name: string, key?: string): Promise<void> {
    await this.moreButton.hover();
    await this.editMenuItemText.click();
    await this.updateGroupNameInput.fill(name);
    if (key) {
      await this.updateGroupKeyInput.fill(key);
    }
    await this.okButton.click();
    await this.closeNotification();
  }

  public async deleteGroup(): Promise<void> {
    await this.moreButton.hover();
    await this.deleteMenuItemText.click();
    await this.deleteGroupConfirmButton.click();
    await this.closeNotification();
  }

  public menuItemSpanByName(name: string): Locator {
    return this.getByRole("menuitem", { name }).locator("span");
  }
}
