import { Page, expect } from "@playwright/test";

import { closeNotification } from "@reearth-cms/e2e/common/notification";

// Reference Field Tests
// ======================

// Test Suite: Reference Field Testing
// ===============================

// Test creating and updating Reference fields with basic functionality
export async function OneWayReferenceFieldCreatingAndUpdating(page: Page) {
  // Create reference model for testing
  
  await page.getByRole("button", { name: "plus Add" }).first().click();
  await page.getByLabel("Model name").click();
  await page.getByLabel("Model name").fill("ref model");
  await page.getByLabel("Model key").click();
  await page.getByLabel("Model key").fill("ref-model");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);

  // Add text field to reference model
  await page.locator("li").filter({ hasText: "Text" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("text");
  await page.getByLabel("Use as title").check();
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);

  // Add metadata fields
  await page.getByRole("tab", { name: "Meta Data" }).click();
  await page.locator("li").filter({ hasText: "Boolean" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("boolean");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);

  // Create sample items in reference model
  await page.getByText("Content").click();
  // Create first item
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByLabel("text").click();
  await page.getByLabel("text").fill("text1");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  // Create second item
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByLabel("text").click();
  await page.getByLabel("text").fill("text2");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);

  // Create reference field
  await page.getByText("Schema").click();
  await page.getByText("e2e model name").click();
  await page.locator("li").filter({ hasText: "Reference" }).locator("div").first().click();

  // Configure reference field settings
  await page.getByLabel("Select the model to reference").click();
  await expect(page.getByText("e2e model name #e2e-model-key")).toBeVisible();
  await expect(page.getByText("ref model #ref-model")).toBeVisible();
  await page.getByText("ref model #ref-model").click();

  // Verify and set reference type
  await expect(page.getByLabel("One-way reference")).toBeChecked();
  await page.getByRole("button", { name: "Next" }).click();

  // Configure field properties
  await expect(page.getByRole("button", { name: "Confirm" })).toBeDisabled();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("ref");
  await page.getByLabel("Description(optional)").click();
  await page.getByLabel("Description(optional)").fill("ref description");

  // Verify field constraints
  await expect(
    page.locator("label").filter({ hasText: "Support multiple values" }).locator("span").nth(1),
  ).toBeDisabled();
  await expect(page.getByLabel("Use as title")).toBeHidden();

  // Set validation rules
  await page.getByRole("tab", { name: "Validation" }).click();
  await page.getByLabel("Make field required").check();
  await page.getByLabel("Set field as unique").check();
  await page.getByRole("button", { name: "Confirm" }).click();
  await closeNotification(page);
  await expect(page.getByLabel("Fields").getByRole("paragraph")).toContainText("ref *#ref(unique)");
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  await expect(page.getByText("ref model #ref-model")).toBeVisible();
  await expect(page.getByLabel("Select the model to reference")).toBeDisabled();
  await expect(
    page.locator("label").filter({ hasText: "One-way reference" }).locator("span").first(),
  ).toBeDisabled();
  await expect(
    page.locator("label").filter({ hasText: "Two-way reference" }).locator("span").first(),
  ).toBeDisabled();
  await expect(page.getByRole("button", { name: "Next" })).toBeEnabled();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("button", { name: "Confirm" })).toBeDisabled();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("reff");
  await expect(page.getByRole("button", { name: "Confirm" })).toBeEnabled();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("ref");
  await expect(page.getByRole("button", { name: "Confirm" })).toBeDisabled();
  await page.getByLabel("Close", { exact: true }).first().click();
  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("ref");
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.locator("p").filter({ hasText: "ref(unique)" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Refer to item" })).toBeVisible();
  await expect(page.getByText("ref description")).toBeVisible();

  await page.getByRole("button", { name: "Refer to item" }).click();
  await expect(page.locator("tbody > tr:visible")).toHaveCount(2);

  await expect(page.getByText("text1")).toBeVisible();
  await expect(page.getByText("text2")).toBeVisible();
  await page.getByPlaceholder("input search text").click();
  await page.getByPlaceholder("input search text").fill("1");
  await page.getByRole("button", { name: "search" }).click();
  await expect(page.getByText("text1")).toBeVisible();
  await expect(page.getByText("text2")).toBeHidden();
  await page.getByRole("row").getByRole("button").nth(0).hover();
  await page.getByRole("row").getByRole("button").nth(0).click();
  await expect(page.locator("#root").getByText("text1")).toBeVisible();
  await page.getByRole("button").nth(3).click();
  await expect(page.locator("#root").getByText("text1")).toBeHidden();
  await page.getByRole("button", { name: "Refer to item" }).click();
  await expect(page.getByText("text1")).toBeVisible();
  await expect(page.getByText("text2")).toBeVisible();
  await page.getByRole("row").getByRole("button").nth(0).hover();
  await page.getByRole("row").getByRole("button").nth(0).click();
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await expect(page.getByRole("cell", { name: "text1" }).locator("span").first()).toBeVisible();
  await page.getByRole("cell").getByLabel("edit").locator("svg").click();
  await expect(page.locator("#root").getByText("text1")).toBeVisible();
  await page.getByRole("button", { name: "Replace item" }).click();
  await page.getByRole("row").getByRole("button").nth(1).hover();
  await page.getByRole("row").getByRole("button").nth(1).click();
  await expect(page.locator("#root").getByText("text2")).toBeVisible();
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await expect(page.getByRole("cell", { name: "text2" }).locator("span").first()).toBeVisible();
}

// Test creating and updating two-way reference fields
export async function TwoWayReferenceFieldCreatingAndUpdating(page: Page) {
  // Create reference model
  await page.getByRole("button", { name: "plus Add" }).first().click();
  await page.getByLabel("Model name").click();
  await page.getByLabel("Model name").fill("ref model");
  await page.getByLabel("Model key").click();
  await page.getByLabel("Model key").fill("ref-model");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);

  // Wait for text field to be visible before clicking
  
  const textField = page.locator("li").filter({ hasText: "Text" }).locator("div").first();
  await expect(textField).toBeVisible();
  await textField.click();

  // Add text field to reference model
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("text");
  await page.getByLabel("Use as title").check();
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);

  // Create sample items in reference model
  await page.getByText("Content").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByLabel("text").click();
  await page.getByLabel("text").fill("reference text1");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByLabel("text").click();
  await page.getByLabel("text").fill("reference text2");
  await page.getByRole("button", { name: "Save" }).click();

  // Create reference field
  await page.getByText("Schema").click();
  await page.getByText("e2e model name").click();
  await page.locator("li").filter({ hasText: "Text" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("text");
  await page.getByLabel("Use as title").check();
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await page.locator("li").filter({ hasText: "Reference" }).locator("div").first().click();
  await page.getByLabel("Select the model to reference").click();
  await page.getByText("ref model #ref-model").click();
  await page.getByLabel("Two-way reference").check();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("button", { name: "Next" })).toBeDisabled();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("ref1");
  await expect(page.getByRole("button", { name: "Next" })).toBeEnabled();
  await page.getByLabel("Description(optional)").click();
  await page.getByLabel("Description(optional)").fill("ref1 description");
  await expect(
    page.locator("label").filter({ hasText: "Support multiple values" }).locator("span").nth(1),
  ).toBeDisabled();
  await expect(page.getByLabel("Use as title")).toBeHidden();
  await page.getByRole("tab", { name: "Validation" }).click();
  await page.getByLabel("Make field required").check();
  await expect(
    page.locator("label").filter({ hasText: "Set field as unique" }).locator("span").nth(1),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Next" }).click();

  await expect(page.getByRole("button", { name: "Confirm" })).toBeDisabled();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("ref2");
  await expect(page.getByRole("button", { name: "Confirm" })).toBeEnabled();
  await page.getByLabel("Description(optional)").click();
  await page.getByLabel("Description(optional)").fill("ref2 description");
  await page.getByRole("tab", { name: "Validation" }).click();
  await page.getByLabel("Make field required").check();
  await page.getByRole("button", { name: "Previous" }).click();
  await expect(page.getByLabel("Display name")).toHaveValue("ref1");
  await expect(page.getByLabel("Field Key")).toHaveValue("ref1");
  await expect(page.getByLabel("Description(optional)")).toHaveValue("ref1 description");
  await page.getByRole("tab", { name: "Validation" }).click();
  await expect(page.getByLabel("Make field required")).toBeChecked();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByLabel("Display name")).toHaveValue("ref2");
  await expect(page.getByLabel("Field Key")).toHaveValue("ref2");
  await expect(page.getByLabel("Description(optional)")).toHaveValue("ref2 description");
  await page.getByRole("tab", { name: "Validation" }).click();
  await expect(page.getByLabel("Make field required")).toBeChecked();
  await page.getByRole("button", { name: "Confirm" }).click();
  await closeNotification(page);

  await expect(page.getByLabel("Fields")).toContainText("ref1 *#ref1");
  await page.locator("li").filter({ hasText: "ref1 *#ref1" }).locator("svg").nth(3).click();
  await expect(page.getByText("ref model #ref-model")).toBeVisible();
  await expect(page.getByLabel("Select the model to reference")).toBeDisabled();
  await expect(
    page.locator("label").filter({ hasText: "One-way reference" }).locator("span").first(),
  ).toBeDisabled();
  await expect(
    page.locator("label").filter({ hasText: "Two-way reference" }).locator("span").first(),
  ).toBeDisabled();
  await expect(page.getByRole("button", { name: "Next" })).toBeEnabled();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("button", { name: "Next" })).toBeEnabled();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("button", { name: "Confirm" })).toBeDisabled();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("reff");
  await expect(page.getByRole("button", { name: "Confirm" })).toBeEnabled();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("ref2");
  await expect(page.getByRole("button", { name: "Confirm" })).toBeDisabled();
  await page.getByRole("button", { name: "Previous" }).click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("reff");
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("button", { name: "Confirm" })).toBeEnabled();
  await page.getByRole("button", { name: "Previous" }).click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("ref1");
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("button", { name: "Confirm" })).toBeDisabled();
  await page.getByLabel("Close", { exact: true }).first().click();
  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("ref1");
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.locator("p").filter({ hasText: "ref1" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Refer to item" })).toBeVisible();
  await expect(page.getByText("ref1 description")).toBeVisible();
  await page.getByLabel("text").click();
  await page.getByLabel("text").fill("text1");
  await page.getByRole("button", { name: "Refer to item" }).click();
  await expect(page.getByText("reference text1")).toBeVisible();
  await expect(page.getByText("reference text2")).toBeVisible();
  await page.getByRole("row").getByRole("button").nth(0).hover();
  await page.getByRole("row").getByRole("button").nth(0).click();
  await expect(page.locator("#root").getByText("reference text1")).toBeVisible();
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();

  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByLabel("text").click();
  await page.getByLabel("text").fill("text2");
  await page.getByRole("button", { name: "Refer to item" }).click();
  await page.getByRole("row").getByRole("button").nth(1).hover();
  await page.getByRole("row").getByRole("button").nth(1).click();
  await expect(page.locator("#root").getByText("reference text2")).toBeVisible();
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();

  await expect(
    page.getByRole("cell", { name: "reference text1" }).locator("span").first(),
  ).toBeVisible();
  await expect(
    page.getByRole("cell", { name: "reference text2" }).locator("span").first(),
  ).toBeVisible();
  await page.getByText("ref model").click();
  await expect(page.locator("thead")).toContainText("ref2");
  await expect(
    page.getByRole("cell", { name: "text1", exact: true }).locator("span").first(),
  ).toBeVisible();
  await expect(
    page.getByRole("cell", { name: "text2", exact: true }).locator("span").first(),
  ).toBeVisible();
  await page.getByRole("cell").getByLabel("edit").locator("svg").first().click();
  await page.getByRole("button", { name: "Refer to item" }).click();
  await page.getByRole("row").getByRole("button").nth(0).hover();
  await page.getByRole("row").getByRole("button").nth(0).click();
  await page.getByRole("button", { name: "OK" }).click();
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await expect(
    page.getByRole("cell", { name: "text1", exact: true }).locator("span").first(),
  ).toBeVisible();
  await expect(
    page.getByRole("cell", { name: "text2", exact: true }).locator("span").first(),
  ).toBeHidden();

  await page.getByText("e2e model name").click();
  await expect(
    page.getByRole("cell", { name: "reference text1", exact: true }).locator("span").first(),
  ).toBeHidden();
  await expect(
    page.getByRole("cell", { name: "reference text2", exact: true }).locator("span").first(),
  ).toBeVisible();
}

// Text Field Tests
// =================

// Test Suite: Text Field Testing
// ===========================

// Test creating and updating Text fields with basic functionality
export async function TextFieldCreatingAndUpdating(page: Page) {
  // Create new Text field with basic settings
  await page.locator("li").filter({ hasText: "Text" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("text1");
  await page.getByLabel("Settings").locator("#key").click();
  await page.getByLabel("Settings").locator("#key").fill("text1");
  await page.getByLabel("Settings").locator("#description").click();
  await page.getByLabel("Settings").locator("#description").fill("text1 description");
  await page.getByRole("tab", { name: "Default value" }).click();
  await page.getByLabel("Set default value").click();
  await page.getByLabel("Set default value").fill("text1 default value");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await expect(page.getByText("text1#text1")).toBeVisible();
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  await expect(page.getByLabel("Display name")).toBeVisible();
  await expect(page.getByLabel("Display name")).toHaveValue("text1");
  await expect(page.getByLabel("Settings").locator("#key")).toHaveValue("text1");
  await expect(page.getByLabel("Settings").locator("#description")).toHaveValue(
    "text1 description",
  );
  await expect(page.getByLabel("Support multiple values")).not.toBeChecked();
  await expect(page.getByLabel("Use as title")).not.toBeChecked();
  await page.getByRole("tab", { name: "Validation" }).click();
  await expect(page.getByLabel("Set maximum length")).toBeEmpty();
  await expect(page.getByLabel("Make field required")).not.toBeChecked();
  await expect(page.getByLabel("Set field as unique")).not.toBeChecked();
  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByLabel("Set default value")).toHaveValue("text1 default value");
  await page.getByRole("button", { name: "Cancel" }).click();
  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("text1");
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.locator("label")).toContainText("text1");
  await page.getByText("text1 description").click();
  await expect(page.getByRole("main")).toContainText("text1 description");
  await expect(page.getByLabel("text1")).toHaveValue("text1 default value");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await expect(page.locator("tbody")).toContainText("text1 default value");
  await page.getByText("Schema").click();
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  await page.getByLabel("Support multiple values").check();
  await page.getByLabel("Use as title").check();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("new text1");
  await page.getByLabel("Field Key").click();
  await page.getByLabel("Field Key").fill("new-text1");
  await page.getByLabel("Description(optional)").click();
  await page.getByLabel("Description(optional)").fill("new text1 description");
  await page.getByRole("tab", { name: "Validation" }).click();
  await page.getByLabel("Set maximum length").click();
  await page.getByLabel("Set maximum length").fill("5");
  await page.getByLabel("Make field required").check();
  await page.getByLabel("Set field as unique").check();
  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByLabel("Set default value")).toHaveValue("text1 default value");
  await page.getByRole("button", { name: "plus New" }).click();
  await page.locator("#defaultValue").nth(1).click();
  await page.locator("#defaultValue").nth(1).fill("text2");
  await page.locator("#defaultValue").nth(0).click();
  await page.locator("#defaultValue").nth(0).fill("text1");
  await page.getByRole("button", { name: "arrow-down" }).first().click();
  await expect(page.locator("#defaultValue").nth(1)).toHaveValue("text1");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await expect(page.getByText("new text1 *#new-text1(unique)")).toBeVisible();
  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("new text1");
  await expect(page.getByRole("cell", { name: "text1 default value" })).toBeVisible();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.getByText("new text1(unique)")).toBeVisible();
  await page.getByText("new text1 description").click();
  await expect(page.getByText("new text1 description")).toBeVisible();
  await expect(page.getByLabel("new text1(unique)")).toHaveValue("text2");
  await expect(page.getByRole("textbox").nth(1)).toHaveValue("text1");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "x2" }).click();
  await expect(page.getByRole("main")).toContainText("new text1text2text1");
  await page.getByRole("cell", { name: "edit" }).nth(1).click();
  await expect(page.getByText("new text1(unique)")).toBeVisible();
  await page.getByRole("button", { name: "delete" }).first().click();
  await expect(page.getByText("Please input field!")).toBeVisible();
  await page.getByRole("button", { name: "plus New" }).click();
  await expect(page.getByText("/ 5")).toBeVisible();
  await expect(page.getByRole("button", { name: "Save" })).toBeDisabled();
  await page.getByRole("textbox").nth(0).click();
  await page.getByRole("textbox").nth(0).fill("text");
  await page.getByRole("button", { name: "plus New" }).click();
  await page.getByRole("textbox").nth(1).click();
  await page.getByRole("textbox").nth(1).fill("text2");
  await page.getByRole("button", { name: "arrow-up" }).nth(1).click();
  await expect(page.getByRole("textbox").nth(0)).toHaveValue("text2");
  await expect(page.getByRole("textbox").nth(1)).toHaveValue("text");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "x2" }).nth(1).click();
  await expect(page.getByRole("main")).toContainText("new text1text2text");
}
// Textarea Field Tests
// =====================

