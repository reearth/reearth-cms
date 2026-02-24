// e2e/pages/content.page.ts
import { type Locator } from "@reearth-cms/e2e/fixtures/test";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";

import { ProjectScopedPage } from "./project-scoped.page";

export class ContentPage extends ProjectScopedPage {
  // Navigation
  public get contentText(): Locator {
    return this.getByText("Content");
  }

  // Item creation and editing
  public get newItemButton(): Locator {
    return this.getByRole("button", { name: "plus New Item" });
  }
  // Table actions
  public get selectAllCheckbox(): Locator {
    return this.getByLabel("", { exact: true });
  }
  public get editButton(): Locator {
    return this.getByRole("cell").getByLabel("edit").locator("svg");
  }
  public get deleteButton(): Locator {
    return this.getByText("Delete");
  }

  // Publishing
  public get publishButton(): Locator {
    return this.getByRole("button", { name: "Publish" });
  }
  public get unpublishButton(): Locator {
    return this.getByText("Unpublish");
  }
  public get publishFromTableButton(): Locator {
    return this.getByText("Publish", { exact: true });
  }
  public get yesButton(): Locator {
    return this.getByRole("button", { name: "Yes" });
  }
  public get ellipsisMenuButton(): Locator {
    return this.getByRole("button", { name: "ellipsis" });
  }

  // Status indicators
  public get draftStatus(): Locator {
    return this.getByText("Draft");
  }
  public get publishedStatus(): Locator {
    return this.getByText("Published");
  }

  // Comments
  public get commentButton(): Locator {
    return this.getByLabel("comment");
  }
  public commentsCountButton(count: number | string = 0): Locator {
    return this.getByRole("button", { name: String(count) });
  }

  // Dynamic field input
  public fieldInput(fieldName: string): Locator {
    return this.getByLabel(fieldName);
  }

  // Field description text
  public fieldDescriptionText(description: string): Locator {
    return this.getByText(description);
  }

  // Table cells
  public cellByText(text: string, exact = false): Locator {
    return this.getByRole("cell", { name: text, exact });
  }
  public get cellEditButton(): Locator {
    return this.getByRole("cell").getByLabel("edit").locator("svg");
  }
  public cellEditButtonByIndex(index: number): Locator {
    return this.getByRole("cell").getByLabel("edit").locator("svg").nth(index);
  }

  // Link elements
  public linkByName(name: string): Locator {
    return this.getByRole("link", { name });
  }

  // Tooltip interactions
  public get tooltipEditButton(): Locator {
    return this.getByRole("tooltip", { name: "edit" }).locator("svg");
  }

  // Table body element
  public get tableBodyElement(): Locator {
    return this.getByTestId(DATA_TEST_ID.ContentTable__Wrapper).locator(".ant-table-body");
  }

  // Views management
  public get saveAsNewViewButton(): Locator {
    return this.getByRole("button", { name: "Save as new view" });
  }
  public get viewNameInput(): Locator {
    return this.getByLabel("View Name");
  }
  public get moreButton(): Locator {
    return this.getByLabel("more").locator("svg");
  }
  public get renameViewButton(): Locator {
    return this.getByText("Rename");
  }
  public get removeViewButton(): Locator {
    return this.getByText("Remove View");
  }
  public get removeButton(): Locator {
    return this.getByRole("button", { name: "Remove" });
  }
  public get updateViewButton(): Locator {
    return this.getByText("Update View");
  }

  // Table sorting and filtering
  public textColumnHeader(): Locator {
    return this.getByText("text", { exact: true });
  }
  private get columnHeaderText(): Locator {
    return this.getByRole("columnheader", { name: "text" });
  }
  public get sortUpIcon(): Locator {
    return this.columnHeaderText.locator("div").locator(".anticon-caret-up");
  }
  public get sortDownIcon(): Locator {
    return this.columnHeaderText.locator("div").locator(".anticon-caret-down");
  }
  public tableRow(index: number): Locator {
    return this.getByTestId(DATA_TEST_ID.ContentTable__Wrapper)
      .locator("tbody tr:not([aria-hidden='true'])")
      .nth(index);
  }
  public get statusColumnHeader(): Locator {
    return this.getByRole("columnheader", { name: "Status" });
  }

