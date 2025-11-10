// e2e/pages/content.page.ts
import { type Locator } from "@reearth-cms/e2e/fixtures/test";

import { BasePage } from "./base.page";

export class ContentPage extends BasePage {
  // Navigation
  get contentText(): Locator {
    return this.getByText("Content");
  }

  // Item creation and editing
  get newItemButton(): Locator {
    return this.getByRole("button", { name: "plus New Item" });
  }
  get saveButton(): Locator {
    return this.getByRole("button", { name: "Save" });
  }
  get backButton(): Locator {
    return this.getByLabel("Back");
  }

  // Search
  get searchInput(): Locator {
    return this.getByPlaceholder("input search text");
  }
  get searchButton(): Locator {
    return this.getByRole("button", { name: "search" });
  }

  // Table actions
  get selectAllCheckbox(): Locator {
    return this.getByLabel("", { exact: true });
  }
  get editButton(): Locator {
    return this.getByRole("cell").getByLabel("edit").locator("svg");
  }
  get deleteButton(): Locator {
    return this.getByText("Delete");
  }

  // Publishing
  get publishButton(): Locator {
    return this.getByRole("button", { name: "Publish" });
  }
  get unpublishButton(): Locator {
    return this.getByText("Unpublish");
  }
  get publishFromTableButton(): Locator {
    return this.getByText("Publish", { exact: true });
  }
  get yesButton(): Locator {
    return this.getByRole("button", { name: "Yes" });
  }
  get ellipsisMenuButton(): Locator {
    return this.getByRole("button", { name: "ellipsis" });
  }

  // Status indicators
  get draftStatus(): Locator {
    return this.getByText("Draft");
  }
  get publishedStatus(): Locator {
    return this.getByText("Published");
  }

  // Comments
  get commentButton(): Locator {
    return this.getByLabel("comment");
  }
  commentsCountButton(count: number | string = 0): Locator {
    return this.getByRole("button", { name: String(count) });
  }

  // Dynamic field input
  fieldInput(fieldName: string): Locator {
    return this.getByLabel(fieldName);
  }

  // Field description text
  fieldDescriptionText(description: string): Locator {
    return this.getByText(description);
  }

  // Table cells
  cellByText(text: string, exact = false): Locator {
    return this.getByRole("cell", { name: text, exact });
  }
  get cellEditButton(): Locator {
    return this.getByRole("cell").getByLabel("edit").locator("svg");
  }
  cellEditButtonByIndex(index: number): Locator {
    return this.getByRole("cell").getByLabel("edit").locator("svg").nth(index);
  }

  // Link elements
  linkByName(name: string): Locator {
    return this.getByRole("link", { name });
  }

  // Tooltip interactions
  get tooltipEditButton(): Locator {
    return this.getByRole("tooltip", { name: "edit" }).locator("svg");
  }

  // Table body element
  get tableBodyElement(): Locator {
    return this.locator(".ant-table-body");
  }

  // Views management
  get saveAsNewViewButton(): Locator {
    return this.getByRole("button", { name: "Save as new view" });
  }
  get viewNameInput(): Locator {
    return this.getByLabel("View Name");
  }
  get okButton(): Locator {
    return this.getByRole("button", { name: "OK" });
  }
  get cancelButton(): Locator {
    return this.getByRole("button", { name: "Cancel" });
  }
  get moreButton(): Locator {
    return this.getByLabel("more").locator("svg");
  }
  get renameViewButton(): Locator {
    return this.getByText("Rename");
  }
  get removeViewButton(): Locator {
    return this.getByText("Remove View");
  }
  get removeButton(): Locator {
    return this.getByRole("button", { name: "Remove" });
  }
  get updateViewButton(): Locator {
    return this.getByText("Update View");
  }

  // Table sorting and filtering
  textColumnHeader(): Locator {
    return this.locator("thead").getByText("text");
  }
  get columnHeaderText(): Locator {
    return this.getByRole("columnheader", { name: "text" });
  }
  get sortUpIcon(): Locator {
    return this.columnHeaderText.locator("div").locator(".anticon-caret-up");
  }
  get sortDownIcon(): Locator {
    return this.columnHeaderText.locator("div").locator(".anticon-caret-down");
  }
  tableRow(index: number): Locator {
    return this.locator(".ant-table-row").nth(index);
  }
  get statusColumnHeader(): Locator {
    return this.getByRole("columnheader", { name: "Status" });
  }