// Test Suite: Textarea Field Testing
// ==============================

// Test creating and updating Textarea fields with basic functionality
export async function TextareaFieldCreatingAndUpdating(page: Page) {
  // Create new Textarea field with basic settings

  await page.locator("li").filter({ hasText: "TextArea" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("text1");
  await page.getByLabel("Settings").locator("#key").click();
  await page.getByLabel("Settings").locator("#key").fill("text1");
  await page.getByLabel("Settings").locator("#description").click();
  await page.getByLabel("Settings").locator("#description").fill("text1 description");
  await page.getByRole("tab", { name: "Default value" }).click();
  await page.getByLabel("Set default value").click();
  await page.getByLabel("Set default value").fill("text1 default value");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await expect(page.getByText("text1#text1")).toBeVisible();
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  await expect(page.getByLabel("Display name")).toBeVisible();
  await expect(page.getByLabel("Display name")).toHaveValue("text1");
  await expect(page.getByLabel("Settings").locator("#key")).toHaveValue("text1");
  await expect(page.getByLabel("Settings").locator("#description")).toHaveValue(
    "text1 description",
  );
  await expect(page.getByLabel("Support multiple values")).not.toBeChecked();
  await expect(page.getByLabel("Use as title")).not.toBeChecked();
  await page.getByRole("tab", { name: "Validation" }).click();
  await expect(page.getByLabel("Set maximum length")).toBeEmpty();
  await expect(page.getByLabel("Make field required")).not.toBeChecked();
  await expect(page.getByLabel("Set field as unique")).not.toBeChecked();
  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByLabel("Set default value")).toHaveValue("text1 default value");
  await page.getByRole("button", { name: "Cancel" }).click();
  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("text1");
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.locator("label")).toContainText("text1");
  await page.getByText("text1 description").click();
  await expect(page.getByRole("main")).toContainText("text1 description");
  await expect(page.getByLabel("text1")).toHaveValue("text1 default value");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await page.locator(".ant-table-row > td:nth-child(9)").getByRole("button").click();
  await expect(page.getByRole("tooltip")).toContainText("text1text1 default value");
  await page.getByText("Schema").click();
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  await page.getByLabel("Support multiple values").check();
  await page.getByLabel("Use as title").check();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("new text1");
  await page.getByLabel("Field Key").click();
  await page.getByLabel("Field Key").fill("new-text1");
  await page.getByLabel("Description(optional)").click();
  await page.getByLabel("Description(optional)").fill("new text1 description");
  await page.getByRole("tab", { name: "Validation" }).click();
  await page.getByLabel("Set maximum length").click();
  await page.getByLabel("Set maximum length").fill("5");
  await page.getByLabel("Make field required").check();
  await page.getByLabel("Set field as unique").check();
  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByLabel("Set default value")).toHaveValue("text1 default value");
  await page.getByRole("button", { name: "plus New" }).click();
  await page.locator("#defaultValue").nth(1).click();
  await page.locator("#defaultValue").nth(1).fill("text2");
  await page.locator("#defaultValue").nth(0).click();
  await page.locator("#defaultValue").nth(0).fill("text1");
  await page.getByRole("button", { name: "arrow-down" }).first().click();
  await expect(page.locator("#defaultValue").nth(1)).toHaveValue("text1");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await expect(page.getByText("new text1 *#new-text1(unique)")).toBeVisible();
  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("new text1");
  await page.locator(".ant-table-row > td:nth-child(9)").getByRole("button").click();
  await expect(page.getByRole("tooltip")).toContainText("text1text1 default value");
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.getByText("new text1(unique)")).toBeVisible();
  await page.getByText("new text1 description").click();
  await expect(page.getByText("new text1 description")).toBeVisible();
  await expect(page.getByRole("textbox").nth(0)).toHaveValue("text2");
  await expect(page.getByRole("textbox").nth(1)).toHaveValue("text1");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "x2" }).click();
  await expect(page.getByRole("main")).toContainText("new text1text2text1");
  await page.getByRole("cell", { name: "edit" }).nth(1).click();
  await expect(page.getByText("new text1(unique)")).toBeVisible();
  await page.getByRole("button", { name: "delete" }).first().click();
  await expect(page.getByText("Please input field!")).toBeVisible();
  await page.getByRole("button", { name: "plus New" }).click();
  await expect(page.getByRole("button", { name: "Save" })).toBeDisabled();
  await page.getByRole("textbox").nth(0).click();
  await page.getByRole("textbox").nth(0).fill("text");
  await page.getByRole("button", { name: "plus New" }).click();
  await page.getByRole("textbox").nth(1).click();
  await page.getByRole("textbox").nth(1).fill("text2");
  await page.getByRole("button", { name: "arrow-up" }).nth(1).click();
  await expect(page.getByRole("textbox").nth(0)).toHaveValue("text2");
  await expect(page.getByRole("textbox").nth(1)).toHaveValue("text");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "x2" }).nth(1).click();
  await expect(page.getByRole("main")).toContainText("new text1text2text");
}