  // Filtering
  public get addFilterButton(): Locator {
    return this.getByRole("button", { name: "plus Filter" });
  }
  public filterMenuItem(fieldName: string): Locator {
    return this.getByRole("menuitem", { name: fieldName });
  }
  public filterCloseButton(fieldName: string): Locator {
    return this.getByRole("button", { name: `${fieldName} close` });
  }
  public get isDropdown(): Locator {
    return this.getByText("is", { exact: true }).first();
  }
  public get containsOption(): Locator {
    return this.getByText("contains", { exact: true });
  }
  public get endWithOption(): Locator {
    return this.getByText("end with", { exact: true });
  }
  public get filterValueInput(): Locator {
    return this.getByPlaceholder("Enter the value");
  }
  public get confirmButton(): Locator {
    return this.getByRole("button", { name: "Confirm" });
  }

  // Settings
  public get settingsButton(): Locator {
    return this.getByRole("main").getByLabel("setting").locator("svg");
  }
  public get statusCheckbox(): Locator {
    return this.locator(".ant-tree-checkbox").first();
  }

  // Tabs and views
  public tab(index: number): Locator {
    return this.getByRole("tab").nth(index);
  }
  public viewTabWithMore(viewName: string): Locator {
    return this.getByRole("tab", { name: `${viewName} more` });
  }
  private get tabList(): Locator {
    return this.getByRole("tablist");
  }

  // Dynamic methods
  public viewByName(viewName: string): Locator {
    return this.getByText(viewName);
  }

  // Table headers and structure
  public get tableBodyRows(): Locator {
    return this.getByTestId(DATA_TEST_ID.ContentTable__Wrapper).locator("tbody tr:visible");
  }

  // Cell selection by text and exact matching
  public cellByTextExact(text: string): Locator {
    return this.getByRole("cell", { name: text, exact: true });
  }

  public cellSpanByText(text: string): Locator {
    return this.getByRole("cell", { name: text }).locator("span").first();
  }

  // Model navigation
  public modelLinkByText(modelName: string): Locator {
    return this.getByText(modelName);
  }

  // Group field related elements
  public get mainRole(): Locator {
    return this.getByRole("main");
  }

  public get firstLabel(): Locator {
    return this.locator("label").first();
  }

  public get textBoxes(): Locator {
    return this.getByRole("textbox");
  }

  public get firstTextbox(): Locator {
    return this.getByRole("textbox").first();
  }

  public get lastTextbox(): Locator {
    return this.getByRole("textbox").last();
  }

  public textBoxByIndex(index: number): Locator {
    return this.getByRole("textbox").nth(index);
  }

  // Filtered div locators for complex elements
  public divFilterByText(text: RegExp): Locator {
    return this.locator("div").filter({ hasText: text });
  }

  // Character count indicators
  public get characterCountText(): Locator {
    return this.getByText("/ 5");
  }

  // Option field specific
  public get closeCircleLabel(): Locator {
    return this.getByLabel("close-circle");
  }

  // Dynamic option text methods
  public optionTextByName(optionName: string, exact = true): Locator {
    return this.getByText(optionName, { exact });
  }

  // Complex cell selection
  public cellByComplexName(name: string): Locator {
    return this.getByRole("cell", { name });
  }

  // Asset field specific
  public cssAssetByIndex(index: number): Locator {
    return this.getByTestId(DATA_TEST_ID.MultiValueAsset__ItemWrapper).nth(index);
  }

  public get tooltip(): Locator {
    return this.getByRole("tooltip");
  }

  public get x2Button(): Locator {
    return this.getByRole("button", { name: "x2" });
  }

  // Table row controls for assets
  public get antTableRowTd(): Locator {
    return this.getByTestId(DATA_TEST_ID.ContentTable__Wrapper).locator("tbody td");
  }

  // Tag metadata specific
  public get metadataTagSelect(): Locator {
    return this.getByTestId(DATA_TEST_ID.MetadataField__TagSelect);
  }

