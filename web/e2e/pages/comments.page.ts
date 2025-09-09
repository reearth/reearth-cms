import { expect, type Locator } from "@reearth-cms/e2e/fixtures/test";

import { BasePage } from "./base.page";

export class CommentsPage extends BasePage {
  get commentInput(): Locator {
    return this.getByLabel("Comment").or(this.locator('textarea[placeholder*="comment"]'));
  }

  get submitCommentButton(): Locator {
    return this.getByRole("button", { name: "Submit" }).or(
      this.getByRole("button", { name: "Add Comment" }),
    );
  }

  get editButton(): Locator {
    return this.getByRole("button", { name: "edit" });
  }

  get deleteButton(): Locator {
    return this.getByRole("button", { name: "delete" });
  }

  get updateButton(): Locator {
    return this.getByRole("button", { name: "Update" });
  }

  get confirmDeleteButton(): Locator {
    return this.getByRole("button", { name: "OK" });
  }

  get commentsList(): Locator {
    return this.locator(".ant-comment").or(this.locator('[data-testid*="comment"]'));
  }

  async addComment(commentText: string): Promise<void> {
    await this.commentInput.fill(commentText);
    await this.submitCommentButton.click();
    await this.closeNotification();
  }

  async editComment(newText: string): Promise<void> {
    await this.editButton.first().click();
    await this.commentInput.clear();
    await this.commentInput.fill(newText);
    await this.updateButton.click();
    await this.closeNotification();
  }

  async deleteComment(): Promise<void> {
    await this.deleteButton.first().click();
    await this.confirmDeleteButton.click();
    await this.closeNotification();
  }

  async expectCommentVisible(commentText: string): Promise<void> {
    await expect(this.getByText(commentText)).toBeVisible();
  }

  async expectCommentHidden(commentText: string): Promise<void> {
    await expect(this.getByText(commentText)).toBeHidden();
  }

  async expectCommentCount(count: number): Promise<void> {
    await expect(this.commentsList).toHaveCount(count);
  }
}
