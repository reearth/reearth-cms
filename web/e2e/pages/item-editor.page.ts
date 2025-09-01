import { expect, Locator } from '@playwright/test';

import { BasePage } from './base.page';

export class ItemEditorPage extends BasePage {
  private get saveButton(): Locator {
    return this.getByRole('button', { name: 'Save' });
  }

  private get publishButton(): Locator {
    return this.getByRole('button', { name: 'Publish' });
  }

  private get unpublishButton(): Locator {
    return this.getByRole('button', { name: 'Unpublish' });
  }

  private get backButton(): Locator {
    return this.getByLabel('Back');
  }

  private get metadataTab(): Locator {
    return this.getByText('Metadata');
  }

  async saveItem(): Promise<void> {
    await this.saveButton.click();
    await this.closeNotification();
  }

  async publishItem(): Promise<void> {
    await this.publishButton.click();
    await this.closeNotification();
  }

  async unpublishItem(): Promise<void> {
    await this.unpublishButton.click();
    await this.closeNotification();
  }

  async goBack(): Promise<void> {
    await this.backButton.click();
  }

  async switchToMetadata(): Promise<void> {
    await this.metadataTab.click();
  }

  // Field input methods
  async fillTextField(fieldName: string, value: string): Promise<void> {
    const field = this.getByLabel(fieldName).or(
      this.locator(`input[placeholder="${fieldName}"]`)
    ).or(
      this.locator(`textarea[placeholder="${fieldName}"]`)
    );
    await field.click();
    await field.fill(value);
  }

  async addMultipleTextValues(values: string[]): Promise<void> {
    for (let i = 0; i < values.length; i++) {
      if (i > 0) {
        await this.getByRole('button', { name: 'plus New' }).click();
      }
      await this.locator('#defaultValue').nth(i).fill(values[i]);
    }
  }

  async reorderMultipleValues(fromIndex: number, direction: 'up' | 'down'): Promise<void> {
    const button = direction === 'up' 
      ? this.getByRole('button', { name: 'arrow-up' })
      : this.getByRole('button', { name: 'arrow-down' });
    await button.nth(fromIndex).click();
  }

  async deleteMultipleValue(index: number): Promise<void> {
    await this.getByRole('button', { name: 'delete' }).nth(index).click();
  }

  async fillTextAreaField(fieldName: string, value: string): Promise<void> {
    const textarea = this.getByLabel(fieldName).or(
      this.locator(`textarea[placeholder="${fieldName}"]`)
    );
    await textarea.fill(value);
  }

  async fillNumberField(fieldName: string, value: string): Promise<void> {
    const field = this.getByLabel(fieldName).or(
      this.locator(`input[placeholder="${fieldName}"]`)
    );
    await field.fill(value);
  }

  async selectOption(fieldName: string, optionValue: string): Promise<void> {
    const selector = this.locator(`[aria-label="${fieldName}"] .ant-select-selector`).or(
      this.locator(`.ant-select-selector`).filter({ hasText: fieldName })
    );
    await selector.click();
    await this.getByText(optionValue, { exact: true }).click();
  }

  async toggleBoolean(fieldName: string, checked = true): Promise<void> {
    const toggle = this.getByLabel(fieldName).or(
      this.locator(`[aria-label="${fieldName}"] .ant-switch`)
    );
    await toggle.setChecked(checked);
  }

  async selectDate(fieldName: string, date: string): Promise<void> {
    const dateInput = this.getByLabel(fieldName).or(
      this.locator(`input[placeholder="${fieldName}"]`)
    );
    await dateInput.fill(date);
  }

  async uploadAsset(fieldName: string, filePath: string): Promise<void> {
    const fileInput = this.locator(`[aria-label="${fieldName}"] input[type="file"]`).or(
      this.locator(`input[type="file"]`).first()
    );
    await fileInput.setInputFiles(filePath);
    await this.closeNotification();
  }

  async selectReference(fieldName: string, referenceText: string): Promise<void> {
    const selector = this.locator(`[aria-label="${fieldName}"] .ant-select-selector`);
    await selector.click();
    await this.getByText(referenceText).click();
  }

  async fillGroupField(groupName: string, fieldName: string, value: string): Promise<void> {
    const groupSection = this.locator(`[data-testid="group-${groupName}"]`).or(
      this.locator('.ant-collapse-item').filter({ hasText: groupName })
    );
    const field = groupSection.locator(`input[placeholder="${fieldName}"]`).or(
      groupSection.getByLabel(fieldName)
    );
    await field.fill(value);
  }

  async expectFieldValue(fieldName: string, expectedValue: string): Promise<void> {
    const field = this.getByLabel(fieldName);
    await expect(field).toHaveValue(expectedValue);
  }

  async expectFieldVisible(fieldName: string): Promise<void> {
    await expect(this.getByLabel(fieldName).or(this.getByText(fieldName))).toBeVisible();
  }

  async expectSaveSuccess(): Promise<void> {
    await expect(this.locator('.ant-notification-notice').filter({ hasText: 'successfully' })).toBeVisible();
  }

  async expectCellValue(value: string): Promise<void> {
    await expect(this.getByRole('cell', { name: value, exact: true })).toBeVisible();
  }

  async expectTooltipContains(text: string): Promise<void> {
    await expect(this.getByRole('tooltip')).toContainText(text);
  }

  async expectMultipleValues(expectedValues: string[]): Promise<void> {
    for (let i = 0; i < expectedValues.length; i++) {
      await expect(this.getByRole('textbox').nth(i)).toHaveValue(expectedValues[i]);
    }
  }

  async clickMultipleValueButton(count: number): Promise<void> {
    await this.getByRole('button', { name: `x${count}` }).click();
  }

  async editCellByIndex(index: number): Promise<void> {
    await this.getByRole('cell').getByLabel('edit').locator('svg').nth(index).click();
  }

  async expectFieldDescription(description: string): Promise<void> {
    await expect(this.getByText(description)).toBeVisible();
    await expect(this.getByRole('main')).toContainText(description);
  }

  async expectBooleanState(fieldName: string, checked: boolean): Promise<void> {
    const expectedState = checked ? 'true' : 'false';
    await expect(this.getByLabel(fieldName).or(this.getByRole('switch'))).toHaveAttribute('aria-checked', expectedState);
  }

  async expectSpinButtonValue(index: number, value: string): Promise<void> {
    await expect(this.getByRole('spinbutton').nth(index)).toHaveValue(value);
  }
}