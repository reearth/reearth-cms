// e2e/pages/assets.page.ts
import { type Locator } from "@reearth-cms/e2e/fixtures/test";

import { ProjectScopedPage } from "./project-scoped.page";

export class AssetsPage extends ProjectScopedPage {
  // Toolbar / Actions
  get uploadButton(): Locator {
    return this.getByRole("button", { name: "upload Upload Asset" });
  }
  get downloadButton(): Locator {
    return this.getByRole("button", { name: "download Download" });
  }
  get deleteButton(): Locator {
    return this.getByText("Delete");
  }

  // Upload modal
  get urlTab(): Locator {
    return this.getByRole("tab", { name: "URL" });
  }
  get localTab(): Locator {
    return this.getByRole("tab", { name: "Local" });
  }
  get urlInput(): Locator {
    return this.getByPlaceholder("Please input a valid URL");
  }
  get fileInput(): Locator {
    return this.locator(".ant-upload input[type='file']");
  }
  get autoUnzipCheckbox(): Locator {
    return this.getByRole("checkbox", { name: "Auto Unzip" });
  }
  get submitUploadButton(): Locator {
    return this.getByRole("button", { name: "Upload", exact: true });
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

  // Type select on details
  get typeSelectTrigger(): Locator {
    return this.locator("div")
      .filter({ hasText: /^Unknown Type$/ })
      .nth(1);
  }
  typeOption(name: string): Locator {
    return this.getByText(name);
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