  public get itemInformationHeading(): Locator {
    return this.getByRole("heading", { name: "Item Information" });
  }

  public get tabPanel(): Locator {
    return this.getByRole("tabpanel");
  }

  // Column header with edit functionality
  public columnHeaderWithEdit(fieldName: string): Locator {
    return this.getByRole("columnheader", { name: `${fieldName} edit` });
  }

  // Cell by tag name with multiple values
  public cellByTagNames(tagNames: string): Locator {
    return this.getByRole("cell", { name: tagNames });
  }

  public get tooltipTextboxes(): Locator {
    return this.getByRole("tooltip").getByRole("textbox");
  }

  public tooltipTextByName(text: string): Locator {
    return this.getByRole("tooltip").getByText(text);
  }

  public get x3Button(): Locator {
    return this.getByRole("button", { name: "x3" });
  }

  // Back button variations
  public get backButtonRole(): Locator {
    return this.getByRole("button", { name: "Back" });
  }
  public get backButtonLabel(): Locator {
    return this.getByLabel("Back");
  }

  // Boolean/Switch field specific
  public switchByIndex(index: number): Locator {
    return this.getByRole("switch").nth(index);
  }

  public get allSwitches(): Locator {
    return this.getByRole("switch");
  }

  // Switch states
  public get checkSwitch(): Locator {
    return this.getByRole("switch", { name: "check" });
  }

  public get closeSwitch(): Locator {
    return this.getByRole("switch", { name: "close" });
  }

  // Tooltip switch elements
  public tooltipSwitchByIndex(index: number): Locator {
    return this.getByRole("tooltip").getByRole("switch").nth(index);
  }

  // Checkbox field specific
  public checkboxByIndex(index: number): Locator {
    return this.getByRole("checkbox").nth(index);
  }

  // Cell checkbox elements
  public get lastCellCheckbox(): Locator {
    return this.getByRole("cell").getByRole("checkbox").last();
  }

  // Tooltip checkbox elements
  public tooltipCheckboxByIndex(index: number): Locator {
    return this.getByRole("tooltip").getByRole("checkbox").nth(index);
  }

  // Table column selection
  public tableColumnButton(childIndex: number): Locator {
    return this.getByTestId(DATA_TEST_ID.ContentTable__Wrapper)
      .locator(`tbody td:nth-child(${childIndex})`)
      .getByRole("button");
  }

  // Multi-value text containers
  public get firstTextContainer(): Locator {
    return this.getByTestId(DATA_TEST_ID.MultiValueField__ItemWrapper).first();
  }

  public get secondTextContainer(): Locator {
    return this.getByTestId(DATA_TEST_ID.MultiValueField__ItemWrapper).nth(1);
  }

  // Required field validation
  public get pleaseInputFieldText(): Locator {
    return this.getByText("Please input field!");
  }

  // Cell selection with nth
  public cellByIndex(index: number): Locator {
    return this.getByRole("cell", { name: "edit" }).nth(index);
  }

  // Navigation helpers
  public get contentTextFirst(): Locator {
    return this.getByText("Content").first();
  }

  // Title helpers
  public titleByText(title: string, exact = false): Locator {
    return this.getByTitle(title, { exact });
  }

  // Spinbutton elements (for numeric fields)
  public spinButtonByIndex(index: number): Locator {
    return this.getByRole("spinbutton").nth(index);
  }

  // Table elements
  public get tableBody(): Locator {
    return this.locator("tbody");
  }

  public get tableHead(): Locator {
    return this.locator("thead");
  }

  // Close circle button for clearing values
  public get closeDateButton(): Locator {
    return this.getByRole("button", { name: "close-circle" });
  }

  // Date placeholder
  public get selectDatePlaceholder(): Locator {
    return this.getByPlaceholder("Select date");
  }

  // Label elements
  public labelElement(): Locator {
    return this.locator("label");
  }

  // Main element
  public get mainElement(): Locator {
    return this.getByRole("main");
  }

  // Tooltip paragraph elements
  public get tooltipParagraphs(): Locator {
    return this.getByRole("tooltip").locator("p");
  }