// Text Metadata Tests
// ==================

// Test Suite: Text Metadata Testing
// ==============================

// Test creating and updating Text metadata fields with basic functionality
export async function TextMetadataCreatingAndUpdating(page: Page) {
  await page.getByRole("tab", { name: "Meta Data" }).click();
  await expect(page.getByText("Item Information")).toBeVisible();
  await expect(page.getByText("Publish Status")).toBeVisible();
  await page.locator("li").filter({ hasText: "Text" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("text1");
  await page.getByLabel("Settings").locator("#key").click();
  await page.getByLabel("Settings").locator("#key").fill("text1");
  await page.getByLabel("Settings").locator("#description").click();
  await page.getByLabel("Settings").locator("#description").fill("text1 description");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await expect(page.getByText("text1#text1")).toBeVisible();
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  await expect(page.getByLabel("Display name")).toBeVisible();
  await expect(page.getByLabel("Display name")).toHaveValue("text1");
  await expect(page.getByLabel("Settings").locator("#key")).toHaveValue("text1");
  await expect(page.getByLabel("Settings").locator("#description")).toHaveValue(
    "text1 description",
  );
  await expect(page.getByLabel("Support multiple values")).not.toBeChecked();
  await expect(page.getByLabel("Use as title")).toBeHidden();
  await page.getByRole("tab", { name: "Validation" }).click();
  await expect(page.getByLabel("Set maximum length")).toBeEmpty();
  await expect(page.getByLabel("Make field required")).not.toBeChecked();
  await expect(page.getByLabel("Set field as unique")).not.toBeChecked();
  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByLabel("Set default value")).toBeEmpty();
  await page.getByRole("button", { name: "Cancel" }).click();
  await page.getByText("Content").click();
  await expect(page.getByLabel("edit").locator("svg")).toBeVisible();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.locator("label")).toContainText("text1");
  await expect(page.getByRole("main")).toContainText("text1 description");
  await page.getByLabel("text1").click();
  await page.getByLabel("text1").fill("text1");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await expect(page.getByLabel("text1")).toHaveValue("text1");
  await page.getByLabel("Back").click();
  await expect(page.getByPlaceholder("-")).toHaveValue("text1");
  await page.getByRole("cell").getByLabel("edit").locator("svg").click();
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(500);
  await page.getByLabel("text1").click();
  await page.getByLabel("text1").fill("new text1");
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await expect(page.getByPlaceholder("-")).toHaveValue("new text1");

  await page.getByPlaceholder("-").click();
  await page.getByPlaceholder("-").fill("text1");
  await page.locator(".ant-table-body").click();
  await closeNotification(page);
  await expect(page.getByPlaceholder("-")).toHaveValue("text1");
  await page.getByRole("cell").getByLabel("edit").locator("svg").click();

  await expect(page.getByLabel("text1")).toHaveValue("text1");
}

