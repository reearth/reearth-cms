// e2e/pages/field-editor.page.ts
import { type Locator } from "@reearth-cms/e2e/fixtures/test";

import { BasePage } from "./base.page";

export class FieldEditorPage extends BasePage {
  // Field form elements
  get displayNameInput(): Locator {
    return this.getByLabel("Display name");
  }
  get settingsKeyInput(): Locator {
    return this.getByLabel("Settings").locator("#key");
  }
  get settingsDescriptionInput(): Locator {
    return this.getByLabel("Settings").locator("#description");
  }

  // Tabs
  get defaultValueTab(): Locator {
    return this.getByRole("tab", { name: "Default value" });
  }
  get validationTab(): Locator {
    return this.getByRole("tab", { name: "Validation" });
  }

  // Default value tab
  get setDefaultValueInput(): Locator {
    return this.getByLabel("Set default value");
  }

  // Validation tab
  get maxLengthInput(): Locator {
    return this.getByLabel("Set maximum length");
  }
  get requiredFieldCheckbox(): Locator {
    return this.getByLabel("Make field required");
  }
  get uniqueFieldCheckbox(): Locator {
    return this.getByLabel("Set field as unique");
  }
  get minValueInput(): Locator {
    return this.getByLabel("Set minimum value");
  }
  get maxValueInput(): Locator {
    return this.getByLabel("Set maximum value");
  }

  // Field options
  get supportMultipleValuesCheckbox(): Locator {
    return this.getByLabel("Support multiple values");
  }
  get useAsTitleCheckbox(): Locator {
    return this.getByLabel("Use as title");
  }

  // Form buttons
  get okButton(): Locator {
    return this.getByRole("button", { name: "OK" });
  }
  get cancelButton(): Locator {
    return this.getByRole("button", { name: "Cancel" });
  }

  // Additional field settings
  get fieldKeyInput(): Locator {
    return this.getByLabel("Field Key");
  }
  get descriptionInput(): Locator {
    return this.getByLabel("Description(optional)");
  }
  get descriptionRequiredInput(): Locator {
    return this.getByLabel("Description");
  }

  get supportTypePointCheckbox(): Locator {
    return this.getByLabel("Point", { exact: true });
  }

  // Default value specific
  get plusNewButton(): Locator {
    return this.getByRole("button", { name: "plus New" });
  }

  // Textbox helpers
  textboxByIndex(index: number): Locator {
    return this.getByRole("textbox").nth(index);
  }

  get firstTextbox(): Locator {
    return this.getByRole("textbox").first();
  }

  get defaultValueInput(): Locator {
    return this.locator("#defaultValue");
  }

  // Validation labels
  get makeFieldRequiredLabel(): Locator {
    return this.locator("label").filter({ hasText: "Make field required" });
  }

  get setFieldAsUniqueLabel(): Locator {
    return this.locator("label").filter({ hasText: "Set field as unique" });
  }

  // Multiple value controls
  get arrowDownButton(): Locator {
    return this.getByRole("button", { name: "arrow-down" });
  }

  // Option field specific
  get valuesInput(): Locator {
    return this.locator("#values");
  }

  get deleteButton(): Locator {
    return this.getByRole("button", { name: "delete" });
  }

  get settingsTab(): Locator {
    return this.getByRole("tab", { name: "Settings" });
  }

  get setOptionsLabel(): Locator {
    return this.getByLabel("Set Options");
  }

  get antSelectSelectionItem(): Locator {
    return this.locator(".ant-select-selection-item");
  }

  get antSelectSelector(): Locator {
    return this.locator(".ant-select-selector");
  }

  get updateOptionLabel(): Locator {
    return this.getByLabel("Update Option");
  }

  // Dynamic methods for options

  optionDiv(optionText: string): Locator {
    return this.getByTitle(optionText).locator("div");
  }

  // Asset field specific
  get assetButton(): Locator {
    return this.getByRole("button", { name: "Asset" });
  }

  get uploadAssetButton(): Locator {
    return this.getByRole("button", { name: "upload Upload Asset" });
  }

  get urlTab(): Locator {
    return this.getByRole("tab", { name: "URL" });
  }

  get urlInput(): Locator {
    return this.getByPlaceholder("Please input a valid URL");
  }

  get uploadAndLinkButton(): Locator {
    return this.getByRole("button", { name: "Upload and Link" });
  }

