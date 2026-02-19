// e2e/pages/request.page.ts
import { type Locator } from "@reearth-cms/e2e/fixtures/test";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";

import { ProjectScopedPage } from "./project-scoped.page";

export class RequestPage extends ProjectScopedPage {
  // Navigation
  public get requestMenuItem(): Locator {
    return this.getByTestId(DATA_TEST_ID.ProjectMenu__RequestItem);
  }

  // Table elements
  public tableBodyTextByText(text: string, exact = false): Locator {
    return this.locator("tbody").getByText(text, { exact });
  }

  // Edit buttons
  public get editButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.RequestTable__EditIcon);
  }
  public override get backButton(): Locator {
    return this.getByLabel("back");
  }
  public get backButtonCapitalized(): Locator {
    return this.getByLabel("Back");
  }

  // Request actions
  public get assignToButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.RequestDetail__AssignToButton);
  }
  public get approveButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.RequestDetail__ApproveButton);
  }
  public get closeButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.RequestDetail__CloseButton);
  }
  public get reopenButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.RequestDetail__ReopenButton);
  }

  // Selection controls
  public get closeCircleButton(): Locator {
    return this.getByLabel("close-circle").locator("svg");
  }
  public get selectOverflow(): Locator {
    return this.getByTestId(DATA_TEST_ID.RequestDetail__ReviewerSelect);
  }
  public get selectItem(): Locator {
    return this.locator(".ant-select-item");
  }
  public get reviewerHeading(): Locator {
    return this.getByTestId(DATA_TEST_ID.RequestDetail__ReviewerSection);
  }

  // Filter controls
  public get stateFilterButton(): Locator {
    return this.getByRole("columnheader", { name: "State filter" }).getByRole("button");
  }
  public waitingMenuItem(): Locator {
    return this.getByRole("menuitem", { name: "WAITING" }).getByLabel("");
  }
  // Status text
  public statusText(status: string): Locator {
    return this.getByText(status, { exact: true });
  }

  // Comments
  public get commentTextbox(): Locator {
    return this.getByRole("textbox");
  }
  public commentTextboxWithText(text: string): Locator {
    return this.getByRole("textbox").filter({ hasText: text });
  }
  public get commentButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.RequestDetail__AddCommentButton);
  }
  public get checkButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.Comment__EditSaveButton);
  }
  public get deleteButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.Comment__DeleteButton);
  }
  public commentsCountButton(count: number | string = 0): Locator {
    return this.getByRole("button", { name: String(count) });
  }

  // Item management
  public get newItemButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.ContentList__NewItemButton);
  }
  public get ellipsisButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.ContentForm__EllipsisButton);
  }
  public get addToRequestButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.ContentForm__AddToRequestItem);
  }
  public get selectCheckbox(): Locator {
    return this.getByLabel("", { exact: true });
  }
  public get closeTextButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.RequestTable__CloseButton);
  }

  // Version history and navigation
  public get versionHistoryTab(): Locator {
    return this.getByTestId(DATA_TEST_ID.ContentForm__VersionHistoryTab);
  }
  public requestTitleLink(title: string): Locator {
    return this.getByRole("link", { name: title });
  }
  public requestPageTitle(title: string): Locator {
    return this.getByText(`Request / ${title}`);
  }
  public requestHeading(title: string): Locator {
    return this.getByRole("heading", { name: title });
  }
  public itemTitleButton(title: string): Locator {
    return this.getByRole("button", { name: title }).last();
  }
  public titleFieldInput(fieldName: string, title: string): Locator {
    return this.getByLabel(`${fieldName}${title}`);
  }
  public modelPathText(modelName: string, itemId: string): Locator {
    return this.getByText(`${modelName} / ${itemId}`);
  }
  public collapsedModelButton(modelName: string, index = 0): Locator {
    return this.getByRole("button", { name: `collapsed ${modelName}` }).nth(index);
  }
  public collapsedModelItemButton(modelName: string, itemId: string): Locator {
    return this.getByRole("button", { name: `collapsed ${modelName} / ${itemId}` });
  }

  public async assignReviewer(reviewerIndex = 0): Promise<void> {
    await this.assignToButton.click();
    await this.closeCircleButton.click();
    await this.selectOverflow.click();
    await this.selectItem.nth(reviewerIndex).click();
    await this.reviewerHeading.click();
  }

  public async approveRequest(): Promise<void> {
    await this.approveButton.click();
    await this.closeNotification();
  }

  public async closeRequest(): Promise<void> {
    await this.closeButton.click();
    await this.closeNotification();
  }

  public async reopenRequest(): Promise<void> {
    await this.reopenButton.click();
    await this.closeNotification();
  }
}
