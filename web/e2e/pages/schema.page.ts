import { expect, Locator } from "@reearth-cms/e2e/fixtures/test";

import { BasePage } from "./base.page";

export const DEFAULT_MODEL_NAME = "e2e model name";

export class SchemaPage extends BasePage {
  private get newModelButton(): Locator {
    return this.getByRole("button", { name: "plus New Model" });
  }

  private get addModelButton(): Locator {
    return this.getByRole("button", { name: "plus Add" });
  }

  private get modelNameInput(): Locator {
    return this.getByLabel("Model name");
  }

  private get modelKeyInput(): Locator {
    return this.getByLabel("Model key");
  }

  private get okButton(): Locator {
    return this.getByRole("button", { name: "OK" });
  }

  private get moreButton(): Locator {
    return this.getByRole("button", { name: "more" });
  }

  private get editButton(): Locator {
    return this.getByText("Edit", { exact: true });
  }

  private get deleteButton(): Locator {
    return this.getByText("Delete");
  }

  private get deleteModelButton(): Locator {
    return this.getByRole("button", { name: "Delete Model" });
  }

  private get updateModelDialog(): Locator {
    return this.getByLabel("Update Model");
  }

  private get titleElement(): Locator {
    return this.locator(".ant-page-header-heading-title");
  }

  async expectModelsPageTitle(): Promise<void> {
    await expect(this.titleElement).toHaveText("Models");
  }

  async createModelFromOverview(name = DEFAULT_MODEL_NAME, key?: string): Promise<void> {
    await this.expectModelsPageTitle();
    await this.newModelButton.first().click();
    await this.fillModelForm(name, key);
  }

  async createModelFromSidebar(name = DEFAULT_MODEL_NAME, key?: string): Promise<void> {
    await this.addModelButton.first().click();
    await this.fillModelForm(name, key);
  }

  private async fillModelForm(name: string, key?: string): Promise<void> {
    await this.modelNameInput.fill(name);
    if (key) {
      await this.modelKeyInput.fill(key);
    }
    await this.okButton.click();
    await this.closeNotification();
  }

  async updateModel(name = "new e2e model name", key: string): Promise<void> {
    await this.moreButton.hover();
    await this.editButton.click();
    await this.updateModelDialog.locator("#name").fill(name);
    await this.updateModelDialog.locator("#key").fill(key);
    await this.okButton.click();
    await this.closeNotification();
  }

  async deleteModel(): Promise<void> {
    await this.moreButton.hover();
    await this.deleteButton.click();
    await this.deleteModelButton.click();
    await this.closeNotification();
  }

  async dragModel(sourceModelName: string, targetModelName: string): Promise<void> {
    const sourceModel = this.getByRole("menuitem", { name: sourceModelName });
    const targetModel = this.getByRole("menuitem", { name: targetModelName });
    await sourceModel.dragTo(targetModel);
    await this.closeNotification();
  }

  async expectModelInPosition(position: number, modelName: string): Promise<void> {
    await expect(this.getByRole("main").getByRole("menuitem").nth(position)).toContainText(
      modelName,
    );
  }

  async expectModelVisible(modelName: string): Promise<void> {
    await expect(this.getByTitle(modelName, { exact: true })).toBeVisible();
  }

  async expectModelHidden(modelName: string): Promise<void> {
    await expect(this.getByTitle(modelName)).toBeHidden();
  }

  async expectModelKey(modelKey: string): Promise<void> {
    await expect(this.getByText(`#${modelKey}`)).toBeVisible();
  }

  async expectModelInSidebar(modelName: string): Promise<void> {
    await expect(this.getByRole("menuitem", { name: modelName }).locator("span")).toBeVisible();
  }

  // Field operations
  async addTextField(): Promise<void> {
    await this.locator("li").filter({ hasText: "Text" }).locator("div").first().click();
  }

  async addGroupField(): Promise<void> {
    await this.locator("li").filter({ hasText: "Group" }).locator("div").first().click();
  }

  async createGroupFromFieldDialog(): Promise<void> {
    await this.getByRole("button", { name: "Create Group" }).click();
  }

  async fillGroupDialogForm(groupName: string, groupKey: string): Promise<void> {
    await this.getByLabel("New Group").locator("#name").fill(groupName);
    await this.getByLabel("New Group").locator("#key").fill(groupKey);
  }

  async expectCreateGroupOKDisabled(): Promise<void> {
    await expect(this.getByRole("button", { name: "OK" })).toBeDisabled();
  }

