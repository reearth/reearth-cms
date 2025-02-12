import { Page, expect } from "@playwright/test";

import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { createGroup } from "@reearth-cms/e2e/project/utils/group";
import { Selectors } from "@reearth-cms/selectors";

export async function GroupFieldCreatingAndUpdating(page: Page) {
  // Verify initial field type visibility
  await expect(page.locator("li").getByText("Reference", { exact: true })).toBeVisible();
  await expect(page.locator("li").getByText("Group", { exact: true })).toBeVisible();

  // Create group and verify field type visibility changes
  await createGroup(page);
  await expect(page.locator("li").getByText("Reference", { exact: true })).toBeHidden();
  await expect(page.locator("li").getByText("Group", { exact: true })).toBeHidden();

  // Create text field within group
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

  // Create group field and configure settings
  await page.getByText("e2e model name").click();
  await page.locator("li").getByText("Group", { exact: true }).click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("group1");
  await page.getByLabel("Settings").locator("#key").click();
  await page.getByLabel("Settings").locator("#key").fill("group1");
  await page.getByLabel("Settings").locator("#description").click();
  await page.getByLabel("Settings").locator("#description").fill("group1 description");

  // Select group reference and verify validation settings
  await page.locator(".ant-select-selector").click();
  await page.getByText("e2e group name #e2e-group-key").click();
  await expect(page.getByLabel("Settings")).toContainText("e2e group name #e2e-group-key");
  await page.getByRole("tab", { name: "Validation" }).click();

  // Verify validation options are disabled for group fields
  await expect(
    page.locator("label").filter({ hasText: "Make field required" }).locator("span").nth(1),
  ).toBeDisabled();
  await expect(
    page.locator("label").filter({ hasText: "Set field as unique" }).locator("span").nth(1),
  ).toBeDisabled();

  // Verify default value settings are disabled for group fields
  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByLabel("Set default value")).toBeDisabled();
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);

  // Verify group field creation and display
  await expect(page.getByLabel("Fields").getByRole("paragraph")).toContainText("group1#group1");
  await page.getByText("Content").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.locator("label").first()).toContainText("group1");
  await expect(page.getByRole("main")).toContainText("group1 description");

  // Test creating and editing items with group field
  await page.getByLabel("text1").click();
  await page.getByLabel("text1").fill("text1");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();

  // Test editing existing item
  await page.getByRole("cell").getByLabel("edit").locator("svg").click();
  await expect(page.getByLabel("text1")).toHaveValue("text1");
  await page.getByLabel("text1").click();
  await page.getByLabel("text1").fill("new text1");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);

  // Configure advanced field settings
  await page.getByTestId(Selectors.projectMenuSchema).click();
  await page.getByRole("tab", { name: "Meta Data" }).click();
  await page.getByRole("menuitem", { name: "e2e group name" }).locator("span").click();
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();

  // Update field properties and validation rules
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("new text1");
  await page.getByLabel("Field Key").click();
  await page.getByLabel("Field Key").fill("new-text1");
  await page.getByLabel("Description(optional)").click();
  await page.getByLabel("Description(optional)").fill("new text1 description");
  await page.getByLabel("Support multiple values").check();
  await page.getByLabel("Use as title").check();

  // Configure validation settings
  await page.getByRole("tab", { name: "Validation" }).click();
  await page.getByLabel("Set maximum length").click();
  await page.getByLabel("Set maximum length").fill("5");
  await page.getByLabel("Make field required").check();
  await page.getByLabel("Set field as unique").check();

  // Test default value validation
  await page.getByRole("tab", { name: "Default value" }).click();
  await page.getByRole("button", { name: "plus New" }).click();
  await page.getByLabel("Set default value").click();
  await page.getByLabel("Set default value").fill("text12");
  await expect(page.getByRole("button", { name: "OK" })).toBeDisabled();
  await page.getByLabel("Set default value").click();
  await page.getByLabel("Set default value").fill("text1");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);

  // Verify updated field settings in content view
  await page.getByText("Content").click();
  await page.getByText("e2e model name").click();
  await page.getByRole("cell").getByLabel("edit").locator("svg").click();
  await expect(page.getByRole("main")).toContainText("new text1(unique)");
  await expect(page.getByRole("main")).toContainText("new text1 description");
  await expect(page.getByLabel("new text1(unique)")).toHaveValue("new text1");
  await expect(page.getByText("/ 5")).toBeVisible();

  // Test validation rules
  await expect(page.getByRole("button", { name: "Save" })).toBeDisabled();
  await page.getByLabel("new text1(unique)").click();
  await page.getByLabel("new text1(unique)").fill("text1");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);

  // Test multiple values and reordering
  await page.getByLabel("Back").click();
  await page.getByRole("cell").getByLabel("edit").locator("svg").click();
  await expect(page.getByLabel("new text1(unique)")).toHaveValue("text1");
  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.getByLabel("new text1(unique)")).toHaveValue("text1");
  await page.getByRole("button", { name: "plus New" }).click();

  // Add and reorder multiple values
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
  await page.getByRole("button", { name: "plus New" }).click();
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);

  // Verify final state and value ordering
  await page.getByLabel("Back").click();
  await page.getByRole("cell").getByLabel("edit").locator("svg").first().click();
  await expect(page.getByRole("textbox").nth(0)).toHaveValue("text1");
  await expect(page.getByRole("textbox").nth(1)).toHaveValue("text2");
  await page.getByRole("button", { name: "arrow-down" }).first().click();
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await page.getByRole("cell").getByLabel("edit").locator("svg").first().click();
  await expect(page.getByRole("textbox").nth(0)).toHaveValue("text2");
  await expect(page.getByRole("textbox").nth(1)).toHaveValue("text1");
}