  public tooltipParagraphByIndex(index: number): Locator {
    return this.getByRole("tooltip").locator("p").nth(index);
  }

  // Geometry field specific elements
  public get viewLinesEditor(): Locator {
    return this.getByTestId(DATA_TEST_ID.GeometryItem__EditorWrapper).locator(".view-lines");
  }

  public get editorContent(): Locator {
    return this.getByLabel("Editor content;Press Alt+F1");
  }

  // Geometry delete button
  public get geometryDeleteButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.GeometryItem__DeleteButton);
  }

  // Unique field label
  public uniqueFieldLabel(fieldName: string): Locator {
    return this.getByText(`${fieldName}(unique)`);
  }

  // Version history elements
  public get versionHistoryTab(): Locator {
    return this.getByRole("tab", { name: "Version History" });
  }

  public get requestStatusElement(): Locator {
    return this.getByTestId(DATA_TEST_ID.Versions__RequestStatus).locator("span");
  }

  public get currentVersionText(): Locator {
    return this.getByText("current");
  }

  public get currentVersionTextExact(): Locator {
    return this.getByText("current", { exact: true });
  }

  // Request elements
  public requestLink(title: string): Locator {
    return this.getByRole("link", { name: `pull-request ${title}` });
  }

  public get approveButton(): Locator {
    return this.getByRole("button", { name: "Approve" });
  }

  // Back button for version details
  public get backButtonLast(): Locator {
    return this.getByRole("button", { name: "back" }).last();
  }

  // Restore button
  public get restoreButton(): Locator {
    return this.getByRole("button", { name: "Restore" });
  }

  public get restoreButtonMain(): Locator {
    return this.getByRole("main").getByRole("button", { name: "Restore" });
  }

  public get restoreButtonAlert(): Locator {
    return this.getByRole("alert").getByRole("button", { name: "Restore" });
  }

  public get restoreButtonAlertFirst(): Locator {
    return this.getByRole("alert").getByRole("button", { name: "Restore" }).first();
  }

  // Dynamic text matching with regex
  public textByRegex(regex: RegExp): Locator {
    return this.getByText(regex);
  }

  // Tooltip with specific name
  public tooltipByName(name: string): Locator {
    return this.getByRole("tooltip", { name });
  }

  // Item ID button
  public itemIdButton(itemId: string): Locator {
    return this.getByRole("button", { name: itemId, exact: true });
  }

  // ========== Action Methods (POM Pattern) ==========

  public async createItem(): Promise<void> {
    await this.getByText("Content").click();
    await this.getByRole("button", { name: "plus New Item" }).click();
    await this.getByRole("button", { name: "Save" }).click();
    await this.closeNotification();
  }

  public async createRequest(title: string): Promise<void> {
    await this.getByRole("button", { name: "ellipsis" }).click();
    await this.getByRole("menuitem", { name: "New Request" }).click();
    await this.getByLabel("Title").last().click();
    await this.getByLabel("Title").last().fill(title);
    await this.getByTestId(DATA_TEST_ID.RequestCreationModal__ReviewerSelect)
      .locator("input")
      .click();
    await this.keypress("Enter");
    await this.getByLabel("Description").click();
    await this.getByRole("button", { name: "OK" }).click();
    await this.closeNotification();
  }

  public async createComment(content: string): Promise<void> {
    await this.page.locator("#content").click();
    await this.page.locator("#content").fill(content);
    await this.getByRole("button", { name: "Comment" }).click();
    await this.closeNotification();
  }

  public async updateComment(oldText: string, newText: string): Promise<void> {
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

  public async deleteComment(): Promise<void> {
    await this.getByLabel("delete").locator("svg").click();
    await this.closeNotification();
  }

  public viewTabMoreIcon(viewName: string): Locator {
    return this.viewTabWithMore(viewName).locator("svg");
  }

  public viewTab(index: number): Locator {
    return this.tabList.getByRole("tab").nth(index);
  }

  public x2ButtonByIndex(index: number): Locator {
    return this.getByRole("button", { name: "x2" }).nth(index);
  }

  public tabPanelTextByName(text: string): Locator {
    return this.tabPanel.getByText(text);
  }

  public cellDivByText(text: string, index: number): Locator {
    return this.cellByText(text).locator("div").nth(index);
  }

  public get closeCircleLabelSvg(): Locator {
    return this.closeCircleLabel.locator("svg");
  }

  public async createView(viewName: string): Promise<void> {
    await this.saveAsNewViewButton.click();
    await this.viewNameInput.fill(viewName);
    await this.okButton.click();
    await this.closeNotification();
  }

  public async renameView(newName: string): Promise<void> {
    await this.moreButton.click();
    await this.renameViewButton.click();
    await this.viewNameInput.fill(newName);
    await this.okButton.click();
    await this.closeNotification();
  }

  public async deleteView(): Promise<void> {
    await this.moreButton.click();
    await this.removeViewButton.click();
    await this.removeButton.click();
    await this.closeNotification();
  }

  public async searchFor(searchTerm: string): Promise<void> {
    await this.searchInput.fill(searchTerm);
    await this.searchButton.click();
  }

  public async clearSearch(): Promise<void> {
    await this.searchInput.fill("");
    await this.searchButton.click();
  }

  public async publishItem(): Promise<void> {
    await this.publishButton.click();
    await this.closeNotification();
  }

  public async unpublishItem(): Promise<void> {
    await this.ellipsisMenuButton.click();
    await this.unpublishButton.click();
    await this.closeNotification();
  }

  public async addFilter(
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

  public async removeFilter(fieldName: string): Promise<void> {
    await this.filterCloseButton(fieldName).click();
  }

  public async createItemWithField(
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

  // ========== Import Content Locators ==========

  private get importContentButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.Content__List__ImportContentButton);
  }

  public get importContentModal(): Locator {
    return this.getByRole("dialog").filter({ hasText: "Import content" });
  }

  private get importContentFileInput(): Locator {
    return this.getByTestId(DATA_TEST_ID.ContentImportModal__FileSelect);
  }

  public get importContentDragger(): Locator {
    return this.getByTestId(DATA_TEST_ID.ContentImportModal__Dragger);
  }

  public get importContentLoadingWrapper(): Locator {
    return this.getByTestId(DATA_TEST_ID.ContentImportModal__LoadingWrapper);
  }

  public get importContentErrorWrapper(): Locator {
    return this.getByTestId(DATA_TEST_ID.ContentImportModal__ErrorWrapper);
  }

  public get importContentErrorTitle(): Locator {
    return this.getByTestId(DATA_TEST_ID.ContentImportModal__ErrorTitle);
  }

  public get importContentErrorDescription(): Locator {
    return this.getByTestId(DATA_TEST_ID.ContentImportModal__ErrorDescription);
  }

  public get importContentErrorHint(): Locator {
    return this.getByTestId(DATA_TEST_ID.ContentImportModal__ErrorHint);
  }

  public get importContentGoBackButton(): Locator {
    return this.getByRole("button", { name: "Go Back" });
  }

  public get importContentImportAnywayButton(): Locator {
    return this.getByRole("button", { name: "Import Anyway" });
  }

  public get uploadSuccessNotification(): Locator {
    return this.getByText("Successfully created upload job!");
  }

  public get tableReloadIcon(): Locator {
    return this.getByLabel("reload");
  }

  public get tableContentFieldPopoverIcon(): Locator {
    return this.getByTestId(DATA_TEST_ID.Content__List__ItemFieldPopoverIcon);
  }

  public get tableContentFieldPopoverContent(): Locator {
    return this.getByTestId(DATA_TEST_ID.Content__List__ItemFieldPopoverContent);
  }

  // ========== Import Content Actions ==========

  public async openImportContentModal(): Promise<void> {
    await this.importContentButton.click();
    await this.importContentModal.waitFor({ state: "visible" });
  }

  public async uploadImportFile(filePath: string): Promise<void> {
    await this.importContentFileInput.setInputFiles(filePath);
  }

  public async closeImportContentModal(): Promise<void> {
    await this.importContentModal.getByLabel("Close").click();
  }
}
