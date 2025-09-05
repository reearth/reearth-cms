import { expect } from "@reearth-cms/e2e/fixtures/test";

import { BasePage } from "./base.page";

export class MetadataEditorPage extends BasePage {
  async createMetadataField(
    fieldType: string,
    displayName: string,
    key?: string,
    description?: string,
  ): Promise<void> {
    await this.getByRole("tab", { name: "Meta Data" }).click();
    await this.getByRole("listitem").filter({ hasText: fieldType }).click();
    await this.getByLabel("Display name").fill(displayName);
    await this.getByLabel("Field Key").fill(key || displayName);
    if (description) {
      await this.getByLabel("Description").fill(description);
    }
    await this.getByRole("button", { name: "OK" }).click();
    await this.closeNotification();
  }

  async editMetadataField(): Promise<void> {
    await this.getByRole("button", { name: "ellipsis" }).click();
  }

  async switchToTab(tabName: string): Promise<void> {
    await this.getByRole("tab", { name: tabName }).click();
  }

  async setMetadataSettings(
    displayName?: string,
    key?: string,
    description?: string,
  ): Promise<void> {
    if (displayName) {
      await this.getByLabel("Display name").fill(displayName);
    }
    if (key) {
      await this.getByLabel("Field Key").fill(key);
    }
    if (description) {
      await this.getByLabel("Description").fill(description);
    }
  }

  async setValidationOptions(
    required?: boolean,
    unique?: boolean,
    maxLength?: string,
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
  }

  async setDefaultValue(value: string): Promise<void> {
    await this.switchToTab("Default value");
    await this.getByLabel("Set default value").fill(value);
  }

  async setSupportMultipleValues(enabled: boolean): Promise<void> {
    await this.getByLabel("Support multiple values").setChecked(enabled);
  }

  async setMultipleValues(values: string[]): Promise<void> {
    await this.switchToTab("Default value");
    for (let i = 0; i < values.length; i++) {
      if (i > 0) {
        await this.getByRole("button", { name: "plus New" }).click();
      }
      await this.getByRole("textbox").nth(i).fill(values[i]);
    }
  }

  async confirmMetadataConfiguration(): Promise<void> {
    await this.getByRole("button", { name: "OK" }).click();
    await this.closeNotification();
  }

  async cancelMetadataConfiguration(): Promise<void> {
    await this.getByRole("button", { name: "Cancel" }).click();
  }

  async expectMetadataFieldInList(
    fieldName: string,
    key?: string,
    markers?: string[],
  ): Promise<void> {
    let expectedText = key ? `${fieldName}#${key}` : fieldName;
    if (markers?.includes("required")) expectedText += " *";
    if (markers?.includes("unique")) expectedText += "(unique)";

    await expect(this.getByText(expectedText)).toBeVisible();
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

  async expectFieldEmpty(label: string): Promise<void> {
    await expect(this.getByLabel(label)).toBeEmpty();
  }

  async expectValidationError(shouldBeDisabled?: boolean): Promise<void> {
    if (shouldBeDisabled) {
      await expect(this.getByRole("button", { name: "OK" })).toBeDisabled();
    } else {
      await expect(this.getByRole("button", { name: "OK" })).toBeEnabled();
    }
  }
}