export async function GroupFieldEditing(page: Page) {
  // Verify initial field type visibility
  await expect(page.locator("li").getByText("Reference", { exact: true })).toBeVisible();
  await expect(page.locator("li").getByText("Group", { exact: true })).toBeVisible();

  // Create group and verify field type visibility changes
  await createGroup(page);
  await expect(page.locator("li").getByText("Reference", { exact: true })).toBeHidden();
  await expect(page.locator("li").getByText("Group", { exact: true })).toBeHidden();

  // Create text field within group
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

  // Create and configure group field
  await page.getByText("e2e model name").click();
  await page.locator("li").getByText("Group", { exact: true }).click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("group1");
  await page.getByLabel("Settings").locator("#key").click();
  await page.getByLabel("Settings").locator("#key").fill("group1");
  await page.getByLabel("Settings").locator("#description").click();
  await page.getByLabel("Settings").locator("#description").fill("group1 description");

  // Select group reference and verify validation settings
  await page.locator(".ant-select-selector").click();
  await page.getByText("e2e group name #e2e-group-key").click();
  await expect(page.getByLabel("Settings")).toContainText("e2e group name #e2e-group-key");
  await page.getByRole("tab", { name: "Validation" }).click();

  // Verify validation options are disabled for group fields
  await expect(
    page.locator("label").filter({ hasText: "Make field required" }).locator("span").nth(1),
  ).toBeDisabled();
  await expect(
    page.locator("label").filter({ hasText: "Set field as unique" }).locator("span").nth(1),
  ).toBeDisabled();

  // Verify default value settings are disabled
  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByLabel("Set default value")).toBeDisabled();
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);

  // Verify group field creation and display
  await expect(page.getByLabel("Fields").getByRole("paragraph")).toContainText("group1#group1");
  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("group1");
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.locator("label").first()).toContainText("group1");
  await expect(page.getByRole("main")).toContainText("group1 description");

  // Create new item with text field value
  await page.getByLabel("text1").click();
  await page.getByLabel("text1").fill("text1");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);

  // Edit group field properties
  await page.getByTestId(Selectors.projectMenuSchema).click();
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("new group1");
  await page.getByLabel("Field Key").click();
  await page.getByLabel("Field Key").fill("new-group1");
  await page.getByLabel("Description(optional)").click();
  await page.getByLabel("Description(optional)").fill("new group1 description");
  await page.getByLabel("Support multiple values").check();
  await expect(page.getByLabel("Use as title")).toBeHidden();
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);

  // Verify updated field settings in content view
  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("new group1");
  await page.getByRole("cell").getByLabel("edit").locator("svg").click();
  await expect(page.getByRole("main")).toContainText("new group1");
  await expect(page.getByRole("main")).toContainText("new group1 (1)");
  await expect(page.getByRole("main")).toContainText("new group1 description");
  await expect(page.getByLabel("text1")).toHaveValue("text1");

  // Test multiple values functionality
  await page.getByRole("button", { name: "plus New" }).click();
  await expect(page.getByRole("main")).toContainText("new group1 (2)");
  await page
    .locator("div")
    .filter({ hasText: /^0text1 description$/ })
    .getByLabel("text1")
    .click();
  await page
    .locator("div")
    .filter({ hasText: /^0text1 description$/ })
    .getByLabel("text1")
    .fill("text1-2");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);

  // Verify multiple values are saved correctly
  await page.getByLabel("Back").click();
  await page.getByRole("cell").getByLabel("edit").locator("svg").click();
  await expect(
    page
      .locator("div")
      .filter({ hasText: /^5text1 description$/ })
      .getByLabel("text1"),
  ).toHaveValue("text1");
  await expect(
    page
      .locator("div")
      .filter({ hasText: /^7text1 description$/ })
      .getByLabel("text1"),
  ).toHaveValue("text1-2");

  // Test creating new item with multiple values
  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByRole("button", { name: "plus New" }).click();
  await page.getByLabel("text1").click();
  await page.getByLabel("text1").fill("text1");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await page.getByRole("cell").getByLabel("edit").locator("svg").first().click();
  await expect(page.getByLabel("text1")).toHaveValue("text1");

  // Configure default values for group
  await page.getByTestId(Selectors.projectMenuSchema).click();
  await page.getByRole("menuitem", { name: "e2e group name" }).locator("span").click();
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  await page.getByLabel("Support multiple values").check();
  await page.getByRole("tab", { name: "Default value" }).click();
  await page.getByRole("button", { name: "plus New" }).click();
  await page.locator("#defaultValue").nth(0).click();
  await page.locator("#defaultValue").nth(0).fill("text1");
  await page.getByRole("button", { name: "plus New" }).click();
  await page.locator("#defaultValue").nth(1).click();
  await page.locator("#defaultValue").nth(1).fill("text2");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);

  // Test default values and reordering
  await page.getByText("Content").click();
  await page.getByText("e2e model name").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByRole("button", { name: "plus New" }).click();
  await expect(page.getByRole("textbox").nth(0)).toHaveValue("text1");
  await expect(page.getByRole("textbox").nth(1)).toHaveValue("text2");
  await page.getByRole("button", { name: "plus New" }).nth(1).click();
  await expect(page.getByRole("textbox").nth(2)).toHaveValue("text1");
  await expect(page.getByRole("textbox").nth(3)).toHaveValue("text2");

  // Test reordering of values
  await page.getByRole("button", { name: "arrow-down" }).nth(3).click();
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);

  // Verify final state after reordering
  await page.getByLabel("Back").click();
  await page.getByRole("cell").getByLabel("edit").locator("svg").first().click();
  await expect(page.getByRole("textbox").nth(0)).toHaveValue("text1");
  await expect(page.getByRole("textbox").nth(1)).toHaveValue("text2");
  await expect(page.getByRole("textbox").nth(2)).toHaveValue("text2");
  await expect(page.getByRole("textbox").nth(3)).toHaveValue("text1");
}

