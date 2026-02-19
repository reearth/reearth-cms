// e2e/pages/assets.page.ts
import { type Locator } from "@reearth-cms/e2e/fixtures/test";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";

import { ProjectScopedPage } from "./project-scoped.page";

export class AssetsPage extends ProjectScopedPage {
  // Toolbar / Actions
  public get uploadButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.AssetList__UploadButton);
  }
  public get downloadButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.AssetList__DownloadButton);
  }
  public get deleteButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.AssetList__DeleteButton);
  }

  // Upload modal
  public get urlTab(): Locator {
    return this.getByTestId(DATA_TEST_ID.UploadModal__UrlTab);
  }
  public get localTab(): Locator {
    return this.getByTestId(DATA_TEST_ID.UploadModal__LocalTab);
  }
  public get urlInput(): Locator {
    return this.getByTestId(DATA_TEST_ID.UploadModal__UrlInput);
  }
  public get fileInput(): Locator {
    return this.getByTestId(DATA_TEST_ID.UploadModal__LocalTabDragger).locator("input[type='file']");
  }
  public get autoUnzipCheckbox(): Locator {
    return this.getByTestId(DATA_TEST_ID.UploadModal__AutoUnzipCheckbox);
  }
  public get submitUploadButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.UploadModal__SubmitButton);
  }

  // Grid / Rows
  private get assetRows(): Locator {
    return this.locator(".ant-table-tbody .ant-table-row");
  }
  public rowByText(text: string | RegExp): Locator {
    return this.assetRows.filter({ hasText: text });
  }
  public get selectAssetCheckbox(): Locator {
    // The empty-name checkbox in your current UI
    return this.getByLabel("", { exact: true });
  }

  // Details
  public get editIconButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.AssetList__EditIcon);
  }

  // Type select on details
  public get typeSelectTrigger(): Locator {
    return this.getByTestId(DATA_TEST_ID.AssetDetail__TypeSelect);
  }
  public typeOption(name: string): Locator {
    return this.getByText(name);
  }
  // Preview
  public get canvas(): Locator {
    return this.locator("canvas");
  }
  public get fullscreenButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.AssetDetail__FullscreenButton);
  }
  public get fullscreenCloseButton(): Locator {
    return this.page.getByRole("button", { name: "close" });
  }
  public get imagePreview(): Locator {
    return this.getByRole("img", { name: "asset-preview" });
  }

  // Comments
  public get commentButton(): Locator {
    return this.getByLabel("comment");
  }
  public commentsCountButton(count: number | string = 0): Locator {
    return this.getByRole("button", { name: String(count) });
  }

  // Notifications
  public get lastNotification(): Locator {
    return this.locator(".ant-notification-notice").last();
  }

  // Asset detail page locators
  public assetDetailHeading(assetName: string): Locator {
    return this.getByText(`Asset / ${assetName}`);
  }
  public get assetTypeText(): Locator {
    return this.getByText("Asset TypePNG/JPEG/TIFF/GIF");
  }

  public async uploadViaUrl(url: string, autoUnzip = false): Promise<void> {
    await this.uploadButton.click();
    await this.urlTab.click();
    await this.urlInput.fill(url);
    if (autoUnzip) await this.autoUnzipCheckbox.setChecked(true);
    await this.submitUploadButton.click();
    await this.closeNotification();
  }
}