  get searchInput(): Locator {
    return this.getByPlaceholder("input search text");
  }

  get searchButton(): Locator {
    return this.getByRole("button", { name: "search" });
  }

  get antTableRow(): Locator {
    return this.getByTestId("asset-table-row");
  }

  get arrowUpButton(): Locator {
    return this.getByRole("button", { name: "arrow-up" });
  }

  get defaultValueLabel(): Locator {
    return this.getByLabel("Default value");
  }

  // Dynamic asset button methods
  folderButton(filename: string): Locator {
    return this.getByRole("button", { name: `folder ${filename}` });
  }

  filenameButton(filename: string): Locator {
    return this.getByRole("button", { name: filename, exact: true });
  }

  // Tag metadata specific
  get fieldDescriptionInput(): Locator {
    return this.getByLabel("Description");
  }

  get tagFilterDiv(): Locator {
    return this.getByRole("tabpanel", { name: "settings" })
      .locator("div")
      .filter({ hasText: /^Tag$/ });
  }

  get lastTextbox(): Locator {
    return this.getByRole("textbox").last();
  }

  get defaultValueExactLabel(): Locator {
    return this.getByLabel("Default value", { exact: true });
  }

  get updateTagLabel(): Locator {
    return this.getByLabel("Update Tag");
  }

  // Dynamic tag selection methods
  tagOptionText(tagName: string): Locator {
    return this.getByText(tagName);
  }

  // Field type selection
  fieldTypeButton(type: string): Locator {
    return this.locator("li").filter({ hasText: type }).locator("div").first();
  }

  // Boolean field specific
  get setDefaultValueSwitch(): Locator {
    return this.getByLabel("Set default value");
  }

  // Switch elements by index
  switchByIndex(index: number): Locator {
    return this.getByRole("switch").nth(index);
  }

  get firstSwitch(): Locator {
    return this.getByRole("switch").first();
  }

  // Checkbox field specific
  get setDefaultValueCheckbox(): Locator {
    return this.getByLabel("Set default value");
  }

  // Checkbox elements by index
  checkboxByIndex(index: number): Locator {
    return this.getByRole("checkbox").nth(index);
  }

  get firstCheckbox(): Locator {
    return this.getByRole("checkbox").first();
  }

  // Markdown/Text field specific
  get defaultValueTextInput(): Locator {
    return this.getByLabel("Set default value");
  }

  // Column layout specific
  get lastColumn(): Locator {
    return this.locator(".ant-col").last();
  }

  // Multi-value text fields
  get firstTextContainer(): Locator {
    return this.locator("div:nth-child(1) > .css-1ago99h");
  }

  get secondTextContainer(): Locator {
    return this.locator("div:nth-child(2) > .css-1ago99h");
  }

  // Field ordering controls
  arrowUpButtonByIndex(index: number): Locator {
    return this.getByRole("button", { name: "arrow-up" }).nth(index);
  }

  get firstArrowDownButton(): Locator {
    return this.getByRole("button", { name: "arrow-down" }).first();
  }

  // Description input field
  get descriptionOptionalInput(): Locator {
    return this.getByLabel("Description(optional)");
  }

  // Default value input by ID
  defaultValueInputByIndex(index: number): Locator {
    return this.locator("#defaultValue").nth(index);
  }

  // Title helpers
  titleByText(title: string, exact = false): Locator {
    return this.getByTitle(title, { exact });
  }

  // Fields container paragraph
  get fieldsContainerParagraph(): Locator {
    return this.getByLabel("Fields").getByRole("paragraph");
  }

  // Field management
  get ellipsisMenuButton(): Locator {
    return this.getByTestId("field-ellipsis-menu-button");
  }
  get ellipsisButton(): Locator {
    return this.getByRole("button", { name: "ellipsis" });
  }

  // Schema navigation
  get metaDataTab(): Locator {
    return this.getByRole("tab", { name: "Meta Data" });
  }

  // Menu items
  menuItemByName(name: string): Locator {
    return this.getByRole("menuitem", { name });
  }

  // Dynamic field labeling
  fieldText(fieldName: string, key: string): Locator {
    return this.getByText(`${fieldName}#${key}`);
  }

  // Column headers
  columnHeaderWithEdit(fieldName: string): Locator {
    return this.getByRole("columnheader", { name: `${fieldName} edit` });
  }