// Int Field Tests
// ======================

// Test creating and updating Int fields with basic functionality
export async function IntFieldCreatingAndUpdating(page: Page) {
  // Create new Int field with basic settings
  await page.locator("li").filter({ hasText: "Int" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("int1");
  await page.getByLabel("Settings").locator("#key").click();
  await page.getByLabel("Settings").locator("#key").fill("int1");
  await page.getByLabel("Settings").locator("#description").click();
  await page.getByLabel("Settings").locator("#description").fill("int1 description");

  // Save field settings and verify creation
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await expect(page.getByLabel("Fields").getByRole("paragraph")).toContainText("int1#int1");

  // Test creating new item with Int field
  await page.getByText("Content").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.locator("label")).toContainText("int1");
  await expect(page.getByRole("main")).toContainText("int1 description");

  // Test saving and updating Int values
  await page.getByLabel("int1").click();
  await page.getByLabel("int1").fill("1");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await expect(page.getByRole("cell", { name: "1", exact: true })).toBeVisible();

  // Test editing existing Int value
  await page.getByRole("cell").getByLabel("edit").locator("svg").click();
  await expect(page.getByLabel("int1")).toHaveValue("1");
  await page.getByLabel("int1").click();
  await page.getByLabel("int1").fill("2");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await expect(page.getByRole("cell", { name: "2", exact: true })).toBeVisible();
}

// Test advanced editing features for Int fields
export async function IntFieldEditing(page: Page) {
  // Create initial Int field with default value
  await page.locator("li").filter({ hasText: "Int" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("int1");
  await page.getByLabel("Settings").locator("#key").click();
  await page.getByLabel("Settings").locator("#key").fill("int1");
  await page.getByLabel("Settings").locator("#description").click();
  await page.getByLabel("Settings").locator("#description").fill("int1 description");
  await page.getByRole("tab", { name: "Default value" }).click();
  await page.getByLabel("Set default value").click();
  await page.getByLabel("Set default value").fill("1");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);

  // Verify field creation and default value in content
  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("int1");
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await expect(page.getByRole("cell", { name: "1", exact: true })).toBeVisible();

  // Test advanced field settings modifications
  await page.getByTestId(Selectors.projectMenuSchema).click();
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  await page.getByRole("tab", { name: "Settings" }).click();

  // Update basic field properties
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("new int1");
  await page.getByLabel("Field Key").click();
  await page.getByLabel("Field Key").fill("new-int1");
  await page.getByLabel("Description(optional)").click();
  await page.getByLabel("Description(optional)").fill("new int1 description");
  await page.getByLabel("Support multiple values").check();
  await expect(page.getByLabel("Use as title")).toBeHidden();

  // Test validation settings
  await page.getByRole("tab", { name: "Validation" }).click();
  // Verify min/max value validation
  await page.getByLabel("Set minimum value").click();
  await page.getByLabel("Set minimum value").fill("10");
  await page.getByLabel("Set maximum value").click();
  await page.getByLabel("Set maximum value").fill("2");
  await expect(page.getByRole("button", { name: "OK" })).toBeDisabled();

  // Set valid min/max values
  await page.getByLabel("Set minimum value").click();
  await page.getByLabel("Set minimum value").fill("2");
  await page.getByLabel("Set maximum value").click();
  await page.getByLabel("Set maximum value").fill("10");
  await page.getByLabel("Make field required").check();
  await page.getByLabel("Set field as unique").check();

  // Test default value constraints
  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByLabel("Set default value")).toBeVisible();
  await expect(page.getByLabel("Set default value")).toHaveValue("1");
  await expect(page.getByRole("button", { name: "OK" })).toBeDisabled();

  // Test invalid default value
  await page.getByLabel("Set default value").click();
  await page.getByLabel("Set default value").fill("11");
  await expect(page.getByRole("button", { name: "OK" })).toBeDisabled();

  // Set valid default values for multiple values support
  await page.getByLabel("Set default value").click();
  await page.getByLabel("Set default value").fill("2");
  await page.getByRole("button", { name: "plus New" }).click();
  await page.locator("#defaultValue").nth(1).click();
  await page.locator("#defaultValue").nth(1).fill("3");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);

  // Verify updated field settings
  await expect(page.getByText("new int1 *#new-int1(unique)")).toBeVisible();
  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("new int1");
  await expect(page.getByRole("cell", { name: "1", exact: true })).toBeVisible();

  // Verify new item creation with updated settings
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.getByText("new int1(unique)")).toBeVisible();
  await expect(page.getByRole("spinbutton").nth(0)).toHaveValue("2");
  await expect(page.getByRole("spinbutton").nth(1)).toHaveValue("3");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);

  // Final verification of multiple values display
  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "x2" }).click();
  await expect(page.getByRole("tooltip")).toContainText("new int123");
}

