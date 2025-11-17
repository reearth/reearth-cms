// e2e/pages/assets.page.ts
import { type Locator } from "@reearth-cms/e2e/fixtures/test";

import { BasePage } from "./base.page";

export class AssetsPage extends BasePage {
  // Asset management - Main toolbar and actions
  get uploadButton(): Locator {
    return this.getByTestId("asset-upload-button");
  }
  get searchInput(): Locator {
    return this.getByTestId("asset-search-input");
  }
  get downloadButton(): Locator {
    return this.getByTestId("asset-download-button");
  }
  get editPageDownloadButton(): Locator {
    return this.getByTestId("asset-edit-download-button");
  }
  get editPageDownloadButtonIconOnly(): Locator {
    return this.getByTestId("asset-edit-download-button-icon");
  }
  get deleteButton(): Locator {
    return this.getByTestId("asset-delete-button");
  }

  // Upload modal
  get uploadModal(): Locator {
    return this.getByTestId("asset-upload-modal");
  }
  get urlInput(): Locator {
    return this.getByTestId("asset-upload-url-input");
  }
  get autoUnzipCheckbox(): Locator {
    return this.getByTestId("asset-upload-auto-unzip-checkbox");
  }
  get autoUnzipCheckboxURLTab(): Locator {
    return this.getByTestId("asset-upload-auto-unzip-checkbox-url-tab");
  }
  get submitUploadButton(): Locator {
    return this.getByTestId("asset-upload-submit-button");
  }
  get cancelUploadButton(): Locator {
    return this.getByTestId("asset-upload-cancel-button");
  }

  // Legacy locators (kept for backwards compatibility with existing tests)
  get urlTab(): Locator {
    return this.getByRole("tab", { name: "URL" });
  }
  get localTab(): Locator {
    return this.getByRole("tab", { name: "Local" });
  }
  get fileInput(): Locator {
    return this.locator(".ant-upload input[type='file']");
  }
  get searchButton(): Locator {
    return this.getByRole("button", { name: "search" });
  }

  // Grid / Rows
  get assetRows(): Locator {
    return this.locator(".ant-table-tbody .ant-table-row");
  }
  rowByText(text: string | RegExp): Locator {
    return this.assetRows.filter({ hasText: text });
  }
  get selectAssetCheckbox(): Locator {
    // The empty-name checkbox in your current UI
    return this.getByLabel("", { exact: true });
  }

  // Details
  get editIconButton(): Locator {
    return this.getByLabel("edit").locator("svg");
  }
  get backButton(): Locator {
    return this.getByLabel("Back");
  }

  // Type select on details
  get typeSelectTrigger(): Locator {
    return this.locator("div")
      .filter({ hasText: /^Unknown Type$/ })
      .nth(1);
  }
  typeOption(name: string): Locator {
    return this.getByText(name);
  }
  get saveButton(): Locator {
    return this.getByRole("button", { name: "Save" });
  }

  // Preview
  get canvas(): Locator {
    return this.locator("canvas");
  }
  get fullscreenButton(): Locator {
    return this.getByLabel("fullscreen");
  }
  get fullscreenCloseButton(): Locator {
    return this.page.getByRole("button", { name: "close" });
  }
  get imagePreview(): Locator {
    return this.getByRole("img", { name: "asset-preview" });
  }

  // Comments
  get commentButton(): Locator {
    return this.getByLabel("comment");
  }
  commentsCountButton(count: number | string = 0): Locator {
    return this.getByRole("button", { name: String(count) });
  }

  // Notifications
  get lastNotification(): Locator {
    return this.locator(".ant-notification-notice").last();
  }

  // Asset detail page locators
  assetDetailHeading(assetName: string): Locator {
    return this.getByText(`Asset / ${assetName}`);
  }
  get assetTypeText(): Locator {
    return this.getByText("Asset TypePNG/JPEG/TIFF/GIF");
  }

  async uploadViaUrl(url: string, autoUnzip = false): Promise<void> {
    await this.uploadButton.click();
    await this.urlTab.click();
    await this.urlInput.fill(url);
    if (autoUnzip) await this.autoUnzipCheckbox.setChecked(true);
    await this.submitUploadButton.click();
    await this.closeNotification();
  }
}