  // Unique field indicators
  uniqueFieldText(fieldName: string, key: string): Locator {
    return this.getByText(`${fieldName} *#${key}(unique)`);
  }
  uniqueFieldLabel(fieldName: string): Locator {
    return this.getByText(`${fieldName}(unique)`);
  }

  // Button variations
  get x3Button(): Locator {
    return this.getByRole("button", { name: "x3" });
  }

  // Tooltip elements
  get tooltip(): Locator {
    return this.getByRole("tooltip");
  }
  tooltipTextbox(index?: number): Locator {
    if (typeof index === "number") {
      return this.getByRole("tooltip").getByRole("textbox").nth(index);
    }
    return this.getByRole("tooltip").getByRole("textbox");
  }

  // Title selection helpers
  titleDiv(date: string): Locator {
    return this.getByTitle(date).locator("div");
  }

  // Field type list item helper
  fieldTypeListItem(type: string | RegExp): Locator {
    return this.locator("li").filter({ hasText: type }).locator("div").first();
  }

  // Select date placeholder
  get selectDatePlaceholder(): Locator {
    return this.getByPlaceholder("Select date");
  }

  // Geometry field specific
  get pointCheckbox(): Locator {
    return this.getByLabel("Point", { exact: true });
  }

  // Code editor elements
  get viewLinesEditor(): Locator {
    return this.locator(".view-lines");
  }

  get editorContent(): Locator {
    return this.getByLabel("Editor content;Press Alt+F1");
  }

  // Delete field button
  get deleteFieldButton(): Locator {
    return this.getByLabel("delete").locator("svg");
  }

  // Reference field specific elements
  get selectModelToReferenceLabel(): Locator {
    return this.getByLabel("Select the model to reference");
  }

  get createReferenceFieldLabel(): Locator {
    return this.getByLabel("Create Reference Field");
  }

  get oneWayReferenceCheckbox(): Locator {
    return this.getByLabel("One-way reference");
  }

  get twoWayReferenceCheckbox(): Locator {
    return this.getByLabel("Two-way reference");
  }

  get nextButton(): Locator {
    return this.getByRole("button", { name: "Next" });
  }

  get confirmButton(): Locator {
    return this.getByRole("button", { name: "Confirm" });
  }

  get previousButton(): Locator {
    return this.getByRole("button", { name: "Previous" });
  }

  get makeFieldRequiredCheckbox(): Locator {
    return this.getByLabel("Make field required");
  }

  get setFieldAsUniqueCheckbox(): Locator {
    return this.getByLabel("Set field as unique");
  }

  get closeButton(): Locator {
    return this.getByLabel("Close", { exact: true });
  }

  // Item reference modal elements
  get referToItemButton(): Locator {
    return this.getByRole("button", { name: "Refer to item" });
  }

  get replaceItemButton(): Locator {
    return this.getByRole("button", { name: "Replace item" });
  }

  // Dynamic selectors
  modelOption(modelText: string): Locator {
    return this.getByText(modelText, { exact: false });
  }

  fieldParagraph(text: string): Locator {
    return this.locator("p").filter({ hasText: text });
  }

  referenceText(text: string): Locator {
    return this.locator("#root").getByText(text);
  }

  tableRows(): Locator {
    return this.locator("tbody > tr:visible");
  }

  rowButton(index: number): Locator {
    return this.getByRole("row").getByRole("button").nth(index);
  }

  clearReferenceButton(): Locator {
    return this.getByRole("button").nth(3);
  }

  async createField(
    fieldType: string,
    displayName: string,
    key?: string,
    description?: string,
  ): Promise<void> {
    await this.fieldTypeButton(fieldType).click();
    await this.displayNameInput.fill(displayName);
    await this.settingsKeyInput.fill(key || displayName);
    if (description) {
      await this.settingsDescriptionInput.fill(description);
    }
    await this.okButton.click();
    await this.closeNotification();
  }

  async setFieldValidation(required = false, unique = false): Promise<void> {
    await this.validationTab.click();
    if (required) {
      await this.requiredFieldCheckbox.check();
    }
    if (unique) {
      await this.uniqueFieldCheckbox.check();
    }
  }

  async deleteField(): Promise<void> {
    await this.deleteFieldButton.click();
    await this.okButton.click();
    await this.closeNotification();
  }
}
