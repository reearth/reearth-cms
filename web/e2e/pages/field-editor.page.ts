/* eslint-disable @typescript-eslint/consistent-type-definitions */
// e2e/pages/field-editor.page.ts
import {
  type EditorSupportedType,
  type ObjectSupportedType,
  SchemaFieldType,
} from "@reearth-cms/components/molecules/Schema/types";
import { type Locator } from "@reearth-cms/e2e/fixtures/test";
import { t } from "@reearth-cms/e2e/support/i18n";
import { DATA_TEST_ID, Test } from "@reearth-cms/test/utils";

import { ProjectScopedPage } from "./project-scoped.page";

// ── Base interface ──
interface CreateFieldBase {
  type: SchemaFieldType;
  name: string;
  key?: string;
  description?: string;
  required?: boolean;
  unique?: boolean;
  multiple?: boolean;
  isTitle?: boolean;
  metadata?: boolean;
}

// ── Text-like bases (Text, TextArea, MarkdownText) ──
interface CreateTextFieldBase extends CreateFieldBase {
  maxLength?: number;
  multiple?: false;
  defaultValue?: string;
}
interface CreateTextFieldBaseMulti extends CreateFieldBase {
  maxLength?: number;
  multiple: true;
  defaultValue?: string[];
}

// ── Number-like bases (Integer, Number) ──
interface CreateNumberFieldBase extends CreateFieldBase {
  min?: number;
  max?: number;
  multiple?: false;
  defaultValue?: string;
}
interface CreateNumberFieldBaseMulti extends CreateFieldBase {
  min?: number;
  max?: number;
  multiple: true;
  defaultValue?: string[];
}