  async expectGroupInSidebar(groupName: string): Promise<void> {
    await expect(this.getByRole("menuitem", { name: groupName }).locator("span")).toBeVisible();
  }

  async expectFieldsMetaDataHidden(): Promise<void> {
    await expect(this.getByText("FieldsMeta Data")).toBeHidden();
  }

  async expectReferenceFieldHidden(): Promise<void> {
    await expect(this.locator("li").getByText("Reference", { exact: true })).toBeHidden();
  }

  async expectGroupFieldHidden(): Promise<void> {
    await expect(this.locator("li").getByText("Group", { exact: true })).toBeHidden();
  }

  async clickCreateGroupField(): Promise<void> {
    await this.locator("li").getByText("Group", { exact: true }).click();
  }

  async expectCreateGroupFieldDialog(): Promise<void> {
    await expect(this.getByText("Create Group Field")).toBeVisible();
  }

  async selectGroupInDropdown(groupName: string, groupKey: string): Promise<void> {
    await this.locator(".ant-select-selector").click();
    await expect(this.getByText(`${groupName} #${groupKey}`)).toBeVisible();
  }

  async cancelGroupFieldDialog(): Promise<void> {
    await this.getByRole("button", { name: "Cancel" }).click();
  }

  async clickFieldEdit(): Promise<void> {
    await this.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  }

  async deleteField(): Promise<void> {
    await this.getByLabel("delete").locator("svg").click();
    await this.getByRole("button", { name: "OK" }).click();
    await this.closeNotification();
  }

  async expectFieldHidden(fieldName: string, fieldKey: string): Promise<void> {
    await expect(this.getByText(`${fieldName} #${fieldKey}`)).toBeHidden();
  }

  async expectFieldVisible(fieldName: string, fieldKey: string): Promise<void> {
    await expect(this.getByText(`${fieldName}#${fieldKey}`)).toBeVisible();
  }

  async expectFieldInPosition(
    position: number,
    fieldName: string,
    fieldKey: string,
  ): Promise<void> {
    await expect(this.getByLabel("Fields").locator(".draggable-item").nth(position)).toContainText(
      `${fieldName}#${fieldKey}`,
    );
  }

  async dragField(fromPosition: number, toPosition: number): Promise<void> {
    const sourceField = this.getByLabel("Fields").locator(".grabbable").nth(fromPosition);
    const targetField = this.getByLabel("Fields").locator(".draggable-item").nth(toPosition);
    await sourceField.dragTo(targetField);
    await this.closeNotification();
  }

  async clickModelInSidebar(modelName: string): Promise<void> {
    await this.getByText(modelName).click();
  }

  // Group operations (need to extract from group utils)
  private get groupNameInput(): Locator {
    return this.getByLabel("Group name");
  }

  private get groupKeyInput(): Locator {
    return this.getByLabel("Group key");
  }

  async createGroup(groupName: string, groupKey: string): Promise<void> {
    await this.getByRole("button", { name: "plus Add Group" }).click();
    await this.groupNameInput.fill(groupName);
    await this.groupKeyInput.fill(groupKey);
    await this.okButton.click();
    await this.closeNotification();
  }

  async updateGroup(groupName: string, groupKey: string): Promise<void> {
    await this.moreButton.hover();
    await this.editButton.click();
    await this.groupNameInput.clear();
    await this.groupNameInput.fill(groupName);
    await this.groupKeyInput.clear();
    await this.groupKeyInput.fill(groupKey);
    await this.okButton.click();
    await this.closeNotification();
  }

  async deleteGroup(): Promise<void> {
    await this.moreButton.hover();
    await this.deleteButton.click();
    await this.getByRole("button", { name: "Delete Group" }).click();
    await this.closeNotification();
  }

  async dragGroup(fromPosition: number, toPosition: number): Promise<void> {
    const sourceGroup = this.getByRole("main")
      .getByRole("menu")
      .last()
      .getByRole("menuitem")
      .nth(fromPosition);
    const targetGroup = this.getByRole("main")
      .getByRole("menu")
      .last()
      .getByRole("menuitem")
      .nth(toPosition);
    await sourceGroup.dragTo(targetGroup);
    await this.closeNotification();
  }

  async expectGroupInPosition(position: number, groupName: string): Promise<void> {
    await expect(
      this.getByRole("main").getByRole("menu").last().getByRole("menuitem").nth(position),
    ).toContainText(groupName);
  }
}
