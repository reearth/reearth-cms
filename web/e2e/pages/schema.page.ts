// e2e/pages/schema.page.ts
import { type Locator } from "@reearth-cms/e2e/fixtures/test";

import { BasePage } from "./base.page";

export class SchemaPage extends BasePage {
  // Navigation
  get schemaMenuItem(): Locator {
    return this.getByRole("menuitem", { name: "Schema" });
  }

  // Model actions
  get plusAddButton(): Locator {
    return this.getByRole("button", { name: "plus Add" });
  }
  get firstPlusAddButton(): Locator {
    return this.getByRole("button", { name: "plus Add" }).first();
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
    return this.getByRole("img", { name: "ellipsis" }).locator("svg");
  }
  get fieldsContainer(): Locator {
    return this.getByLabel("Fields");
  }
  get draggableItems(): Locator {
    return this.getByLabel("Fields").locator(".draggable-item");
  }
  get grabbableItems(): Locator {
    return this.getByLabel("Fields").locator(".grabbable");
  }

  // Group field specific
  get createGroupFieldButton(): Locator {
    return this.getByText("Create Group Field");
  }
  get groupSelectTrigger(): Locator {
    return this.locator(".ant-select-selector");
  }

  // Common buttons
  get okButton(): Locator {
    return this.getByRole("button", { name: "OK" });
  }

  // Content sections
  get fieldsMetaDataText(): Locator {
    return this.getByText("FieldsMeta Data");
  }

  get metaDataTab(): Locator {
    return this.getByRole("tab", { name: "Meta Data" });
  }

  // Dynamic methods for model names
  modelByText(modelName: string): Locator {
    return this.getByText(modelName);
  }

  // Field list item
  fieldEllipsisIcon(fieldText: string): Locator {
    return this.locator("li").filter({ hasText: fieldText }).locator("svg").nth(3);
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
    return this.locator("span").filter({ hasText: "Schema" });
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

  // Navigation menu items
  get contentMenuItem(): Locator {
    return this.getByRole("menuitem", { name: "Content" });
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
    return this.getByText("Schema");
  }

  get contentText(): Locator {
    return this.getByText("Content");
  }

  // Field text display
  fieldText(fieldName: string, key: string): Locator {
    return this.getByText(`${fieldName}#${key}`);
  }

  // Unique field text display
  uniqueFieldText(fieldName: string, key: string): Locator {
    return this.getByText(`${fieldName} *#${key}(unique)`);
  }
}