// ── Individual types ──
// Text
interface CreateTextField extends CreateTextFieldBase {
  type: typeof SchemaFieldType.Text;
}
interface CreateTextFieldMulti extends CreateTextFieldBaseMulti {
  type: typeof SchemaFieldType.Text;
}
// TextArea
interface CreateTextAreaField extends CreateTextFieldBase {
  type: typeof SchemaFieldType.TextArea;
}
interface CreateTextAreaFieldMulti extends CreateTextFieldBaseMulti {
  type: typeof SchemaFieldType.TextArea;
}
// MarkdownText
interface CreateMarkdownTextField extends CreateTextFieldBase {
  type: typeof SchemaFieldType.MarkdownText;
}
interface CreateMarkdownTextFieldMulti extends CreateTextFieldBaseMulti {
  type: typeof SchemaFieldType.MarkdownText;
}
// URL
interface CreateURLField extends CreateFieldBase {
  type: typeof SchemaFieldType.URL;
  multiple?: false;
  defaultValue?: string;
}
interface CreateURLFieldMulti extends CreateFieldBase {
  type: typeof SchemaFieldType.URL;
  multiple: true;
  defaultValue?: string[];
}
// Asset
interface CreateAssetField extends CreateFieldBase {
  type: typeof SchemaFieldType.Asset;
  multiple?: false;
  defaultValue?: string;
}
interface CreateAssetFieldMulti extends CreateFieldBase {
  type: typeof SchemaFieldType.Asset;
  multiple: true;
  defaultValue?: string[];
}
// Integer
interface CreateIntegerField extends CreateNumberFieldBase {
  type: typeof SchemaFieldType.Integer;
}
interface CreateIntegerFieldMulti extends CreateNumberFieldBaseMulti {
  type: typeof SchemaFieldType.Integer;
}
// Number
interface CreateNumberField extends CreateNumberFieldBase {
  type: typeof SchemaFieldType.Number;
}
interface CreateNumberFieldMulti extends CreateNumberFieldBaseMulti {
  type: typeof SchemaFieldType.Number;
}
// Bool
interface CreateBoolField extends CreateFieldBase {
  type: typeof SchemaFieldType.Bool;
  multiple?: false;
  defaultValue?: boolean;
}
interface CreateBoolFieldMulti extends CreateFieldBase {
  type: typeof SchemaFieldType.Bool;
  multiple: true;
  defaultValue?: boolean[];
}
// Checkbox
interface CreateCheckboxField extends CreateFieldBase {
  type: typeof SchemaFieldType.Checkbox;
  multiple?: false;
  defaultValue?: boolean;
}
interface CreateCheckboxFieldMulti extends CreateFieldBase {
  type: typeof SchemaFieldType.Checkbox;
  multiple: true;
  defaultValue?: boolean[];
}
// Date
interface CreateDateField extends CreateFieldBase {
  type: typeof SchemaFieldType.Date;
  multiple?: false;
  defaultValue?: string;
}
interface CreateDateFieldMulti extends CreateFieldBase {
  type: typeof SchemaFieldType.Date;
  multiple: true;
  defaultValue?: string[];
}
// Select
interface CreateSelectField extends CreateFieldBase {
  type: typeof SchemaFieldType.Select;
  values: string[];
  multiple?: false;
  defaultValue?: string;
}
interface CreateSelectFieldMulti extends CreateFieldBase {
  type: typeof SchemaFieldType.Select;
  values: string[];
  multiple: true;
  defaultValue?: string[];
}
// Tag
interface CreateTagField extends CreateFieldBase {
  type: typeof SchemaFieldType.Tag;
  tags?: string[];
  multiple?: false;
  defaultValue?: string;
}
interface CreateTagFieldMulti extends CreateFieldBase {
  type: typeof SchemaFieldType.Tag;
  tags?: string[];
  multiple: true;
  defaultValue?: string[];
}
// GeometryObject
interface CreateGeometryObjectField extends CreateFieldBase {
  type: typeof SchemaFieldType.GeometryObject;
  supportedTypes?: ObjectSupportedType[];
  multiple?: false;
  defaultValue?: string;
}
interface CreateGeometryObjectFieldMulti extends CreateFieldBase {
  type: typeof SchemaFieldType.GeometryObject;
  supportedTypes?: ObjectSupportedType[];
  multiple: true;
  defaultValue?: string[];
}
// GeometryEditor
interface CreateGeometryEditorField extends CreateFieldBase {
  type: typeof SchemaFieldType.GeometryEditor;
  supportedTypes?: EditorSupportedType[];
  multiple?: false;
  defaultValue?: string;
}
interface CreateGeometryEditorFieldMulti extends CreateFieldBase {
  type: typeof SchemaFieldType.GeometryEditor;
  supportedTypes?: EditorSupportedType[];
  multiple: true;
  defaultValue?: string[];
}

// ── Unions ──
type CreateFieldOptionsSingle =
  | CreateTextField
  | CreateTextAreaField
  | CreateMarkdownTextField
  | CreateURLField
  | CreateAssetField
  | CreateIntegerField
  | CreateNumberField
  | CreateBoolField
  | CreateCheckboxField
  | CreateDateField
  | CreateSelectField
  | CreateTagField
  | CreateGeometryObjectField
  | CreateGeometryEditorField;

type CreateFieldOptionsMulti =
  | CreateTextFieldMulti
  | CreateTextAreaFieldMulti
  | CreateMarkdownTextFieldMulti
  | CreateURLFieldMulti
  | CreateAssetFieldMulti
  | CreateIntegerFieldMulti
  | CreateNumberFieldMulti
  | CreateBoolFieldMulti
  | CreateCheckboxFieldMulti
  | CreateDateFieldMulti
  | CreateSelectFieldMulti
  | CreateTagFieldMulti
  | CreateGeometryObjectFieldMulti
  | CreateGeometryEditorFieldMulti;

export type CreateFieldOptions = CreateFieldOptionsSingle | CreateFieldOptionsMulti;

// ── Reference & Group ──
export interface CreateReferenceFieldOptions {
  modelName: string;
  name: string;
  key?: string;
  description?: string;
  required?: boolean;
  unique?: boolean;
}