// Markdown Field Tests
// ======================

export async function MarkdownFieldCreating(page: Page) {
  // Create new Markdown field with basic settings
  await page.locator("li").filter({ hasText: "Markdown" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("text1");
  await page.getByLabel("Settings").locator("#key").click();
  await page.getByLabel("Settings").locator("#key").fill("text1");
  await page.getByLabel("Settings").locator("#description").click();
  await page.getByLabel("Settings").locator("#description").fill("text1 description");

  // Set default value for the field
  await page.getByRole("tab", { name: "Default value" }).click();
  await page.locator(".ant-col").last().click();
  await page.getByLabel("Set default value").fill("text1 default value");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);

  // Verify field creation and initial settings
  await expect(page.getByText("text1#text1")).toBeVisible();
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  await expect(page.getByLabel("Display name")).toBeVisible();
  await expect(page.getByLabel("Display name")).toHaveValue("text1");
  await expect(page.getByLabel("Settings").locator("#key")).toHaveValue("text1");
  await expect(page.getByLabel("Settings").locator("#description")).toHaveValue(
    "text1 description",
  );

  // Verify default field configuration
  await expect(page.getByLabel("Support multiple values")).not.toBeChecked();
  await expect(page.getByLabel("Use as title")).not.toBeChecked();

  // Check validation tab settings
  await page.getByRole("tab", { name: "Validation" }).click();
  await expect(page.getByLabel("Set maximum length")).toBeEmpty();
  await expect(page.getByLabel("Make field required")).not.toBeChecked();
  await expect(page.getByLabel("Set field as unique")).not.toBeChecked();

  // Verify default value
  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByLabel("Set default value")).toHaveValue("text1 default value");
  await page.getByRole("button", { name: "Cancel" }).click();

  // Test field in content view
  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("text1");
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.locator("label")).toContainText("text1");
  await page.getByText("text1 description").click();
  await expect(page.getByRole("main")).toContainText("text1 description");
  await expect(page.getByLabel("text1")).toHaveValue("text1 default value");

  // Save new item and verify
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await page.locator(".ant-table-row > td:nth-child(9)").getByRole("button").click();
  await expect(page.getByRole("tooltip")).toContainText("text1text1 default value");
}
export async function MarkdownFieldUpdating(page: Page) {
  // Update field settings with advanced configuration
  await page.getByTestId(Selectors.projectMenuSchema).click();
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  await page.getByLabel("Support multiple values").check();
  await page.getByLabel("Use as title").check();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("new text1");
  await page.getByLabel("Field Key").click();
  await page.getByLabel("Field Key").fill("new-text1");
  await page.getByLabel("Description(optional)").click();
  await page.getByLabel("Description(optional)").fill("new text1 description");

  // Configure validation rules
  await page.getByRole("tab", { name: "Validation" }).click();
  await page.getByLabel("Set maximum length").click();
  await page.getByLabel("Set maximum length").fill("5");
  await page.getByLabel("Make field required").check();
  await page.getByLabel("Set field as unique").check();

  // Set up multiple default values
  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByLabel("Set default value")).toHaveValue("text1 default value");
  await page.getByRole("button", { name: "plus New" }).click();
  await page.locator("div:nth-child(2) > .css-1ago99h").click();
  await page.getByRole("textbox").fill("text2");
  await page.locator("div:nth-child(1) > .css-1ago99h").click();
  await page.getByRole("textbox").fill("text1");

  // Test reordering of default values
  await page.getByRole("button", { name: "arrow-down" }).first().click();
  await expect(page.locator("div:nth-child(2) > .css-1ago99h")).toContainText("text1");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);

  // Verify updated field settings
  await expect(page.getByText("new text1 *#new-text1(unique)")).toBeVisible();
  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("new text1");
  await page.locator(".ant-table-row > td:nth-child(9)").getByRole("button").click();
  await expect(page.getByRole("tooltip")).toContainText("text1text1 default value");
}

