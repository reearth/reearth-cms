import { expect, Locator } from "@playwright/test";

import { BasePage } from "./base.page";

export class FieldEditorPage extends BasePage {
  private get fieldTypeDropdown(): Locator {
    return this.locator(".ant-select-selector").first();
  }

  private get fieldNameInput(): Locator {
    return this.getByLabel("Field Name").or(this.getByLabel("Display Name"));
  }

  private get fieldKeyInput(): Locator {
    return this.getByLabel("Field Key");
  }

  private get saveButton(): Locator {
    return this.getByRole("button", { name: "Save" });
  }

  private get requiredCheckbox(): Locator {
    return this.getByRole("checkbox", { name: "Required" });
  }

  private get uniqueCheckbox(): Locator {
    return this.getByRole("checkbox", { name: "Unique" });
  }

  private get multipleCheckbox(): Locator {
    return this.getByRole("checkbox", { name: "Multiple values" });
  }

  private get deleteButton(): Locator {
    return this.getByRole("button", { name: "Delete" });
  }

  private get confirmDeleteButton(): Locator {
    return this.getByRole("button", { name: "OK" });
  }

  async selectFieldType(fieldType: string): Promise<void> {
    await this.fieldTypeDropdown.click();
    await this.getByText(fieldType, { exact: true }).click();
  }

  async fillFieldBasicInfo(name: string, key?: string): Promise<void> {
    await this.fieldNameInput.fill(name);
    if (key) {
      await this.fieldKeyInput.fill(key);
    }
  }

  async setRequired(required = true): Promise<void> {
    await this.requiredCheckbox.setChecked(required);
  }

  async setUnique(unique = true): Promise<void> {
    await this.uniqueCheckbox.setChecked(unique);
  }

  async setMultiple(multiple = true): Promise<void> {
    await this.multipleCheckbox.setChecked(multiple);
  }

  async saveField(): Promise<void> {
    await this.saveButton.click();
    await this.closeNotification();
  }

  async deleteField(): Promise<void> {
    await this.deleteButton.click();
    await this.confirmDeleteButton.click();
    await this.closeNotification();
  }

  // Field type specific methods
  async setTextFieldMaxLength(maxLength: string): Promise<void> {
    await this.getByLabel("Max Length").fill(maxLength);
  }

  async setNumberFieldRange(min?: string, max?: string): Promise<void> {
    if (min) {
      await this.getByLabel("Min").fill(min);
    }
    if (max) {
      await this.getByLabel("Max").fill(max);
    }
  }

  async addSelectOption(value: string, label: string): Promise<void> {
    await this.getByRole("button", { name: "plus Add" }).click();
    await this.getByLabel("Value").last().fill(value);
    await this.getByLabel("Label").last().fill(label);
  }

  async selectAssetType(assetType: string): Promise<void> {
    await this.locator(".ant-select-selector").click();
    await this.getByText(assetType).click();
  }

  async selectReferenceModel(modelName: string): Promise<void> {
    await this.locator(".ant-select-selector").click();
    await this.getByText(modelName).click();
  }

  // Boolean field specific methods
  async setBooleanFieldValues(trueValue: string, falseValue: string): Promise<void> {
    const trueInput = this.getByLabel("Default value when true");
    const falseInput = this.getByLabel("Default value when false");

    await trueInput.clear();
    await trueInput.fill(trueValue);
    await falseInput.clear();
    await falseInput.fill(falseValue);
  }

  async expectFieldExists(fieldName: string): Promise<void> {
    await expect(this.getByText(fieldName)).toBeVisible();
  }

  async expectFieldNotExists(fieldName: string): Promise<void> {
    await expect(this.getByText(fieldName)).toBeHidden();
  }

  // Field creation workflow methods
  async createField(
    fieldType: string,
    displayName: string,
    key?: string,
    description?: string,
  ): Promise<void> {
    await this.locator("li").filter({ hasText: fieldType }).locator("div").first().click();
    await this.getByLabel("Display name").click();
    await this.getByLabel("Display name").fill(displayName);
    await this.getByLabel("Settings").locator("#key").click();
    await this.getByLabel("Settings")
      .locator("#key")
      .fill(key || displayName);
    if (description) {
      await this.getByLabel("Settings").locator("#description").click();
      await this.getByLabel("Settings").locator("#description").fill(description);
    }
    await this.getByRole("button", { name: "OK" }).click();
    await this.closeNotification();
  }

  async editField(): Promise<void> {
    await this.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  }

  async switchToTab(tabName: string): Promise<void> {
    await this.getByRole("tab", { name: tabName }).click();
  }

