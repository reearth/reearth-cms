import { expect, Locator, Page } from '@playwright/test';

import { BasePage } from './base.page';

export class RequestPage extends BasePage {
  constructor(public page: Page) {
    super(page);
  }
  private get requestTab(): Locator {
    return this.getByText("Request", { exact: true });
  }

  private get searchInput(): Locator {
    return this.getByPlaceholder("input search text");
  }

  private get searchButton(): Locator {
    return this.getByRole("button", { name: "search" });
  }

  private get stateFilterButton(): Locator {
    return this.getByRole("columnheader", { name: "State filter" }).getByRole("button");
  }

  private get assignToButton(): Locator {
    return this.getByRole("button", { name: "Assign to" });
  }

  private get approveButton(): Locator {
    return this.getByRole("button", { name: "Approve" });
  }

  private get closeButton(): Locator {
    return this.getByRole("button", { name: "Close" });
  }

  private get reopenButton(): Locator {
    return this.getByRole("button", { name: "Reopen" });
  }

  private get commentTextbox(): Locator {
    return this.getByRole("textbox");
  }

  private get commentButton(): Locator {
    return this.getByRole("button", { name: "Comment" });
  }

  private get backButton(): Locator {
    return this.getByLabel("back");
  }

  async navigateToRequests(): Promise<void> {
    await this.requestTab.click();
  }

  async searchRequests(searchTerm: string): Promise<void> {
    await this.searchInput.fill(searchTerm);
    await this.searchButton.click();
  }

  async clearSearch(): Promise<void> {
    await this.searchInput.fill("");
    await this.searchButton.click();
  }

  async editRequest(): Promise<void> {
    await this.getByLabel("edit").locator("svg").click();
  }

  async assignReviewer(): Promise<void> {
    await this.assignToButton.click();
    await this.getByLabel("close-circle").locator("svg").click();
    await this.locator(".ant-select-selection-overflow").click();
    await this.locator(".ant-select-item").click();
    await this.getByRole("heading", { name: "Reviewer" }).click();
  }

  async approveRequest(): Promise<void> {
    await this.approveButton.click();
    await this.closeNotification();
  }

  async closeRequest(): Promise<void> {
    await this.closeButton.click();
    await this.closeNotification();
  }

  async reopenRequest(): Promise<void> {
    await this.reopenButton.click();
    await this.closeNotification();
  }

  async goBack(): Promise<void> {
    await this.backButton.click();
  }

  async filterByState(stateName: string, include: boolean = true): Promise<void> {
    await this.stateFilterButton.click();
    const stateMenuItem = this.getByRole("menuitem", { name: stateName });
    if (include) {
      await stateMenuItem.getByLabel("").check();
    } else {
      await stateMenuItem.getByLabel("").uncheck();
    }
    await this.getByRole("button", { name: "OK" }).click();
  }

  async addComment(commentText: string): Promise<void> {
    await this.commentTextbox.fill(commentText);
    await this.commentButton.click();
    await this.closeNotification();
  }

  async editComment(newCommentText: string): Promise<void> {
    await this.getByLabel("edit").locator("svg").click();
    const commentTextbox = this.commentTextbox.filter({ hasText: /.+/ });
    await commentTextbox.fill(newCommentText);
    await this.getByRole("button", { name: "check" }).click();
    await this.closeNotification();
  }

  async deleteComment(): Promise<void> {
    await this.getByRole("button", { name: "delete" }).click();
    await this.closeNotification();
  }

  async clickCommentsButton(): Promise<void> {
    await this.getByRole("button", { name: "0" }).click();
  }

  async selectRequestItem(): Promise<void> {
    await this.getByLabel("", { exact: true }).check();
  }

  async bulkCloseRequests(): Promise<void> {
    await this.getByText("Close").click();
    await this.closeNotification();
  }

  async expectRequestVisible(requestTitle: string): Promise<void> {
    await expect(this.locator("tbody").getByText(requestTitle, { exact: true })).toBeVisible();
  }

  async expectRequestHidden(requestTitle: string): Promise<void> {
    await expect(this.locator("tbody").getByText(requestTitle, { exact: true })).toBeHidden();
  }

  async expectRequestState(state: string): Promise<void> {
    await expect(this.locator("tbody").getByText(state)).toBeVisible();
  }

  async expectRequestStateHidden(state: string): Promise<void> {
    await expect(this.locator("tbody").getByText(state)).toBeHidden();
  }

  async expectCommentVisible(comment: string): Promise<void> {
    await expect(this.getByText(comment, { exact: true })).toBeVisible();
  }

  async expectCommentHidden(comment: string): Promise<void> {
    await expect(this.getByText(comment)).toBeHidden();
  }

  async expectRequestTitle(title: string): Promise<void> {
    await expect(this.getByText(`Request / ${title}`)).toBeVisible();
    await expect(this.getByRole("heading", { name: title })).toBeVisible();
  }

  async expectItemButtonsVisible(modelName: string, count: number): Promise<void> {
    for (let i = 0; i < count; i++) {
      await expect(this.getByRole("button", { name: `collapsed ${modelName}` }).nth(i)).toBeVisible();
    }
  }

  async expectStateText(state: string): Promise<void> {
    await expect(this.getByText(state, { exact: true })).toBeVisible();
  }
}