export interface CreateGroupFieldOptions {
  groupName: string;
  name: string;
  key?: string;
  description?: string;
}

export interface EditFieldOptions {
  type: SchemaFieldType;
  metadata?: boolean;
  name?: string;
  key?: string;
  description?: string;
  multiple?: boolean;
  isTitle?: boolean;
  required?: boolean;
  unique?: boolean;
  maxLength?: number;
  min?: number;
  max?: number;
  addDefaultValues?: (string | boolean)[];
}

export class FieldEditorPage extends ProjectScopedPage {
  // Field form elements
  public get displayNameInput(): Locator {
    return this.getByTestId(DATA_TEST_ID.FieldModal__DisplayNameInput);
  }
  public get fieldKeyInput(): Locator {
    return this.getByTestId(DATA_TEST_ID.FieldModal__FieldKeyInput);
  }
  public get descriptionInput(): Locator {
    return this.getByTestId(DATA_TEST_ID.FieldModal__DescriptionInput);
  }

  // Tabs
  public get settingsTab(): Locator {
    return this.getByRole("tab", { name: t("Settings") });
  }

  public get defaultValueTab(): Locator {
    return this.getByRole("tab", { name: t("Default value") });
  }

  public get validationTab(): Locator {
    return this.getByRole("tab", { name: t("Validation") });
  }

  // Default value tab
  public get setDefaultValueInput(): Locator {
    return this.getByTestId(DATA_TEST_ID.FieldModal__SetDefaultValueInput);
  }

  // Validation tab
  public get maxLengthInput(): Locator {
    return this.getByTestId(DATA_TEST_ID.FieldModal__MaxLengthInput);
  }
  public get requiredFieldCheckbox(): Locator {
    return this.getByTestId(DATA_TEST_ID.FieldModal__RequiredCheckbox);
  }
  public get uniqueFieldCheckbox(): Locator {
    return this.getByTestId(DATA_TEST_ID.FieldModal__UniqueCheckbox);
  }
  public get minValueInput(): Locator {
    return this.getByTestId(DATA_TEST_ID.FieldModal__MinValueInput);
  }
  public get maxValueInput(): Locator {
    return this.getByTestId(DATA_TEST_ID.FieldModal__MaxValueInput);
  }

  // Field options
  public get supportMultipleValuesCheckbox(): Locator {
    return this.getByTestId(DATA_TEST_ID.FieldModal__MultipleCheckbox);
  }
  public get useAsTitleCheckbox(): Locator {
    return this.getByTestId(DATA_TEST_ID.FieldModal__IsTitleCheckbox);
  }

  // Default value specific
  public get plusNewButton(): Locator {
    return this.page.locator(`[data-testid="${DATA_TEST_ID.FieldModal__PlusNewButton}"]:visible`);
  }

  // Textbox helpers
  public textboxByIndex(index: number): Locator {
    return this.getByRole("textbox").nth(index);
  }

  public get firstTextbox(): Locator {
    return this.getByRole("textbox").first();
  }

  public get defaultValueInput(): Locator {
    return this.getByTestId(DATA_TEST_ID.FieldModal__SetDefaultValueInput);
  }

  // Validation labels (same element as checkbox — Ant Design Checkbox renders a <label> wrapper)
  public get makeFieldRequiredLabel(): Locator {
    return this.getByTestId(DATA_TEST_ID.FieldModal__RequiredCheckbox);
  }

  public get setFieldAsUniqueLabel(): Locator {
    return this.getByTestId(DATA_TEST_ID.FieldModal__UniqueCheckbox);
  }

