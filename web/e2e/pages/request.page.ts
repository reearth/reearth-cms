// e2e/pages/request.page.ts
import { type Locator } from "@reearth-cms/e2e/fixtures/test";

import { BasePage } from "./base.page";

export class RequestPage extends BasePage {
  // Navigation
  get requestMenuItem(): Locator {
    return this.getByText("Request", { exact: true });
  }

  // Request management
  get searchInput(): Locator {
    return this.getByPlaceholder("input search text");
  }
  get searchButton(): Locator {
    return this.getByRole("button", { name: "search" });
  }

  // Table elements
  get tableBody(): Locator {
    return this.locator("tbody");
  }
  get tableRows(): Locator {
    return this.locator(".ant-table-tbody .ant-table-row");
  }
  cellByText(text: string, exact = false): Locator {
    return this.getByRole("cell", { name: text, exact });
  }
  tableBodyTextByText(text: string, exact = false): Locator {
    return this.locator("tbody").getByText(text, { exact });
  }

  // Edit buttons
  get editButton(): Locator {
    return this.getByLabel("edit").locator("svg");
  }
  get backButton(): Locator {
    return this.getByLabel("back");
  }
  get backButtonCapitalized(): Locator {
    return this.getByLabel("Back");
  }

  // Request actions
  get assignToButton(): Locator {
    return this.getByRole("button", { name: "Assign to" });
  }
  get approveButton(): Locator {
    return this.getByRole("button", { name: "Approve" });
  }
  get closeButton(): Locator {
    return this.getByRole("button", { name: "Close" });
  }
  get reopenButton(): Locator {
    return this.getByRole("button", { name: "Reopen" });
  }

  // Selection controls
  get closeCircleButton(): Locator {
    return this.getByLabel("close-circle").locator("svg");
  }
  get selectOverflow(): Locator {
    return this.locator(".ant-select-selection-overflow");
  }
  get selectItem(): Locator {
    return this.locator(".ant-select-item");
  }
  get reviewerHeading(): Locator {
    return this.getByRole("heading", { name: "Reviewer" });
  }

  // Filter controls
  get stateFilterButton(): Locator {
    return this.getByRole("columnheader", { name: "State filter" }).getByRole("button");
  }
  waitingMenuItem(): Locator {
    return this.getByRole("menuitem", { name: "WAITING" }).getByLabel("");
  }
  get okButton(): Locator {
    return this.getByRole("button", { name: "OK" });
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
    return this.getByRole("button", { name: "Comment" });
  }
  get checkButton(): Locator {
    return this.getByRole("button", { name: "check" });
  }
  get deleteButton(): Locator {
    return this.getByRole("button", { name: "delete" });
  }
  commentsCountButton(count: number | string = 0): Locator {
    return this.getByRole("button", { name: String(count) });
  }

  // Item management
  get newItemButton(): Locator {
    return this.getByRole("button", { name: "plus New Item" });
  }
  get saveButton(): Locator {
    return this.getByRole("button", { name: "Save" });
  }
  get ellipsisButton(): Locator {
    return this.getByRole("button", { name: "ellipsis" });
  }
  get addToRequestButton(): Locator {
    return this.getByText("Add to Request");
  }
  get selectCheckbox(): Locator {
    return this.getByLabel("", { exact: true });
  }
  get closeTextButton(): Locator {
    return this.getByText("Close");
  }

  // Version history and navigation
  get versionHistoryTab(): Locator {
    return this.getByRole("tab", { name: "Version History" });
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
  collapsedModelButton(modelName: string, index: number = 0): Locator {
    return this.getByRole("button", { name: `collapsed ${modelName}` }).nth(index);
  }
  collapsedModelItemButton(modelName: string, itemId: string): Locator {
    return this.getByRole("button", { name: `collapsed ${modelName} / ${itemId}` });
  }
}