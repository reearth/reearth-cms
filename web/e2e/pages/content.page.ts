import { Locator } from "@reearth-cms/e2e/fixtures/test";

import { BasePage } from "./base.page";

export const DEFAULT_REQUEST_TITLE = "requestTitle";

export class ContentPage extends BasePage {
  get contentTab(): Locator {
    return this.getByText("Content");
  }
  get schemaTab(): Locator {
    return this.getByText("Schema");
  }
  get versionHistoryTab(): Locator {
    return this.getByRole("tab", { name: "Version History" });
  }

  tabByName(name: string): Locator {
    return this.getByText(name, { exact: true });
  }

  modelMenuItem(name: string): Locator {
    return this.getByRole("menuitem", { name });
  }

  get newItemButton(): Locator {
    return this.getByRole("button", { name: "plus New Item" });
  }
  get saveButton(): Locator {
    return this.getByRole("button", { name: "Save" });
  }
  get publishButton(): Locator {
    return this.getByRole("button", { name: "Publish" });
  }
  get unpublishButton(): Locator {
    return this.getByRole("button", { name: "Unpublish" });
  }
  get ellipsisButton(): Locator {
    return this.getByRole("button", { name: "ellipsis" });
  }
  get backButton(): Locator {
    return this.getByLabel("Back");
  }

  get searchInput(): Locator {
    return this.getByPlaceholder("input search text");
  }
  get searchButton(): Locator {
    return this.getByRole("button", { name: "search" });
  }

  get tableRows(): Locator {
    return this.locator(".ant-table-tbody .ant-table-row");
  }
  rowByText(text: string | RegExp): Locator {
    return this.tableRows.filter({ hasText: text });
  }
  get selectRowCheckbox(): Locator {
    return this.getByLabel("", { exact: true });
  }

  columnHeader(field: string): Locator {
    return this.getByRole("columnheader", { name: field });
  }
  sortCaretUp(field: string): Locator {
    return this.columnHeader(field).locator("div").locator(".anticon-caret-up");
  }
  sortCaretDown(field: string): Locator {
    return this.columnHeader(field).locator("div").locator(".anticon-caret-down");
  }

  get columnSettingsButton(): Locator {
    return this.page.getByRole("main").getByLabel("setting").locator("svg");
  }
  get statusColumnHeader(): Locator {
    return this.getByRole("columnheader", { name: "Status" });
  }
  get firstColumnTreeCheckbox(): Locator {
    return this.locator(".ant-tree-checkbox").first();
  }

  get publishedChip(): Locator {
    return this.getByText("Published");
  }
  get draftChip(): Locator {
    return this.getByText("Draft");
  }

  commentsCountButton(count: number | string = 0): Locator {
    return this.getByRole("button", { name: String(count) });
  }

  get requestStatus(): Locator {
    return this.page.getByTestId("requestStatus").locator("span");
  }
  tooltipByName(name: string): Locator {
    return this.getByRole("tooltip", { name });
  }
  requestLinkByTitle(requestTitle: string): Locator {
    return this.getByRole("link", { name: `pull-request ${requestTitle}` });
  }
  get approveButton(): Locator {
    return this.getByRole("button", { name: "Approve" });
  }
  versionTimestamp(regex: RegExp): Locator {
    return this.getByText(regex);
  }
  get currentChip(): Locator {
    return this.getByText("current", { exact: true });
  }
  get backIconButton(): Locator {
    return this.getByRole("button", { name: "back" });
  }
  itemIdButton(id: string): Locator {
    return this.getByRole("button", { name: id, exact: true });
  }
  get restoreButton(): Locator {
    return this.getByRole("button", { name: "Restore" });
  }
  get confirmRestoreButtonInAlert(): Locator {
    return this.page.getByRole("alert").getByRole("button", { name: "Restore" });
  }
  get mainRestoreButton(): Locator {
    return this.page.getByRole("main").getByRole("button", { name: "Restore" });
  }

  get newRequestMenuItem(): Locator {
    return this.getByRole("menuitem", { name: "New Request" });
  }
  get requestTitleInput(): Locator {
    return this.getByLabel("Title").last();
  }
  get requestDescriptionInput(): Locator {
    return this.getByLabel("Description");
  }
  get requestSelect(): Locator {
    return this.locator(".ant-select-selector");
  }
  get requestFirstSelectItem(): Locator {
    return this.locator(".ant-select-item").first();
  }

  get saveAsNewViewButton(): Locator {
    return this.getByRole("button", { name: "Save as new view" });
  }
  get viewNameInput(): Locator {
    return this.getByLabel("View Name");
  }
  get okButton(): Locator {
    return this.getByRole("button", { name: "OK" });
  }
  get removeButton(): Locator {
    return this.getByRole("button", { name: "Remove" });
  }
  get cancelButton(): Locator {
    return this.getByRole("button", { name: "Cancel" });
  }

  get tabsList(): Locator {
    return this.getByRole("tablist");
  }
  tabNth(n: number): Locator {
    return this.tabsList.getByRole("tab").nth(n);
  }
  tabMore(name: string): Locator {
    return this.getByRole("tab", { name: `${name} more` });
  }
  tabMoreIcon(name: string): Locator {
    return this.tabMore(name).locator("svg");
  }

  get viewMoreIcon(): Locator {
    return this.getByLabel("more").locator("svg");
  }
  get viewRenameMenuItem(): Locator {
    return this.getByText("Rename");
  }
  get viewRemoveMenuItem(): Locator {
    return this.getByText("Remove View");
  }
  get updateViewMenuItem(): Locator {
    return this.getByText("Update View");
  }

  get addFilterButton(): Locator {
    return this.getByRole("button", { name: "plus Filter" });
  }
  filterFieldMenuItem(field: string): Locator {
    return this.getByRole("menuitem", { name: field });
  }
  filterChipCloseButton(field: string): Locator {
    return this.getByRole("button", { name: `${field} close` });
  }
  get firstConditionDropdown(): Locator {
    return this.getByText("is").first();
  }
  conditionOption(name: string): Locator {
    return this.getByText(name, { exact: true });
  }
  get filterValueInput(): Locator {
    return this.getByPlaceholder("Enter the value");
  }
  get filterConfirmButton(): Locator {
    return this.getByRole("button", { name: "Confirm" });
  }
}