  // Multiple value controls
  public get arrowDownButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.MultiValueField__ArrowDownButton);
  }

  // Option field specific
  public get valuesInput(): Locator {
    return this.getByTestId(DATA_TEST_ID.FieldModal__ValuesInput);
  }

  public get deleteButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.MultiValueField__DeleteButton);
  }

  public get setOptionsLabel(): Locator {
    return this.getByLabel(t("Set Options"));
  }

  public get selectValueItem(): Locator {
    return this.getByTestId(DATA_TEST_ID.FieldModal__SelectValueItem);
  }

  public get groupSelectTrigger(): Locator {
    return this.getByTestId(DATA_TEST_ID.Schema__GroupSelect);
  }

  public get tagSelectTrigger(): Locator {
    return this.getByTestId(DATA_TEST_ID.FieldModal__TagSelect);
  }

  public get updateOptionLabel(): Locator {
    return this.getByLabel("Update Option");
  }

  // Dynamic methods for options

  public optionDiv(optionText: string): Locator {
    return this.getByTitle(optionText).locator("div");
  }

  // Asset field specific
  public get assetButton(): Locator {
    return this.getByRole("button", { name: t("Asset") });
  }

  public get uploadAssetButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.AssetList__UploadButton);
  }

  public get urlTab(): Locator {
    return this.getByRole("tab", { name: "URL" });
  }

  public get urlInput(): Locator {
    return this.getByTestId(DATA_TEST_ID.UploadModal__UrlInput);
  }

  public get uploadAndLinkButton(): Locator {
    return this.getByRole("button", { name: t("Upload and Link") });
  }

  public get antTableRow(): Locator {
    return this.getByTestId(DATA_TEST_ID.LinkAssetModal__Table).locator("tbody tr.ant-table-row");
  }

  public get linkAssetButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.LinkAssetModal__LinkButton);
  }

  public get arrowUpButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.MultiValueField__ArrowUpButton);
  }

  public get defaultValueLabel(): Locator {
    return this.getByLabel(t("Default value"));
  }

  // Dynamic asset button methods
  public folderButton(filename: string): Locator {
    return this.getByRole("button", { name: `folder ${filename}` });
  }

  public filenameButton(filename: string): Locator {
    return this.getByRole("button", { name: filename, exact: true });
  }

  // Tag metadata specific
  public get tagFilterDiv(): Locator {
    return this.getByRole("tabpanel", { name: "settings" })
      .locator("div")
      .filter({ hasText: /^Tag$/ });
  }

  public get lastTextbox(): Locator {
    return this.getByRole("textbox").last();
  }

  public get defaultValueExactLabel(): Locator {
    return this.getByLabel(t("Default value"), { exact: true });
  }

  public get updateTagLabel(): Locator {
    return this.getByLabel("Update Tag");
  }

  // Dynamic tag selection methods
  public tagOptionText(tagName: string): Locator {
    return this.getByText(tagName);
  }

  // Field type selection
  public fieldTypeButton(fileType: SchemaFieldType): Locator {
    return this.getByTestId(Test.getDataTestIdFromSchemaFieldType(fileType));
  }

  // Switch elements by index
  public switchByIndex(index: number): Locator {
    return this.getByRole("switch").nth(index);
  }

  public get firstSwitch(): Locator {
    return this.getByRole("switch").first();
  }

  // Checkbox elements by index
  public checkboxByIndex(index: number): Locator {
    return this.getByRole("checkbox").nth(index);
  }

  public get firstCheckbox(): Locator {
    return this.getByRole("checkbox").first();
  }

  // Markdown preview
  public get lastColumn(): Locator {
    return this.getByTestId(DATA_TEST_ID.Markdown__Preview);
  }

  // Multi-value text fields
  public get firstTextContainer(): Locator {
    return this.getByTestId(DATA_TEST_ID.MultiValueField__ItemWrapper).first();
  }

  public get secondTextContainer(): Locator {
    return this.getByTestId(DATA_TEST_ID.MultiValueField__ItemWrapper).nth(1);
  }

  // Field ordering controls
  public arrowUpButtonByIndex(index: number): Locator {
    return this.getByTestId(DATA_TEST_ID.MultiValueField__ArrowUpButton).nth(index);
  }

  public get firstArrowDownButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.MultiValueField__ArrowDownButton).first();
  }

  // Default value input by index
  public defaultValueInputByIndex(index: number): Locator {
    return this.getByTestId(DATA_TEST_ID.FieldModal__SetDefaultValueInput).nth(index);
  }

  // Title helpers
  public titleByText(title: string, exact = false): Locator {
    return this.getByTitle(title, { exact });
  }

  // Fields container paragraph
  public get fieldsContainerParagraph(): Locator {
    return this.getByLabel("Fields").getByRole("paragraph");
  }

  // Field management
  public get ellipsisMenuButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.Schema__FieldEllipsisButton);
  }
  public get ellipsisButton(): Locator {
    return this.getByRole("button", { name: "ellipsis" });
  }

  // Schema navigation
  public get metaDataTab(): Locator {
    return this.getByRole("tab", { name: t("Meta Data") });
  }

  // Menu items
  public menuItemByName(name: string): Locator {
    return this.getByRole("menuitem", { name });
  }

  // Dynamic field labeling
  public fieldText(fieldName: string, key: string): Locator {
    return this.getByText(`${fieldName}#${key}`);
  }

  // Column headers
  public columnHeaderWithEdit(fieldName: string): Locator {
    return this.getByRole("columnheader", { name: `${fieldName} edit` });
  }

  // Unique field indicators
  public uniqueFieldText(fieldName: string, key: string): Locator {
    return this.getByText(`${fieldName} *#${key}(unique)`);
  }
  public uniqueFieldLabel(fieldName: string): Locator {
    return this.getByText(`${fieldName}(unique)`);
  }

  // Button variations
  public get x3Button(): Locator {
    return this.getByRole("button", { name: "x3" });
  }

  // Tooltip elements
  public get tooltip(): Locator {
    return this.getByRole("tooltip");
  }
  public tooltipTextbox(index?: number): Locator {
    if (typeof index === "number") {
      return this.getByRole("tooltip").getByRole("textbox").nth(index);
    }
    return this.getByRole("tooltip").getByRole("textbox");
  }

  // Title selection helpers
  public titleDiv(date: string): Locator {
    return this.getByTitle(date).locator("div");
  }

  // Field type list item helper
  public fieldTypeListItem(type: string | RegExp): Locator {
    return this.locator("li").filter({ hasText: type }).locator("div").first();
  }

  // Date input
  public get selectDatePlaceholder(): Locator {
    return this.getByTestId(DATA_TEST_ID.FieldModal__DateInput);
  }

  // Geometry field specific
  public get pointCheckbox(): Locator {
    return this.getByTestId(DATA_TEST_ID.FieldModal__PointCheckbox);
  }

  // Code editor elements
  public get viewLinesEditor(): Locator {
    return this.getByTestId(DATA_TEST_ID.GeometryItem__EditorWrapper).locator(".view-lines");
  }

  public get editorContent(): Locator {
    return this.getByLabel("Editor content;Press Alt+F1");
  }

  // Delete field button
  public get deleteFieldButton(): Locator {
    return this.getByLabel("delete").locator("svg");
  }
  public get confirmDeleteFieldButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.ModelFieldList__ConfirmDeleteFieldButton);
  }

  // Reference field specific elements
  public get selectModelToReferenceLabel(): Locator {
    return this.getByLabel(t("Select the model to reference"));
  }

  public get createReferenceFieldLabel(): Locator {
    return this.getByLabel("Create Reference Field");
  }

  public get oneWayReferenceCheckbox(): Locator {
    return this.getByLabel(t("One-way reference"));
  }

  public get twoWayReferenceCheckbox(): Locator {
    return this.getByLabel(t("Two-way reference"));
  }

  public get nextButton(): Locator {
    return this.getByRole("button", { name: t("Next") });
  }

  public get confirmButton(): Locator {
    return this.getByRole("button", { name: t("Confirm") });
  }

  public get previousButton(): Locator {
    return this.getByRole("button", { name: t("Previous") });
  }

  public get closeButton(): Locator {
    return this.getByRole("button", { name: t("Close") });
  }

  // Item reference modal elements
  public get referToItemButton(): Locator {
    return this.getByRole("button", { name: t("Refer to item") });
  }

  public get replaceItemButton(): Locator {
    return this.getByRole("button", { name: t("Replace item") });
  }

  // Dynamic selectors
  public modelOption(modelText: string): Locator {
    return this.getByText(modelText, { exact: false });
  }

  public fieldParagraph(text: string): Locator {
    return this.locator("p").filter({ hasText: text });
  }

  public referenceText(text: string): Locator {
    return this.locator("#root").getByText(text);
  }

  public tableRows(): Locator {
    return this.locator("tbody > tr:visible");
  }

  public rowButton(index: number): Locator {
    return this.getByRole("row").getByRole("button").nth(index);
  }

  public clearReferenceButton(): Locator {
    return this.getByRole("button").nth(3);
  }

  private typeCheckboxByLabel(label: string): Locator {
    return this.getByLabel(label, { exact: true });
  }

  public async createField(options: CreateFieldOptions): Promise<void> {
    this.assertProjectContext();
    if (options.metadata) {
      const supported: SchemaFieldType[] = [
        SchemaFieldType.Text,
        SchemaFieldType.TextArea,
        SchemaFieldType.Bool,
        SchemaFieldType.Checkbox,
        SchemaFieldType.Date,
        SchemaFieldType.Tag,
        SchemaFieldType.URL,
      ];
      if (!supported.includes(options.type)) {
        throw new Error(`metadata: true is not supported for type "${options.type}"`);
      }
    }

    // Select field type
    await this.fieldTypeButton(options.type).click();

    // Fill basic settings
    await this.displayNameInput.fill(options.name);
    if (options.key !== undefined) {
      await this.fieldKeyInput.fill(options.key);
    }
    if (options.description !== undefined) {
      await this.descriptionInput.fill(options.description);
    }

    // Field options
    if (options.multiple) {
      await this.supportMultipleValuesCheckbox.check();
    }
    if (options.isTitle) {
      await this.useAsTitleCheckbox.check();
    }

    // Type-specific settings on Settings tab
    if (
      options.type === SchemaFieldType.GeometryObject &&
      "supportedTypes" in options &&
      options.supportedTypes
    ) {
      for (const st of options.supportedTypes) {
        await this.typeCheckboxByLabel(this.objectSupportedTypeLabel(st)).check();
      }
    }
    if (
      options.type === SchemaFieldType.GeometryEditor &&
      "supportedTypes" in options &&
      options.supportedTypes
    ) {
      for (const st of options.supportedTypes) {
        await this.typeCheckboxByLabel(this.editorSupportedTypeLabel(st)).check();
      }
    }
    if (options.type === SchemaFieldType.Select && "values" in options) {
      for (let i = 0; i < options.values.length; i++) {
        await this.plusNewButton.click();
        await this.valuesInput.nth(i).fill(options.values[i]);
      }
    }
    if (options.type === SchemaFieldType.Tag && "tags" in options && options.tags) {
      for (const tag of options.tags) {
        await this.plusNewButton.click();
        await this.tagFilterDiv.last().click();
        await this.lastTextbox.fill(tag);
      }
    }

    // Validation tab
    const needsValidation =
      options.required ||
      options.unique ||
      ("maxLength" in options && options.maxLength !== undefined) ||
      ("min" in options && options.min !== undefined) ||
      ("max" in options && options.max !== undefined);
    if (needsValidation) {
      await this.validationTab.click();
      if (options.required) await this.requiredFieldCheckbox.check();
      if (options.unique) await this.uniqueFieldCheckbox.check();
      if ("maxLength" in options && options.maxLength !== undefined) {
        await this.maxLengthInput.fill(options.maxLength.toString());
      }
      if ("min" in options && options.min !== undefined) {
        await this.minValueInput.fill(options.min.toString());
      }
      if ("max" in options && options.max !== undefined) {
        await this.maxValueInput.fill(options.max.toString());
      }
    }

    // Default value tab
    if ("defaultValue" in options && options.defaultValue !== undefined) {
      await this.defaultValueTab.click();
      await this.fillDefaultValue(options);
    }

    // Submit
    await this.okButton.click();
    await this.closeNotification();
  }

  public async createReferenceField(options: CreateReferenceFieldOptions): Promise<void> {
    this.assertProjectContext();
    // Select Reference field type
    await this.fieldTypeButton(SchemaFieldType.Reference).click();

    // Select model to reference
    await this.selectModelToReferenceLabel.click();
    await this.modelOption(options.modelName).click();

    // One-way reference (default)
    await this.nextButton.click();

    // Fill field settings
    await this.displayNameInput.fill(options.name);
    if (options.key !== undefined) {
      await this.fieldKeyInput.fill(options.key);
    }
    if (options.description !== undefined) {
      await this.descriptionInput.fill(options.description);
    }

    // Validation
    if (options.required || options.unique) {
      await this.validationTab.click();
      if (options.required) await this.requiredFieldCheckbox.check();
      if (options.unique) await this.uniqueFieldCheckbox.check();
    }

    // Confirm
    await this.confirmButton.click();
    await this.closeNotification();
  }

  public async createGroupField(options: CreateGroupFieldOptions): Promise<void> {
    this.assertProjectContext();
    // Select Group field type
    await this.fieldTypeButton(SchemaFieldType.Group).click();

    // Fill basic settings
    await this.displayNameInput.fill(options.name);
    if (options.key !== undefined) {
      await this.fieldKeyInput.fill(options.key);
    }
    if (options.description !== undefined) {
      await this.descriptionInput.fill(options.description);
    }

    // Select group
    await this.groupSelectTrigger.click();
    await this.getByText(options.groupName).click();

    // Submit
    await this.okButton.click();
    await this.closeNotification();
  }

  public async editField(options: EditFieldOptions): Promise<void> {
    this.assertProjectContext();
    // 1. Open editor
    if (options.metadata) {
      await this.ellipsisButton.click();
    } else {
      await this.ellipsisMenuButton.click();
    }

    // 2. Settings tab for non-metadata editors
    const hasSettings =
      options.name !== undefined ||
      options.key !== undefined ||
      options.description !== undefined ||
      options.multiple ||
      options.isTitle;
    if (!options.metadata && hasSettings) {
      await this.settingsTab.click();
    }

    // 3. Fill basic settings (only provided fields)
    if (options.name !== undefined) await this.displayNameInput.fill(options.name);
    if (options.key !== undefined) {
      await this.fieldKeyInput.fill(options.key);
    }
    if (options.description !== undefined) {
      await this.descriptionInput.fill(options.description);
    }
    if (options.multiple) await this.supportMultipleValuesCheckbox.check();
    if (options.isTitle) await this.useAsTitleCheckbox.check();

    // 4. Validation tab
    const needsValidation =
      options.required ||
      options.unique ||
      options.maxLength !== undefined ||
      options.min !== undefined ||
      options.max !== undefined;
    if (needsValidation) {
      await this.validationTab.click();
      if (options.required) await this.requiredFieldCheckbox.check();
      if (options.unique) await this.uniqueFieldCheckbox.check();
      if (options.maxLength !== undefined)
        await this.maxLengthInput.fill(options.maxLength.toString());
      if (options.min !== undefined) await this.minValueInput.fill(options.min.toString());
      if (options.max !== undefined) await this.maxValueInput.fill(options.max.toString());
    }

    // 5. Default values (add new ones)
    if (options.addDefaultValues?.length) {
      await this.defaultValueTab.click();
      await this.addEditDefaultValues(options.type, options.addDefaultValues);
    }

    // 6. Submit
    await this.okButton.click();
    await this.closeNotification();
  }

  private async fillDefaultValue(options: CreateFieldOptions): Promise<void> {
    if (!("defaultValue" in options) || options.defaultValue === undefined) return;

    const { type, defaultValue } = options;

    switch (type) {
      case SchemaFieldType.Bool:
        if (defaultValue === true) await this.setDefaultValueInput.click();
        break;
      case SchemaFieldType.Checkbox:
        if (defaultValue === true) await this.setDefaultValueInput.click();
        break;
      case SchemaFieldType.Date:
        await this.selectDatePlaceholder.fill(defaultValue as string);
        await this.selectDatePlaceholder.press("Enter");
        break;
      case SchemaFieldType.Select:
        await this.setDefaultValueInput.click();
        await this.optionDiv(defaultValue as string).click();
        break;
      case SchemaFieldType.MarkdownText:
        await this.lastColumn.click();
        await this.setDefaultValueInput.fill(defaultValue as string);
        break;
      case SchemaFieldType.Tag:
        await this.tagSelectTrigger.click();
        await this.tagOptionText(defaultValue as string)
          .last()
          .click();
        break;
      case SchemaFieldType.GeometryObject:
      case SchemaFieldType.GeometryEditor:
        await this.viewLinesEditor.click();
        await this.editorContent.fill(defaultValue as string);
        break;
      default:
        // Text, TextArea, URL, Integer, Number
        await this.setDefaultValueInput.fill(defaultValue as string);
        break;
    }
  }

  private async addEditDefaultValues(
    type: SchemaFieldType,
    values: (string | boolean)[],
  ): Promise<void> {
    for (const value of values) {
      if (type === SchemaFieldType.Tag) {
        await this.tagSelectTrigger.click();
        await this.tagOptionText(value as string)
          .last()
          .click();
        continue;
      }

      await this.plusNewButton.click();

      switch (type) {
        case SchemaFieldType.Bool:
          if (value === true) await this.getByRole("switch").last().click();
          break;
        case SchemaFieldType.Checkbox:
          if (value === true) await this.getByRole("checkbox").last().check();
          break;
        case SchemaFieldType.Date:
          await this.getByRole("textbox")
            .last()
            .fill(value as string);
          await this.getByRole("textbox").last().press("Enter");
          break;
        case SchemaFieldType.GeometryObject:
        case SchemaFieldType.GeometryEditor:
          await this.editorContent.last().fill(value as string);
          break;
        default:
          // Text, TextArea, MarkdownText, URL, Integer, Number
          await this.defaultValueInput.last().fill(value as string);
          break;
      }
    }
  }

  private objectSupportedTypeLabel(type: ObjectSupportedType): string {
    const labels: Record<ObjectSupportedType, string> = {
      POINT: "Point",
      MULTIPOINT: "Multi Point",
      LINESTRING: "Line String",
      MULTILINESTRING: "Multi Line String",
      POLYGON: "Polygon",
      MULTIPOLYGON: "Multi Polygon",
      GEOMETRYCOLLECTION: "Geometry Collection",
    };
    return labels[type];
  }

  private editorSupportedTypeLabel(type: EditorSupportedType): string {
    const labels: Record<EditorSupportedType, string> = {
      POINT: "Point",
      LINESTRING: "Line String",
      POLYGON: "Polygon",
      ANY: "Any",
    };
    return labels[type];
  }

  public async deleteField(): Promise<void> {
    this.assertProjectContext();
    await this.deleteFieldButton.click();
    await this.confirmDeleteFieldButton.click();
    await this.closeNotification();
  }
}
