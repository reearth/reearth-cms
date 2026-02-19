// e2e/pages/request.page.ts
import { type Locator } from "@reearth-cms/e2e/fixtures/test";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";

import { ProjectScopedPage } from "./project-scoped.page";

export class RequestPage extends ProjectScopedPage {
  // Navigation
  get requestMenuItem(): Locator {
    return this.getByTestId(DATA_TEST_ID.ProjectMenu__RequestItem);
  }

  // Table elements
  tableBodyTextByText(text: string, exact = false): Locator {
    return this.locator("tbody").getByText(text, { exact });
  }

  // Edit buttons
  get editButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.RequestTable__EditIcon);
  }
  override get backButton(): Locator {
    return this.getByLabel("back");
  }
  get backButtonCapitalized(): Locator {
    return this.getByLabel("Back");
  }

  // Request actions
  get assignToButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.RequestDetail__AssignToButton);
  }
  get approveButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.RequestDetail__ApproveButton);
  }
  get closeButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.RequestDetail__CloseButton);
  }
  get reopenButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.RequestDetail__ReopenButton);
  }

  // Selection controls
  get closeCircleButton(): Locator {
    return this.getByLabel("close-circle").locator("svg");
  }
  get selectOverflow(): Locator {
    return this.getByTestId(DATA_TEST_ID.RequestDetail__ReviewerSelect);
  }
  get selectItem(): Locator {
    return this.locator(".ant-select-item");
  }
  get reviewerHeading(): Locator {
    return this.getByTestId(DATA_TEST_ID.RequestDetail__ReviewerSection);
  }

  // Filter controls
  get stateFilterButton(): Locator {
    return this.getByRole("columnheader", { name: "State filter" }).getByRole("button");
  }
  waitingMenuItem(): Locator {
    return this.getByRole("menuitem", { name: "WAITING" }).getByLabel("");
  }
  // Status text
  statusText(status: string): Locator {
    return this.getByText(status, { exact: true });
  }

  // Comments
  get commentTextbox(): Locator {
    return this.getByRole("textbox");
  }
  commentTextboxWithText(text: string): Locator {
    return this.getByRole("textbox").filter({ hasText: text });
  }
  get commentButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.RequestDetail__AddCommentButton);
  }
  get checkButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.Comment__EditSaveButton);
  }
  get deleteButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.Comment__DeleteButton);
  }
  commentsCountButton(count: number | string = 0): Locator {
    return this.getByRole("button", { name: String(count) });
  }

  // Item management
  get newItemButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.ContentList__NewItemButton);
  }
  get ellipsisButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.ContentForm__EllipsisButton);
  }
  get addToRequestButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.ContentForm__AddToRequestItem);
  }
  get selectCheckbox(): Locator {
    return this.getByLabel("", { exact: true });
  }
  get closeTextButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.RequestTable__CloseButton);
  }

  // Version history and navigation
  get versionHistoryTab(): Locator {
    return this.getByTestId(DATA_TEST_ID.ContentForm__VersionHistoryTab);
  }
  requestTitleLink(title: string): Locator {
    return this.getByRole("link", { name: title });
  }
  requestPageTitle(title: string): Locator {
    return this.getByText(`Request / ${title}`);
  }
  requestHeading(title: string): Locator {
    return this.getByRole("heading", { name: title });
  }
  itemTitleButton(title: string): Locator {
    return this.getByRole("button", { name: title }).last();
  }
  titleFieldInput(fieldName: string, title: string): Locator {
    return this.getByLabel(`${fieldName}${title}`);
  }
  modelPathText(modelName: string, itemId: string): Locator {
    return this.getByText(`${modelName} / ${itemId}`);
  }
  collapsedModelButton(modelName: string, index = 0): Locator {
    return this.getByRole("button", { name: `collapsed ${modelName}` }).nth(index);
  }
  collapsedModelItemButton(modelName: string, itemId: string): Locator {
    return this.getByRole("button", { name: `collapsed ${modelName} / ${itemId}` });
  }

  async assignReviewer(reviewerIndex = 0): Promise<void> {
    await this.assignToButton.click();
    await this.closeCircleButton.click();
    await this.selectOverflow.click();
    await this.selectItem.nth(reviewerIndex).click();
    await this.reviewerHeading.click();
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
}
