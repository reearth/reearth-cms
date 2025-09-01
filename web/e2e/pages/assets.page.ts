import { expect, Locator } from '@playwright/test';

import { BasePage } from './base.page';

export class AssetsPage extends BasePage {
  private get uploadButton(): Locator {
    return this.getByRole('button', { name: 'upload Upload Asset' });
  }

  private get searchInput(): Locator {
    return this.getByPlaceholder('input search text');
  }

  private get searchButton(): Locator {
    return this.getByRole('button', { name: 'search' });
  }

  private get urlInput(): Locator {
    return this.getByPlaceholder('Please input a valid URL');
  }

  private get fileInput(): Locator {
    return this.locator(".ant-upload input[type='file']");
  }

  private get submitUploadButton(): Locator {
    return this.getByRole('button', { name: 'Upload', exact: true });
  }

  private get autoUnzipCheckbox(): Locator {
    return this.getByRole('checkbox', { name: 'Auto Unzip' });
  }

  private get assetRows(): Locator {
    return this.locator('.ant-table-tbody .ant-table-row');
  }

  async openUploadDialog(): Promise<void> {
    await this.uploadButton.click();
  }

  async selectTab(tabName: 'URL' | 'Local'): Promise<void> {
    await this.getByRole('tab', { name: tabName }).click();
  }

  async uploadFromUrl(url: string, autoUnzip = false): Promise<void> {
    await this.openUploadDialog();
    await this.selectTab('URL');
    await this.urlInput.fill(url);
    
    if (autoUnzip) {
      await this.toggleAutoUnzip(true);
    }
    
    await this.submitUploadButton.click();
    await this.closeNotification();
  }

  async uploadFromFile(filePath: string, autoUnzip = false): Promise<void> {
    await this.openUploadDialog();
    await this.selectTab('Local');
    await this.fileInput.setInputFiles(filePath);
    
    if (autoUnzip) {
      await this.toggleAutoUnzip(true);
    }
    
    await this.submitUploadButton.click();
  }

  async toggleAutoUnzip(checked = true): Promise<void> {
    await this.autoUnzipCheckbox.setChecked(checked);
    await expect(this.autoUnzipCheckbox).toBeChecked();
  }

  async searchAssets(searchTerm: string): Promise<void> {
    await this.searchInput.fill(searchTerm);
    await this.searchButton.click();
  }

  async clearSearch(): Promise<void> {
    await this.searchInput.fill('');
    await this.searchButton.click();
  }

  async openAssetDetails(assetName: string): Promise<void> {
    await this.getByLabel('edit').locator('svg').click();
  }

  async expectAssetVisible(assetName: string): Promise<void> {
    await expect(this.getByText(assetName)).toBeVisible();
  }

  async expectAssetHidden(assetName: string): Promise<void> {
    await expect(this.getByText(assetName)).toBeHidden();
  }

  async expectToast(text: string | RegExp): Promise<void> {
    const toast = this.locator('.ant-notification-notice').last();
    await expect(toast).toBeVisible();
    await expect(toast).toContainText(text);
  }

  async countRows(): Promise<number> {
    return this.assetRows.count();
  }

  getRowByText(text: string | RegExp): Locator {
    return this.assetRows.filter({ hasText: text });
  }

  async expectRowCountGreaterThan(previousCount: number): Promise<void> {
    const currentCount = await this.countRows();
    expect(currentCount).toBeGreaterThan(previousCount);
  }

  async goBack(): Promise<void> {
    await this.getByLabel('Back').click();
  }

  async selectAsset(assetName: string): Promise<void> {
    await this.getByLabel('', { exact: true }).check();
  }

  async deleteSelectedAssets(): Promise<void> {
    await this.getByText('Delete').click();
    await this.closeNotification();
  }

  async changeAssetType(assetType: string): Promise<void> {
    await this.locator('div').filter({ hasText: /^Unknown Type$/ }).nth(1).click();
    await this.getByText(assetType).click();
    await this.getByRole('button', { name: 'Save' }).click();
    await this.closeNotification();
  }

  getCanvas(): Locator {
    return this.locator('canvas');
  }

  async expectCanvasNotFullscreen(width: string): Promise<void> {
    const canvas = this.getCanvas();
    await expect(canvas).not.toHaveAttribute('width', width);
  }

  async expectCanvasFullscreen(width: string, height: string): Promise<void> {
    const canvas = this.getCanvas();
    await expect(canvas).toHaveAttribute('width', width);
    await expect(canvas).toHaveAttribute('height', height);
  }

  async openFullscreenPreview(): Promise<void> {
    await this.getByLabel('fullscreen').click();
  }

  async closeFullscreenPreview(): Promise<void> {
    await this.page.keyboard.press('Escape');
  }

  async downloadSelectedAssets(): Promise<any> {
    const downloadPromise = this.page.waitForEvent('download');
    await this.getByRole('button', { name: 'download Download' }).click();
    const download = await downloadPromise;
    await this.closeNotification();
    return download;
  }

  async downloadAssetFromDetails(): Promise<any> {
    const downloadPromise = this.page.waitForEvent('download');
    await this.getByRole('button', { name: 'download Download' }).click();
    const download = await downloadPromise;
    await this.closeNotification();
    return download;
  }

  async openCommentPanel(): Promise<void> {
    await this.getByLabel('comment').click();
  }

  async clickCommentsCount(): Promise<void> {
    await this.getByRole('button', { name: '0' }).click();
  }

  async expectAssetType(assetType: string): Promise<void> {
    await expect(this.getByText(`Asset Type${assetType}`)).toBeVisible();
  }
}