  // Filtering
  get addFilterButton(): Locator {
    return this.getByRole("button", { name: "plus Filter" });
  }
  filterMenuItem(fieldName: string): Locator {
    return this.getByRole("menuitem", { name: fieldName });
  }
  filterCloseButton(fieldName: string): Locator {
    return this.getByRole("button", { name: `${fieldName} close` });
  }
  get isDropdown(): Locator {
    return this.getByText("is", { exact: true }).first();
  }
  get containsOption(): Locator {
    return this.getByText("contains", { exact: true });
  }
  get endWithOption(): Locator {
    return this.getByText("end with", { exact: true });
  }
  get filterValueInput(): Locator {
    return this.getByPlaceholder("Enter the value");
  }
  get confirmButton(): Locator {
    return this.getByRole("button", { name: "Confirm" });
  }

  // Settings
  get settingsButton(): Locator {
    return this.getByRole("main").getByLabel("setting").locator("svg");
  }
  get statusCheckbox(): Locator {
    return this.locator(".ant-tree-checkbox").first();
  }

  // Tabs and views
  tab(index: number): Locator {
    return this.getByRole("tab").nth(index);
  }
  viewTabWithMore(viewName: string): Locator {
    return this.getByRole("tab", { name: `${viewName} more` });
  }
  get tabList(): Locator {
    return this.getByRole("tablist");
  }

  // Dynamic methods
  viewByName(viewName: string): Locator {
    return this.getByText(viewName);
  }

  // Table headers and structure
  get tableBodyRows(): Locator {
    return this.locator("tbody > tr.ant-table-row");
  }

  // Root element reference
  get rootElement(): Locator {
    return this.locator("#root");
  }

  // Cell selection by text and exact matching
  cellByTextExact(text: string): Locator {
    return this.getByRole("cell", { name: text, exact: true });
  }

  cellSpanByText(text: string): Locator {
    return this.getByRole("cell", { name: text }).locator("span").first();
  }

  // Model navigation
  modelLinkByText(modelName: string): Locator {
    return this.getByText(modelName);
  }

  // Group field related elements
  get mainRole(): Locator {
    return this.getByRole("main");
  }

  get firstLabel(): Locator {
    return this.locator("label").first();
  }

  get textBoxes(): Locator {
    return this.getByRole("textbox");
  }

  get firstTextbox(): Locator {
    return this.getByRole("textbox").first();
  }

  get lastTextbox(): Locator {
    return this.getByRole("textbox").last();
  }

  textBoxByIndex(index: number): Locator {
    return this.getByRole("textbox").nth(index);
  }

  // Filtered div locators for complex elements
  divFilterByText(text: RegExp): Locator {
    return this.locator("div").filter({ hasText: text });
  }

  // Character count indicators
  get characterCountText(): Locator {
    return this.getByText("/ 5");
  }

  // Option field specific
  get closeCircleLabel(): Locator {
    return this.getByLabel("close-circle");
  }

  // Dynamic option text methods
  optionTextByName(optionName: string, exact = true): Locator {
    return this.getByText(optionName, { exact });
  }

  // Complex cell selection
  cellByComplexName(name: string): Locator {
    return this.getByRole("cell", { name });
  }

  // Asset field specific
  cssAssetByIndex(index: number): Locator {
    return this.locator(".css-7g0azd").nth(index);
  }

  get tooltip(): Locator {
    return this.getByRole("tooltip");
  }

  get x2Button(): Locator {
    return this.getByRole("button", { name: "x2" });
  }

  // Table row controls for assets
  get antTableRowTd(): Locator {
    return this.locator(".ant-table-row > td");
  }

  // Tag metadata specific
  get itemInformationHeading(): Locator {
    return this.getByRole("heading", { name: "Item Information" });
  }

  get tabPanel(): Locator {
    return this.getByRole("tabpanel");
  }

  // Column header with edit functionality
  columnHeaderWithEdit(fieldName: string): Locator {
    return this.getByRole("columnheader", { name: `${fieldName} edit` });
  }

  // Cell by tag name with multiple values
  cellByTagNames(tagNames: string): Locator {
    return this.getByRole("cell", { name: tagNames });
  }

  // Text metadata specific
  get antTableBody(): Locator {
    return this.locator(".ant-table-body");
  }

  get tooltipTextboxes(): Locator {
    return this.getByRole("tooltip").getByRole("textbox");
  }

  tooltipTextByName(text: string): Locator {
    return this.getByRole("tooltip").getByText(text);
  }

  get x3Button(): Locator {
    return this.getByRole("button", { name: "x3" });
  }

  // Back button variations
  get backButtonRole(): Locator {
    return this.getByRole("button", { name: "Back" });
  }
  get backButtonLabel(): Locator {
    return this.getByLabel("Back");
  }

  // Boolean/Switch field specific
  switchByIndex(index: number): Locator {
    return this.getByRole("switch").nth(index);
  }

  get allSwitches(): Locator {
    return this.getByRole("switch");
  }