export async function TextMetadataEditing(page: Page) {
  // Navigate to the Text metadata tab
  await page.getByRole("tab", { name: "Meta Data" }).click();
  await page.locator("li").filter({ hasText: "Text" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("text1");
  await page.getByLabel("Settings").locator("#key").click();
  await page.getByLabel("Settings").locator("#key").fill("text1");
  await page.getByLabel("Settings").locator("#description").click();
  await page.getByLabel("Settings").locator("#description").fill("text1 description");
  await page.getByRole("tab", { name: "Default value" }).click();
  await page.getByLabel("Set default value").click();
  await page.getByLabel("Set default value").fill("text1 default value");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("text1");
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await expect(page.getByLabel("text1")).toHaveValue("text1 default value");
  await page.getByLabel("Back").click();
  await expect(page.getByPlaceholder("-")).toHaveValue("text1 default value");

  await page.getByText("Schema").click();
  await page.getByRole("tab", { name: "Meta Data" }).click();
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("new text1");
  await page.getByLabel("Field Key").click();
  await page.getByLabel("Field Key").fill("new-text1");
  await page.getByLabel("Description(optional)").click();
  await page.getByLabel("Description(optional)").fill("new text1 description");
  await page.getByLabel("Support multiple values").check();
  await page.getByRole("tab", { name: "Validation" }).click();
  await page.getByLabel("Set maximum length").click();
  await page.getByLabel("Set maximum length").fill("5");
  await page.getByLabel("Make field required").check();
  await page.getByLabel("Set field as unique").check();
  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByLabel("Set default value")).toHaveValue("text1 default value");
  await page.getByRole("button", { name: "plus New" }).click();
  await page.locator("#defaultValue").nth(1).click();
  await page.locator("#defaultValue").nth(1).fill("text2");
  await expect(page.getByRole("button", { name: "OK" })).toBeDisabled();
  await page.locator("#defaultValue").nth(0).click();
  await page.locator("#defaultValue").nth(0).fill("text1");
  await page.getByRole("button", { name: "arrow-down" }).first().click();
  await expect(page.locator("#defaultValue").nth(0)).toHaveValue("text2");
  await expect(page.locator("#defaultValue").nth(1)).toHaveValue("text1");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await expect(page.getByLabel("Meta Data")).toContainText("new text1 *#new-text1(unique)");
  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("new text1");
  await expect(page.getByPlaceholder("-")).toHaveValue("text1 default value");
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.locator("label")).toContainText("new text1(unique)");
  await expect(page.getByRole("main")).toContainText("new text1 description");
  await expect(page.getByRole("textbox").nth(0)).toHaveValue("text2");
  await expect(page.getByRole("textbox").nth(1)).toHaveValue("text1");
  await page.getByLabel("new text1(unique)").click();
  await page.getByLabel("new text1(unique)").fill("text22");
  await expect(page.getByRole("button", { name: "Save" })).toBeDisabled();
  await page.getByLabel("new text1(unique)").fill("text2");

  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await expect(page.getByLabel("new text1(unique)")).toHaveValue("text2");
  await expect(page.getByRole("textbox").nth(1)).toHaveValue("text1");
  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "x2" }).click();
  await expect(page.getByPlaceholder("-").nth(1)).toHaveValue("text2");
  await expect(page.getByPlaceholder("-").nth(2)).toHaveValue("text1");
  await page.getByPlaceholder("-").nth(1).click();
  await page.getByPlaceholder("-").nth(1).fill("new text2");
  await page.getByRole("tooltip").getByText("new text1").click();
  await closeNotification(page, false);
  await page.getByRole("button", { name: "x2" }).click();
  await page.getByPlaceholder("-").nth(1).click();
  await page.getByPlaceholder("-").nth(1).fill("text3");
  await page.getByRole("tooltip").getByText("new text1").click();
  await closeNotification(page);
  await page.getByRole("cell").getByLabel("edit").locator("svg").first().click();
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(500);
  await expect(page.getByLabel("new text1(unique)")).toHaveValue("text3");
  await page.getByRole("button", { name: "plus New" }).click();
  await page
    .locator("div")
    .filter({ hasText: /^0 \/ 5$/ })
    .getByRole("textbox")
    .click();
  await page
    .locator("div")
    .filter({ hasText: /^0 \/ 5$/ })
    .getByRole("textbox")
    .fill("text2");
  await page.getByText("new text1 description").click();
  await closeNotification(page);
  await page.getByRole("button", { name: "arrow-down" }).first().click();
  await closeNotification(page);
  await page.getByRole("button", { name: "arrow-down" }).nth(1).click();
  await closeNotification(page);
  await expect(page.getByLabel("new text1(unique)")).toHaveValue("text1");
  await expect(page.getByRole("textbox").nth(1)).toHaveValue("text2");
  await expect(page.getByRole("textbox").nth(2)).toHaveValue("text3");
  await page.getByRole("button", { name: "delete" }).first().click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "x2" }).click();
  await expect(page.getByPlaceholder("-").nth(1)).toHaveValue("text2");
  await expect(page.getByPlaceholder("-").nth(2)).toHaveValue("text3");
}