export async function MarkdownFieldCreatingNewItem(page: Page) {
  // Test creating new item with updated settings
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.getByText("new text1(unique)")).toBeVisible();
  await page.getByText("new text1 description").click();
  await expect(page.getByText("new text1 description")).toBeVisible();
  await expect(page.locator("div:nth-child(1) > .css-1ago99h")).toContainText("text2");
  await expect(page.locator("div:nth-child(2) > .css-1ago99h")).toContainText("text1");

  // Save and verify multiple values
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "x2" }).click();
  await expect(page.getByRole("main")).toContainText("new text1text2text1");

  // Test field validation and required field behavior
  await page.getByRole("cell", { name: "edit" }).nth(1).click();
  await expect(page.getByText("new text1(unique)")).toBeVisible();
  await page.getByRole("button", { name: "delete" }).first().click();
  await expect(page.getByText("Please input field!")).toBeVisible();
  await page.getByRole("button", { name: "plus New" }).click();
  await expect(page.getByRole("button", { name: "Save" })).toBeDisabled();

  // Test adding and reordering multiple values
  await page.locator("div:nth-child(1) > .css-1ago99h").click();
  await page.getByRole("textbox").fill("text");
  await page.getByRole("button", { name: "plus New" }).click();
  await page.getByRole("button", { name: "plus New" }).click();
  await page.locator("div:nth-child(2) > .css-1ago99h").click();
  await page.getByRole("textbox").fill("text2");
  await page.getByRole("button", { name: "arrow-up" }).nth(1).click();
  await expect(page.locator("div:nth-child(1) > .css-1ago99h")).toContainText("text2");
  await expect(page.locator("div:nth-child(2) > .css-1ago99h")).toContainText("text");

  // Save final state and verify
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "x2" }).nth(1).click();
  await expect(page.getByRole("main")).toContainText("new text1text2text");
}
