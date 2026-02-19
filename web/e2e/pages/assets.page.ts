// e2e/pages/assets.page.ts
import { type Locator } from "@reearth-cms/e2e/fixtures/test";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";

import { ProjectScopedPage } from "./project-scoped.page";

export class AssetsPage extends ProjectScopedPage {
  // Toolbar / Actions
  get uploadButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.AssetList__UploadButton);
  }
  get downloadButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.AssetList__DownloadButton);
  }
  get deleteButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.AssetList__DeleteButton);
  }

  // Upload modal
  get urlTab(): Locator {
    return this.getByTestId(DATA_TEST_ID.UploadModal__UrlTab);
  }
  get localTab(): Locator {
    return this.getByTestId(DATA_TEST_ID.UploadModal__LocalTab);
  }
  get urlInput(): Locator {
    return this.getByTestId(DATA_TEST_ID.UploadModal__UrlInput);
  }
  get fileInput(): Locator {
    return this.getByTestId(DATA_TEST_ID.UploadModal__LocalTabDragger).locator("input[type='file']");
  }
  get autoUnzipCheckbox(): Locator {
    return this.getByTestId(DATA_TEST_ID.UploadModal__AutoUnzipCheckbox);
  }
  get submitUploadButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.UploadModal__SubmitButton);
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
    return this.getByTestId(DATA_TEST_ID.AssetList__EditIcon);
  }

  // Type select on details
  get typeSelectTrigger(): Locator {
    return this.getByTestId(DATA_TEST_ID.AssetDetail__TypeSelect);
  }
  typeOption(name: string): Locator {
    return this.getByText(name);
  }
  // Preview
  get canvas(): Locator {
    return this.locator("canvas");
  }
  get fullscreenButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.AssetDetail__FullscreenButton);
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
