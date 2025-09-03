import { Locator } from "@reearth-cms/e2e/fixtures/test";

import { BasePage } from "./base.page";

export const DEFAULT_MODEL_NAME = "e2e model name";

export class SchemaPage extends BasePage {
  get pageTitle(): Locator {
    return this.locator(".ant-page-header-heading-title");
  }

  get mainMenu(): Locator {
    return this.getByRole("main").getByRole("menu").first();
  }
  get lastMenu(): Locator {
    return this.getByRole("main").getByRole("menu").last();
  }

  get newModelButton(): Locator {
    return this.getByRole("button", { name: "plus New Model" });
  }

  get addModelButton(): Locator {
    return this.getByRole("button", { name: "plus Add" });
  }

  get modelNameInput(): Locator {
    return this.getByLabel("Model name");
  }

  get modelKeyInput(): Locator {
    return this.getByLabel("Model key");
  }

  get okButton(): Locator {
    return this.getByRole("button", { name: "OK" });
  }

  get cancelButton(): Locator {
    return this.getByRole("button", { name: "Cancel" });
  }

  get moreButton(): Locator {
    return this.getByRole("button", { name: "more" });
  }

  get editMenuItem(): Locator {
    return this.getByText("Edit", { exact: true });
  }
  get deleteMenuItem(): Locator {
    return this.getByText("Delete");
  }

  get deleteModelConfirmButton(): Locator {
    return this.getByRole("button", { name: "Delete Model" });
  }

  get updateModelDialog(): Locator {
    return this.getByLabel("Update Model");
  }

  get titleArea(): Locator {
    return this.getByTitle(/.*/);
  }

  get keyBadgeArea(): Locator {
    return this.getByText(/#.+/);
  }

  get paletteListItems(): Locator {
    return this.locator("li");
  }

  get fieldsContainer(): Locator {
    return this.getByLabel("Fields");
  }

  get fieldRowEllipsis(): Locator {
    return this.getByRole("img", { name: "ellipsis" }).locator("svg");
  }
  get fieldDeleteIcon(): Locator {
    return this.getByLabel("delete").locator("svg");
  }

  get createGroupFromFieldButton(): Locator {
    return this.getByRole("button", { name: "Create Group" });
  }
  get newGroupDialog(): Locator {
    return this.getByLabel("New Group");
  }

  get createGroupFieldDialogTitle(): Locator {
    return this.getByText("Create Group Field");
  }
  get groupSelectTrigger(): Locator {
    return this.locator(".ant-select-selector");
  }

  get addGroupButton(): Locator {
    return this.getByRole("button", { name: "plus Add Group" });
  }

  get groupNameInput(): Locator {
    return this.getByLabel("Group name");
  }

  get groupKeyInput(): Locator {
    return this.getByLabel("Group key");
  }

  get deleteGroupConfirmButton(): Locator {
    return this.getByRole("button", { name: "Delete Group" });
  }

  get fieldsMetaDataText(): Locator {
    return this.getByText("FieldsMeta Data");
  }
}
