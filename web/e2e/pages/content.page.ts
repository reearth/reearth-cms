import { expect, Locator } from "@reearth-cms/e2e/fixtures/test";

import { BasePage } from "./base.page";

export const DEFAULT_REQUEST_TITLE = "requestTitle";

export class ContentPage extends BasePage {
  private get contentButton(): Locator {
    return this.getByText("Content");
  }

  private get newItemButton(): Locator {
    return this.getByRole("button", { name: "plus New Item" });
  }

  private get saveButton(): Locator {
    return this.getByRole("button", { name: "Save" });
  }

  private get ellipsisButton(): Locator {
    return this.getByRole("button", { name: "ellipsis" });
  }

  private get newRequestMenuItem(): Locator {
    return this.getByRole("menuitem", { name: "New Request" });
  }

  private get titleInput(): Locator {
    return this.getByLabel("Title").last();
  }

  private get descriptionInput(): Locator {
    return this.getByLabel("Description");
  }

  private get selectSelector(): Locator {
    return this.locator(".ant-select-selector");
  }

  private get firstSelectItem(): Locator {
    return this.locator(".ant-select-item").first();
  }

  private get okButton(): Locator {
    return this.getByRole("button", { name: "OK" });
  }

  private get searchInput(): Locator {
    return this.getByPlaceholder("input search text");
  }

  private get searchButton(): Locator {
    return this.getByRole("button", { name: "search" });
  }

  private get publishButton(): Locator {
    return this.getByRole("button", { name: "Publish" });
  }

  private get unpublishButton(): Locator {
    return this.getByRole("button", { name: "Unpublish" });
  }

  private get tableRows(): Locator {
    return this.locator(".ant-table-tbody .ant-table-row");
  }

  async navigateToContent(): Promise<void> {
    await this.contentButton.click();
  }

  async createItem(): Promise<void> {
    await this.navigateToContent();
    await this.newItemButton.click();
    await this.saveButton.click();
    await this.closeNotification();
  }

  async createRequest(title = DEFAULT_REQUEST_TITLE): Promise<void> {
    await this.ellipsisButton.click();
    await this.newRequestMenuItem.click();
    await this.titleInput.fill(title);
    await this.selectSelector.click();
    await this.firstSelectItem.click();
    await this.descriptionInput.click();
    await this.okButton.click();
    await this.closeNotification();
  }

  async searchItems(searchTerm: string): Promise<void> {
    await this.searchInput.fill(searchTerm);
    await this.searchButton.click();
  }

  async clearSearch(): Promise<void> {
    await this.searchInput.fill("");
    await this.searchButton.click();
  }

  async publishItem(): Promise<void> {
    await this.publishButton.click();
    await this.closeNotification();
  }

  async unpublishItem(): Promise<void> {
    await this.unpublishButton.click();
    await this.closeNotification();
  }

  async publishItemFromTable(): Promise<void> {
    await this.getByLabel("", { exact: true }).check();
    await this.publishButton.click();
    await this.closeNotification();
  }

  async unpublishItemFromTable(): Promise<void> {
    await this.getByLabel("", { exact: true }).check();
    await this.unpublishButton.click();
    await this.closeNotification();
  }

  async openItemDetails(itemText: string): Promise<void> {
    await this.getByText(itemText, { exact: true }).click();
  }

  async expectItemVisible(itemText: string): Promise<void> {
    await expect(this.getByText(itemText, { exact: true })).toBeVisible();
  }

  async expectItemHidden(itemText: string): Promise<void> {
    await expect(this.getByText(itemText, { exact: true })).toBeHidden();
  }

  async expectPublishedStatus(): Promise<void> {
    await expect(this.getByText("PUBLISHED")).toBeVisible();
  }

  async expectUnpublishedStatus(): Promise<void> {
    await expect(this.getByText("UNPUBLISHED")).toBeVisible();
  }

  getRowByText(text: string | RegExp): Locator {
    return this.tableRows.filter({ hasText: text });
  }

  async navigateToContentTab(): Promise<void> {
    await this.getByText("Content").click();
  }

  async navigateToSchemaTab(): Promise<void> {
    await this.getByText("Schema").click();
  }

  async createNewItem(): Promise<void> {
    await this.getByRole("button", { name: "plus New Item" }).click();
  }
}