  // Switch states
  get checkSwitch(): Locator {
    return this.getByRole("switch", { name: "check" });
  }

  get closeSwitch(): Locator {
    return this.getByRole("switch", { name: "close" });
  }

  // Tooltip switch elements
  tooltipSwitchByIndex(index: number): Locator {
    return this.getByRole("tooltip").getByRole("switch").nth(index);
  }

  // Checkbox field specific
  checkboxByIndex(index: number): Locator {
    return this.getByRole("checkbox").nth(index);
  }

  // Cell checkbox elements
  get lastCellCheckbox(): Locator {
    return this.getByRole("cell").getByRole("checkbox").last();
  }

  // Tooltip checkbox elements
  tooltipCheckboxByIndex(index: number): Locator {
    return this.getByRole("tooltip").getByRole("checkbox").nth(index);
  }

  // Table column selection
  tableColumnButton(childIndex: number): Locator {
    return this.locator(`.ant-table-row > td:nth-child(${childIndex})`).getByRole("button");
  }

  // Multi-value text containers
  get firstTextContainer(): Locator {
    return this.locator("div:nth-child(1) > .css-1ago99h");
  }

  get secondTextContainer(): Locator {
    return this.locator("div:nth-child(2) > .css-1ago99h");
  }

  // Required field validation
  get pleaseInputFieldText(): Locator {
    return this.getByText("Please input field!");
  }

  // Cell selection with nth
  cellByIndex(index: number): Locator {
    return this.getByRole("cell", { name: "edit" }).nth(index);
  }

  // Navigation helpers
  get contentTextFirst(): Locator {
    return this.getByText("Content").first();
  }

  // Title helpers
  titleByText(title: string, exact = false): Locator {
    return this.getByTitle(title, { exact });
  }

  // Spinbutton elements (for numeric fields)
  spinbuttonByIndex(index: number): Locator {
    return this.getByRole("spinbutton").nth(index);
  }

  // Table elements
  get tableBody(): Locator {
    return this.locator("tbody");
  }

  get tableHead(): Locator {
    return this.locator("thead");
  }

  // Close circle button for clearing values
  get closeDateButton(): Locator {
    return this.getByRole("button", { name: "close-circle" });
  }

  // Date placeholder
  get selectDatePlaceholder(): Locator {
    return this.getByPlaceholder("Select date");
  }

  // Label elements
  labelElement(): Locator {
    return this.locator("label");
  }

  // Main element
  get mainElement(): Locator {
    return this.getByRole("main");
  }

  // Tooltip paragraph elements
  get tooltipParagraphs(): Locator {
    return this.getByRole("tooltip").locator("p");
  }

  tooltipParagraphByIndex(index: number): Locator {
    return this.getByRole("tooltip").locator("p").nth(index);
  }

  // Geometry field specific elements
  get viewLinesEditor(): Locator {
    return this.locator(".view-lines");
  }

  get editorContent(): Locator {
    return this.locator(".monaco-editor");
  }

  // Table column selection
  nthTableColumnButton(index: number): Locator {
    return this.locator(`.ant-table-row > td:nth-child(${index})`).getByRole("button");
  }

  // Ant row button by index
  antRowButton(index: number): Locator {
    return this.locator(".ant-row").getByRole("button").nth(index);
  }

  // Unique field label
  uniqueFieldLabel(fieldName: string): Locator {
    return this.getByText(`${fieldName}(unique)`);
  }

  // Version history elements
  get versionHistoryTab(): Locator {
    return this.getByRole("tab", { name: "Version History" });
  }

  get requestStatusElement(): Locator {
    return this.getByTestId("requestStatus").locator("span");
  }

  get currentVersionText(): Locator {
    return this.getByText("current");
  }

  get currentVersionTextExact(): Locator {
    return this.getByText("current", { exact: true });
  }

  // Request elements
  requestLink(title: string): Locator {
    return this.getByRole("link", { name: `pull-request ${title}` });
  }

  get approveButton(): Locator {
    return this.getByRole("button", { name: "Approve" });
  }

  // Back button for version details
  get backButtonLast(): Locator {
    return this.getByRole("button", { name: "back" }).last();
  }

  // Restore button
  get restoreButton(): Locator {
    return this.getByRole("button", { name: "Restore" });
  }

  get restoreButtonMain(): Locator {
    return this.getByRole("main").getByRole("button", { name: "Restore" });
  }

  get restoreButtonAlert(): Locator {
    return this.getByRole("alert").getByRole("button", { name: "Restore" });
  }

  get restoreButtonAlertFirst(): Locator {
    return this.getByRole("alert").getByRole("button", { name: "Restore" }).first();
  }

