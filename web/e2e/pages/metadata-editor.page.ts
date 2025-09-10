// e2e/pages/metadata-editor.page.ts
import { type Locator } from "@reearth-cms/e2e/fixtures/test";

import { BasePage } from "./base.page";

export class MetadataEditorPage extends BasePage {
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
  
  get displayNameInput(): Locator {
    return this.getByLabel("Display name");
  }
  
  get fieldKeyInput(): Locator {
    return this.getByLabel("Field Key");
  }
  
  get descriptionInput(): Locator {
    return this.getByLabel("Description(optional)");
  }
  
  get supportMultipleValuesCheckbox(): Locator {
    return this.locator("label").filter({ hasText: "Support multiple values" }).locator("span").nth(1);
  }
  
  get useAsTitleCheckbox(): Locator {
    return this.getByLabel("Use as title");
  }
  
  get validationTab(): Locator {
    return this.getByRole("tab", { name: "Validation" });
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
  
  get searchInput(): Locator {
    return this.getByPlaceholder("input search text");
  }
  
  get searchButton(): Locator {
    return this.getByRole("button", { name: "search" });
  }
  
  get okButton(): Locator {
    return this.getByRole("button", { name: "OK" });
  }
  
  // Dynamic selectors
  modelOption(modelText: string): Locator {
    return this.getByText(modelText, { exact: false });
  }
  
  fieldParagraph(text: string): Locator {
    return this.locator("p").filter({ hasText: text });
  }
  
  uniqueFieldIndicator(fieldName: string): Locator {
    return this.locator("p").filter({ hasText: `${fieldName}(unique)` });
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
}