  async setFieldSettings(displayName?: string, key?: string, description?: string): Promise<void> {
    if (displayName) {
      await this.getByLabel("Display name").fill(displayName);
    }
    if (key) {
      await this.getByLabel("Field Key").fill(key);
    }
    if (description) {
      await this.getByLabel("Description(optional)").fill(description);
    }
  }

  async setValidationOptions(
    required?: boolean,
    unique?: boolean,
    maxLength?: string,
    minValue?: string,
    maxValue?: string,
  ): Promise<void> {
    await this.switchToTab("Validation");
    if (required !== undefined) {
      await this.getByLabel("Make field required").setChecked(required);
    }
    if (unique !== undefined) {
      await this.getByLabel("Set field as unique").setChecked(unique);
    }
    if (maxLength) {
      await this.getByLabel("Set maximum length").fill(maxLength);
    }
    if (minValue) {
      await this.getByLabel("Set minimum value").fill(minValue);
    }
    if (maxValue) {
      await this.getByLabel("Set maximum value").fill(maxValue);
    }
  }

  async setDefaultValue(value: string): Promise<void> {
    await this.switchToTab("Default value");
    await this.getByLabel("Set default value").click();
    await this.getByLabel("Set default value").fill(value);
  }

  async setMultipleValues(values: string[]): Promise<void> {
    await this.switchToTab("Default value");
    for (let i = 0; i < values.length; i++) {
      if (i > 0) {
        await this.getByRole("button", { name: "plus New" }).click();
      }
      await this.locator("#defaultValue").nth(i).fill(values[i]);
    }
  }

  async reorderDefaultValues(fromIndex: number, direction: "up" | "down"): Promise<void> {
    const button =
      direction === "up"
        ? this.getByRole("button", { name: "arrow-up" })
        : this.getByRole("button", { name: "arrow-down" });
    await button.nth(fromIndex).click();
  }

  async setSupportMultipleValues(enabled: boolean): Promise<void> {
    await this.getByLabel("Support multiple values").setChecked(enabled);
  }

  async setUseAsTitle(enabled: boolean): Promise<void> {
    await this.getByLabel("Use as title").setChecked(enabled);
  }

  async setBooleanDefaultValue(enabled: boolean): Promise<void> {
    await this.switchToTab("Default value");
    await this.getByLabel("Set default value").setChecked(enabled);
  }

  async confirmFieldConfiguration(): Promise<void> {
    await this.getByRole("button", { name: "OK" }).click();
    await this.closeNotification();
  }

  async cancelFieldConfiguration(): Promise<void> {
    await this.getByRole("button", { name: "Cancel" }).click();
  }

  async expectFieldInList(fieldName: string, key?: string, markers?: string[]): Promise<void> {
    let expectedText = key ? `${fieldName}#${key}` : fieldName;
    if (markers?.includes("required")) expectedText += " *";
    if (markers?.includes("unique")) expectedText += "(unique)";

    await expect(this.getByText(expectedText)).toBeVisible();
  }

  async expectValidationError(shouldBeDisabled?: boolean): Promise<void> {
    if (shouldBeDisabled) {
      await expect(this.getByRole("button", { name: "OK" })).toBeDisabled();
    } else {
      await expect(this.getByRole("button", { name: "OK" })).toBeEnabled();
    }
  }

  async expectFieldValue(label: string, expectedValue: string): Promise<void> {
    await expect(this.getByLabel(label)).toHaveValue(expectedValue);
  }

  async expectFieldChecked(label: string, checked: boolean): Promise<void> {
    if (checked) {
      await expect(this.getByLabel(label)).toBeChecked();
    } else {
      await expect(this.getByLabel(label)).not.toBeChecked();
    }
  }

  async expectFieldHidden(label: string): Promise<void> {
    await expect(this.getByLabel(label)).toBeHidden();
  }

  async expectFieldDisabled(label: string): Promise<void> {
    await expect(
      this.locator("label").filter({ hasText: label }).locator("span").nth(1),
    ).toBeDisabled();
  }

  async expectFieldEmpty(label: string): Promise<void> {
    await expect(this.getByLabel(label)).toBeEmpty();
  }

  async createTitleField(titleFieldName: string, defaultValue: string): Promise<void> {
    await this.getByLabel("Display name").fill(titleFieldName);
    await this.getByLabel("Use as title").check();
    await this.getByRole("tab", { name: "Default value" }).click();
    await this.getByLabel("Set default value").fill(defaultValue);
    await this.getByRole("button", { name: "OK" }).click();
    await this.closeNotification();
  }
}