  // Dynamic text matching with regex
  textByRegex(regex: RegExp): Locator {
    return this.getByText(regex);
  }

  // Tooltip with specific name
  tooltipByName(name: string): Locator {
    return this.getByRole("tooltip", { name });
  }

  // Item ID button
  itemIdButton(itemId: string): Locator {
    return this.getByRole("button", { name: itemId, exact: true });
  }

  // ========== Action Methods (POM Pattern) ==========

  async createItem(): Promise<void> {
    await this.getByText("Content").click();
    await this.getByRole("button", { name: "plus New Item" }).click();
    await this.getByRole("button", { name: "Save" }).click();
    await this.closeNotification();
  }

  async createRequest(title: string): Promise<void> {
    await this.getByRole("button", { name: "ellipsis" }).click();
    await this.getByRole("menuitem", { name: "New Request" }).click();
    await this.getByLabel("Title").last().click();
    await this.getByLabel("Title").last().fill(title);
    await this.page.click(".ant-select-selector");
    const firstItem = this.page.locator(".ant-select-item").first();
    await firstItem.click();
    await this.getByLabel("Description").click();
    await this.getByRole("button", { name: "OK" }).click();
    await this.closeNotification();
  }

  async createComment(content: string): Promise<void> {
    await this.page.locator("#content").click();
    await this.page.locator("#content").fill(content);
    await this.getByRole("button", { name: "Comment" }).click();
    await this.closeNotification();
  }

  async updateComment(oldText: string, newText: string): Promise<void> {
    await this.getByRole("main")
      .getByRole("complementary")
      .getByLabel("edit")
      .locator("svg")
      .click();
    await this.page.locator("textarea").filter({ hasText: oldText }).click();
    await this.page.locator("textarea").filter({ hasText: oldText }).fill(newText);
    await this.getByLabel("check").locator("svg").first().click();
    await this.closeNotification();
  }

  async deleteComment(): Promise<void> {
    await this.getByLabel("delete").locator("svg").click();
    await this.closeNotification();
  }

  viewTabMoreIcon(viewName: string): Locator {
    return this.viewTabWithMore(viewName).locator("svg");
  }

  viewTab(index: number): Locator {
    return this.tabList.getByRole("tab").nth(index);
  }

  x2ButtonByIndex(index: number): Locator {
    return this.getByRole("button", { name: "x2" }).nth(index);
  }

  tabPanelTextByName(text: string): Locator {
    return this.tabPanel.getByText(text);
  }

  cellDivByText(text: string, index: number): Locator {
    return this.cellByText(text).locator("div").nth(index);
  }

  get closeCircleLabelSvg(): Locator {
    return this.closeCircleLabel.locator("svg");
  }

  async createView(viewName: string): Promise<void> {
    await this.saveAsNewViewButton.click();
    await this.viewNameInput.fill(viewName);
    await this.okButton.click();
    await this.closeNotification();
  }

  async renameView(newName: string): Promise<void> {
    await this.moreButton.click();
    await this.renameViewButton.click();
    await this.viewNameInput.fill(newName);
    await this.okButton.click();
    await this.closeNotification();
  }

  async deleteView(): Promise<void> {
    await this.moreButton.click();
    await this.removeViewButton.click();
    await this.removeButton.click();
    await this.closeNotification();
  }

  async searchFor(searchTerm: string): Promise<void> {
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
    await this.ellipsisMenuButton.click();
    await this.unpublishButton.click();
    await this.closeNotification();
  }

  async addFilter(
    fieldName: string,
    operator: "is" | "contains" | "end with",
    value: string,
  ): Promise<void> {
    await this.addFilterButton.click();
    await this.filterMenuItem(fieldName).click();

    if (operator !== "is") {
      await this.isDropdown.click();
      if (operator === "contains") {
        await this.containsOption.click();
      } else if (operator === "end with") {
        await this.endWithOption.click();
      }
    }

    await this.filterValueInput.fill(value);
    await this.confirmButton.click();
  }

  async removeFilter(fieldName: string): Promise<void> {
    await this.filterCloseButton(fieldName).click();
  }

  async createItemWithField(
    fieldName: string,
    fieldValue: string,
    navigateBack = true,
  ): Promise<void> {
    await this.newItemButton.click();
    await this.fieldInput(fieldName).fill(fieldValue);
    await this.saveButton.click();
    await this.closeNotification();
    if (navigateBack) {
      await this.backButton.click();
    }
  }

  getCurrentItemId(): string {
    const url = this.page.url();
    return url.split("/").at(-1) as string;
  }

  async fillEditorContent(text: string): Promise<void> {
    await this.editorContent.click();
    await this.keyboardType(text);
  }
}
