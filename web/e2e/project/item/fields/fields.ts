/* eslint-disable playwright/no-wait-for-selector */
import { Page, expect } from "@playwright/test";

import { closeNotification } from "@reearth-cms/e2e/common/notification";

// Constants for test file URLs and names
const uploadFileUrl_1 =
  "https://assets.cms.plateau.reearth.io/assets/11/6d05db-ed47-4f88-b565-9eb385b1ebb0/13100_tokyo23-ku_2022_3dtiles%20_1_1_op_bldg_13101_chiyoda-ku_lod1/tileset.json";
const uploadFileName_1 = "tileset.json";
const uploadFileUrl_2 =
  "https://assets.cms.plateau.reearth.io/assets/ec/0de34c-889a-459a-b49c-47c89d02ee3e/lowpolycar.gltf";
const uploadFileName_2 = "lowpolycar.gltf";

export async function AssetFieldCreatingAndUpdating(page: Page) {
  // Create new asset field
  await page.locator("li").filter({ hasText: "Asset" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("asset1");
  await page.getByLabel("Settings").locator("#key").click();
  await page.getByLabel("Settings").locator("#key").fill("asset1");
  await page.getByLabel("Settings").locator("#description").click();
  await page.getByLabel("Settings").locator("#description").fill("asset1 description");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);

  // Verify field creation
  await expect(page.getByLabel("Fields").getByRole("paragraph")).toContainText("asset1#asset1");
  await page.getByText("Content").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.locator("label")).toContainText("asset1");
  await expect(page.getByRole("main")).toContainText("asset1 description");

  // Upload asset
  await page.getByRole("button", { name: "Asset" }).click();
  await page.getByRole("button", { name: "upload Upload Asset" }).click();
  await page.getByRole("tab", { name: "URL" }).click();
  await page.getByPlaceholder("Please input a valid URL").click();
  await page.getByPlaceholder("Please input a valid URL").fill(uploadFileUrl_1);
  await page.getByRole("button", { name: "Upload and Link" }).click();
  await closeNotification(page);

  // Verify asset upload
  await expect(page.getByRole("button", { name: `folder ${uploadFileName_1}` })).toBeVisible();
  await expect(page.getByRole("button", { name: uploadFileName_1, exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);

  // Verify asset display
  await page.getByLabel("Back").click();
  await expect(page.getByText(uploadFileName_1)).toBeVisible();
  await page.getByRole("cell").getByLabel("edit").locator("svg").click();
  await page.getByRole("button", { name: `folder ${uploadFileName_1}` }).click();
  await page.getByRole("button", { name: "upload Upload Asset" }).click();
  await page.getByRole("tab", { name: "URL" }).click();
  await page.getByPlaceholder("Please input a valid URL").click();
  await page.getByPlaceholder("Please input a valid URL").fill(uploadFileUrl_2);
  await page.getByRole("button", { name: "Upload and Link" }).click();
  await closeNotification(page);
  await expect(page.getByRole("button", { name: `folder ${uploadFileName_2}` })).toBeVisible();
  await expect(page.getByRole("button", { name: uploadFileName_2, exact: true })).toBeVisible();
  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "Cancel" }).click();
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await expect(page.getByText(uploadFileName_2)).toBeVisible();
}
export async function AssetFieldEditing(page: Page) {
  // Edit asset field
  await page.locator("li").filter({ hasText: "Asset" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("asset1");
  await page.getByLabel("Settings").locator("#key").click();
  await page.getByLabel("Settings").locator("#key").fill("asset1");
  await page.getByLabel("Settings").locator("#description").click();
  await page.getByLabel("Settings").locator("#description").fill("asset1 description");
  await page.getByRole("tab", { name: "Default value" }).click();
  await page.getByRole("button", { name: "Asset" }).click();
  await page.getByRole("button", { name: "upload Upload Asset" }).click();
  await page.getByRole("tab", { name: "URL" }).click();
  await page.getByPlaceholder("Please input a valid URL").click();
  await page.getByPlaceholder("Please input a valid URL").fill(uploadFileUrl_1);
  await page.getByRole("button", { name: "Upload and Link" }).click();
  await closeNotification(page);

  // Verify asset upload
  await expect(page.getByRole("button", { name: `folder ${uploadFileName_1}` })).toBeVisible();
  await expect(page.getByRole("button", { name: uploadFileName_1, exact: true })).toBeVisible();
  await page.getByLabel("Default value").getByRole("button").nth(3).click();
  await page.getByRole("button", { name: "Asset" }).click();
  await page.getByPlaceholder("input search text").click();
  await page.getByPlaceholder("input search text").fill("no asset");
  await page.getByRole("button", { name: "search" }).click();
  await expect(page.locator(".ant-table-row").first()).toBeHidden();
  await page.getByPlaceholder("input search text").click();
  await page.getByPlaceholder("input search text").fill("");
  await page.getByRole("button", { name: "search" }).click();
  await page.locator(".ant-table-row > td").first().getByRole("button").hover();
  await page.locator(".ant-table-row > td").first().getByRole("button").click();
  await expect(page.getByRole("button", { name: `folder ${uploadFileName_1}` })).toBeVisible();
  await expect(page.getByRole("button", { name: uploadFileName_1, exact: true })).toBeVisible();
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);

  // Verify content display
  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("asset1");
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.getByRole("button", { name: `folder ${uploadFileName_1}` })).toBeVisible();
  await expect(page.getByRole("button", { name: uploadFileName_1, exact: true })).toBeVisible();
  await expect(page.getByText("asset1", { exact: true })).toBeVisible();
  await expect(page.getByText("asset1 description")).toBeVisible();
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);

  // Edit field
  await page.getByLabel("Back").click();
  await expect(page.getByText(uploadFileName_1)).toBeVisible();
  await page.getByText("Schema").click();
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("new asset1");
  await page.getByLabel("Field Key").click();
  await page.getByLabel("Field Key").fill("new-asset1");
  await page.getByLabel("Description(optional)").click();
  await page.getByLabel("Description(optional)").fill("new asset1 description");
  await page.getByLabel("Support multiple values").check();
  await expect(page.getByLabel("Use as title")).toBeHidden();
  await page.getByRole("tab", { name: "Validation" }).click();
  await page.getByLabel("Make field required").check();
  await page.getByLabel("Set field as unique").check();
  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByRole("button", { name: `folder ${uploadFileName_1}` })).toBeVisible();
  await expect(page.getByRole("button", { name: uploadFileName_1, exact: true })).toBeVisible();
  await page.getByRole("button", { name: "plus New" }).click();
  await page.getByRole("button", { name: "Asset" }).click();
  await page.getByRole("button", { name: "upload Upload Asset" }).click();
  await page.getByRole("tab", { name: "URL" }).click();

  // Upload and link second asset file
  await page.getByPlaceholder("Please input a valid URL").click();
  await page.getByPlaceholder("Please input a valid URL").fill(uploadFileUrl_2);
  await page.getByRole("button", { name: "Upload and Link" }).click();
  await closeNotification(page);

  // Verify asset upload
  await expect(page.getByRole("button", { name: `folder ${uploadFileName_2}` })).toBeVisible();
  await expect(page.getByRole("button", { name: uploadFileName_2, exact: true })).toBeVisible();
  await page.getByRole("button", { name: "arrow-up" }).nth(1).click();
  await expect(page.locator(".css-7g0azd").nth(0)).toContainText(uploadFileName_2);
  await expect(page.locator(".css-7g0azd").nth(1)).toContainText(uploadFileName_1);
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);

  // Verify field updates
  await expect(page.getByLabel("Fields").getByRole("paragraph")).toContainText(
    "new asset1 *#new-asset1(unique)",
  );

  // Verify content display
  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("new asset1");

  // Add new item
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.locator("label")).toContainText("new asset1(unique)");
  await expect(page.getByRole("main")).toContainText("new asset1 description");
  await expect(page.locator(".css-7g0azd").nth(0)).toContainText(uploadFileName_2);
  await expect(page.locator(".css-7g0azd").nth(1)).toContainText(uploadFileName_1);

  // Add new asset
  await page.getByRole("button", { name: "plus New" }).click();
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);

  // Verify final state
  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "x2" }).click();
  await expect(page.getByRole("tooltip")).toContainText(`new asset1`);
  await expect(page.getByRole("tooltip").locator("p").first()).toContainText(uploadFileName_2);
  await expect(page.getByRole("tooltip").locator("p").last()).toContainText(uploadFileName_1);
}

// Boolean Field
export async function BooleanFieldCreatingAndUpdating(page: Page) {
  // Create new boolean field
  await page.locator("li").filter({ hasText: "Boolean" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("boolean1");
  await page.getByLabel("Settings").locator("#key").click();
  await page.getByLabel("Settings").locator("#key").fill("boolean1");
  await page.getByLabel("Settings").locator("#description").click();
  await page.getByLabel("Settings").locator("#description").fill("boolean1 description");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);

  // Verify field creation
  await expect(page.getByLabel("Fields").getByRole("paragraph")).toContainText("boolean1#boolean1");
  await page.getByText("Content").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.locator("label")).toContainText("boolean1");
  await expect(page.getByRole("main")).toContainText("boolean1 description");

  // Toggle boolean value and verify changes
  await page.getByLabel("boolean1").click();
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await expect(page.getByRole("switch")).toHaveAttribute("aria-checked", "true");

  // Edit item and toggle boolean value again
  await page.getByRole("cell").getByLabel("edit").locator("svg").click();
  await expect(page.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  await page.getByLabel("boolean1").click();
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await expect(page.getByRole("switch")).toHaveAttribute("aria-checked", "false");
}
export async function BooleanFieldEditing(page: Page) {
  // Create new boolean field with default value
  await page.locator("li").filter({ hasText: "Boolean" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("boolean1");
  await page.getByLabel("Settings").locator("#key").click();
  await page.getByLabel("Settings").locator("#key").fill("boolean1");
  await page.getByLabel("Settings").locator("#description").click();
  await page.getByLabel("Settings").locator("#description").fill("boolean1 description");
  await page.getByRole("tab", { name: "Default value" }).click();
  await page.getByLabel("Set default value").click();
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);

  // Verify default value in content view
  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("boolean1");
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await expect(page.getByRole("switch")).toHaveAttribute("aria-checked", "true");

  // Edit field properties
  await page.getByText("Schema").click();
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("new boolean1");
  await page.getByLabel("Field Key").click();
  await page.getByLabel("Field Key").fill("new-boolean1");
  await page.getByLabel("Description(optional)").click();
  await page.getByLabel("Description(optional)").fill("new boolean1 description");
  await page.getByLabel("Support multiple values").check();
  await expect(page.getByLabel("Use as title")).toBeHidden();

  // Verify validation options
  await page.getByRole("tab", { name: "Validation" }).click();
  await expect(
    page.locator("label").filter({ hasText: "Make field required" }).locator("span").nth(1),
  ).toBeDisabled();
  await expect(
    page.locator("label").filter({ hasText: "Set field as unique" }).locator("span").nth(1),
  ).toBeDisabled();

  // Test multiple values functionality
  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByRole("switch").nth(0)).toHaveAttribute("aria-checked", "true");
  await page.getByRole("button", { name: "plus New" }).click();
  await expect(page.getByRole("switch").nth(1)).toHaveAttribute("aria-checked", "false");
  await page.getByRole("button", { name: "arrow-down" }).first().click();
  await expect(page.getByRole("switch").nth(0)).toHaveAttribute("aria-checked", "false");
  await expect(page.getByRole("switch").nth(1)).toHaveAttribute("aria-checked", "true");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);

  // Verify field updates
  await expect(page.getByText("new boolean1#new-boolean1")).toBeVisible();
  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("new boolean1");
  await expect(page.getByRole("switch", { name: "check" })).toBeVisible();

  // Test multiple values in new item
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.getByRole("switch").nth(0)).toHaveAttribute("aria-checked", "false");
  await expect(page.getByRole("switch").nth(1)).toHaveAttribute("aria-checked", "true");
  await page.getByRole("button", { name: "plus New" }).click();
  await expect(page.getByRole("switch").nth(2)).toHaveAttribute("aria-checked", "false");
  await page.getByRole("button", { name: "arrow-up" }).nth(2).click();
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);

  // Verify final state
  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "x3" }).click();
  await expect(page.getByRole("tooltip")).toContainText("new boolean1");
  await expect(page.getByRole("switch").nth(1)).toHaveAttribute("aria-checked", "false");
  await expect(page.getByRole("switch").nth(2)).toHaveAttribute("aria-checked", "false");
  await expect(page.getByRole("switch").nth(3)).toHaveAttribute("aria-checked", "true");
}

// Float Field
export async function FloatFieldCreatingAndUpdating(page: Page) {
  await page.locator("li").filter({ hasText: "Float" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("float1");
  await page.getByLabel("Settings").locator("#key").click();
  await page.getByLabel("Settings").locator("#key").fill("float1");
  await page.getByLabel("Settings").locator("#description").click();
  await page.getByLabel("Settings").locator("#description").fill("float1 description");

  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);

  await expect(page.getByLabel("Fields").getByRole("paragraph")).toContainText("float1#float1");
  await page.getByText("Content").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.locator("label")).toContainText("float1");
  await expect(page.getByRole("main")).toContainText("float1 description");
  await page.getByLabel("float1").click();
  await page.getByLabel("float1").fill("1.1");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await expect(page.getByRole("cell", { name: "1.1", exact: true })).toBeVisible();

  await page.getByRole("cell").getByLabel("edit").locator("svg").click();
  await expect(page.getByLabel("float1")).toHaveValue("1.1");
  await page.getByLabel("float1").click();
  await page.getByLabel("float1").fill("2.2");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await expect(page.getByRole("cell", { name: "2.2", exact: true })).toBeVisible();
}

export async function FloatFieldEditing(page: Page) {
  // Create and configure float field
  page.locator("li").filter({ hasText: "Float" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("float1");
  await page.getByLabel("Settings").locator("#key").click();
  await page.getByLabel("Settings").locator("#key").fill("float1");
  await page.getByLabel("Settings").locator("#description").click();
  await page.getByLabel("Settings").locator("#description").fill("float1 description");
  await page.getByRole("tab", { name: "Default value" }).click();
  await page.getByLabel("Set default value").click();
  await page.getByLabel("Set default value").fill("1.1");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);

  // Verify field in content view
  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("float1");
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await expect(page.getByRole("cell", { name: "1.1", exact: true })).toBeVisible();

  // Edit field properties
  await page.getByText("Schema").click();
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  await page.getByRole("tab", { name: "Settings" }).click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("new float1");
  await page.getByLabel("Field Key").click();
  await page.getByLabel("Field Key").fill("new-float1");
  await page.getByLabel("Description(optional)").click();
  await page.getByLabel("Description(optional)").fill("new float1 description");
  await page.getByLabel("Support multiple values").check();
  await expect(page.getByLabel("Use as title")).toBeHidden();

  // Configure validation rules
  await page.getByRole("tab", { name: "Validation" }).click();
  await page.getByLabel("Set minimum value").click();
  await page.getByLabel("Set minimum value").fill("10.1");
  await page.getByLabel("Set maximum value").click();
  await page.getByLabel("Set maximum value").fill("2.1");
  await expect(page.getByRole("button", { name: "OK" })).toBeDisabled();
  await page.getByLabel("Set minimum value").click();
  await page.getByLabel("Set minimum value").fill("2.1");
  await page.getByLabel("Set maximum value").click();
  await page.getByLabel("Set maximum value").fill("10.1");
  await page.getByLabel("Make field required").check();
  await page.getByLabel("Set field as unique").check();

  // Configure default values
  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByLabel("Set default value")).toBeVisible();
  await expect(page.getByLabel("Set default value")).toHaveValue("1.1");
  await expect(page.getByRole("button", { name: "OK" })).toBeDisabled();
  await page.getByLabel("Set default value").click();
  await page.getByLabel("Set default value").fill("11.1");
  await expect(page.getByRole("button", { name: "OK" })).toBeDisabled();
  await page.getByLabel("Set default value").click();
  await page.getByLabel("Set default value").fill("2.2");
  await page.getByRole("button", { name: "plus New" }).click();
  await page.locator("#defaultValue").nth(1).click();
  await page.locator("#defaultValue").nth(1).fill("3.3");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);

  // Verify updated field properties
  await expect(page.getByText("new float1 *#new-float1(unique)")).toBeVisible();
  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("new float1");
  await expect(page.getByRole("cell", { name: "1.1", exact: true })).toBeVisible();

  // Create new item with updated field
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.getByText("new float1(unique)")).toBeVisible();
  await expect(page.getByRole("spinbutton").nth(0)).toHaveValue("2.2");
  await expect(page.getByRole("spinbutton").nth(1)).toHaveValue("3.3");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);

  // Verify final state
  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "x2" }).click();
  await expect(page.getByRole("tooltip")).toContainText("new float12.23.3");
}

// Geometry Object Field
export async function GeometryObjectFieldCreatingAndUpdating(page: Page) {
  // Create new Geometry Object field with basic settings
  await page.locator("li").filter({ hasText: "Geometry Object" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("geometryObject1");
  await page.getByLabel("Settings").locator("#description").click();
  await page.getByLabel("Settings").locator("#description").fill("geometryObject1 description");
  await page.getByLabel("Point", { exact: true }).check(); // Enable Point geometry type
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);

  // Verify field creation and display
  await expect(page.getByLabel("Fields").getByRole("paragraph")).toContainText(
    "geometryObject1#geometryobject1",
  );
  await page.getByText("Content").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.locator("label")).toContainText("geometryObject1");
  await expect(page.getByRole("main")).toContainText("geometryObject1 description");

  // Add a Point geometry value
  await page.locator(".view-lines").click();
  await page
    .getByLabel("Editor content;Press Alt+F1")
    .fill('{\n"type": "Point",\n"coordinates": [0, 0]');
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);

  // Verify saved geometry value
  await page.getByLabel("Back").click();
  await page.locator(".ant-table-row > td:nth-child(9)").getByRole("button").click();
  await expect(page.getByRole("tooltip")).toContainText(
    '{ "type": "Point", "coordinates": [0, 0] }',
  );

  // Edit geometry value
  await page.getByRole("cell").getByLabel("edit").locator("svg").click();
  await page.locator(".ant-row").getByRole("button").nth(1).click();
  await page.locator(".view-lines").click();
  await page
    .getByLabel("Editor content;Press Alt+F1")
    .fill('{\n"type": "Point",\n"coordinates": [1, 0]');
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);

  // Verify updated geometry value
  await page.getByLabel("Back").click();
  await page.locator(".ant-table-row > td:nth-child(9)").getByRole("button").click();
  await expect(page.getByRole("tooltip")).toContainText(
    '{ "type": "Point", "coordinates": [1, 0] }',
  );
}

export async function GeometryObjectFieldEditing(page: Page) {
  // Create field with default value
  await page.locator("li").filter({ hasText: "Geometry Object" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("geometryObject1");
  await page.getByLabel("Settings").locator("#description").click();
  await page.getByLabel("Settings").locator("#description").fill("geometryObject1 description");
  await page.getByLabel("Point", { exact: true }).check();

  // Set default geometry value
  await page.getByRole("tab", { name: "Default value" }).click();
  await page.locator(".view-lines").click();
  await page
    .getByLabel("Editor content;Press Alt+F1")
    .fill('{\n"type": "Point",\n"coordinates": [0, 0]');
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);

  // Verify default value in content view
  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("geometryObject1");
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.locator(".view-lines")).toContainText(
    '{    "type":     "Point",    "coordinates":     [0, 0]}',
  );

  // Save item and verify default value
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await page.locator(".ant-table-row > td:nth-child(9)").getByRole("button").click();
  await expect(page.getByRole("tooltip")).toContainText(
    '{ "type": "Point", "coordinates": [0, 0] }',
  );

  // Edit field properties
  await page.getByText("Schema").click();
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("new geometryObject1");
  await page.getByLabel("Field Key").click();
  await page.getByLabel("Field Key").fill("new-geometryobject1");
  await page.getByLabel("Description(optional)").click();
  await page.getByLabel("Description(optional)").fill("new geometryObject1 description");
  await page.getByLabel("Support multiple values").check();
  await expect(page.getByLabel("Use as title")).toBeHidden();

  // Configure validation rules
  await page.getByRole("tab", { name: "Validation" }).click();
  await page.getByLabel("Make field required").check();
  await page.getByLabel("Set field as unique").check();

  // Add multiple default values and test ordering
  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.locator(".view-lines").nth(0)).toContainText(
    '{  "type": "Point",  "coordinates": [0, 0]}',
  );

  await page.getByRole("button", { name: "plus New" }).click();
  await page
    .getByLabel("Editor content;Press Alt+F1")
    .nth(1)
    .fill('{\n"type": "Point",\n"coordinates": [1, 0]');

  // Test reordering of default values
  await page.getByRole("button", { name: "arrow-down" }).first().click();
  await expect(page.locator(".view-lines").nth(0)).toContainText(
    '{  "type": "Point",  "coordinates": [1, 0]}',
  );
  await expect(page.locator(".view-lines").nth(1)).toContainText(
    '{  "type": "Point",  "coordinates": [0, 0]}',
  );

  // Save field changes and verify updates
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  // await expect(page.getByText("new geometryObject1 *#new-geometryobject1(unique)")).toBeVisible();

  // Test multiple values in new item
  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("new geometryObject1");
  await page.getByRole("button", { name: "plus New Item" }).click();

  // Add wait for the editor to be ready with better error handling
  const editorSelector = ".monaco-editor .view-lines";
  const maxRetries = 5;
  let retries = 0;
  let success = false;

  while (retries < maxRetries && !success) {
    try {
      // Wait for editor container to be visible
      await page.waitForSelector(".monaco-editor", { state: "visible", timeout: 15000 });

      // Get all editor instances and use the correct one
      const editors = await page.locator(editorSelector).all();
      const targetEditor = editors[editors.length - 1]; // Use the last editor instance

      // Verify editor is interactive
      await expect(targetEditor).toBeEditable({ timeout: 10000 });

      // Fill the editor content
      await targetEditor.click();
      await targetEditor.fill('{\n"type": "Point",\n"coordinates": [2, 0]}');

      success = true;
    } catch (error) {
      retries++;
      if (retries === maxRetries || page.isClosed()) {
        throw new Error(  
          `Failed to fill editor after ${retries} attempts: ${(error as Error).message}`,
        );
      }
      // eslint-disable-next-line playwright/no-networkidle
      await page.waitForLoadState("networkidle");
    }
  }

  // Test reordering of values in item
  await page.getByRole("button", { name: "arrow-up" }).nth(2).click();
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);

  // Verify final state with multiple values
  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "x3" }).click();
  await expect(page.getByRole("tooltip").locator("p").nth(0)).toContainText(
    '{ "type": "Point", "coordinates": [1, 0] }',
  );
  await expect(page.getByRole("tooltip").locator("p").nth(1)).toContainText(
    '{ "type": "Point", "coordinates": [2, 0] }',
  );
  await expect(page.getByRole("tooltip").locator("p").nth(2)).toContainText(
    '{ "type": "Point", "coordinates": [0, 0] }',
  );
}

// Boolean Field
// =================

// Test Suite: Boolean Field Testing
// =============================

// Test creating and updating Boolean fields with basic functionality
export async function BooleanMetadataCreatingAndUpdating(page: Page) {
  await page.getByRole("tab", { name: "Meta Data" }).click();
  await page.locator("li").filter({ hasText: "Boolean" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("boolean1");
  await page.getByLabel("Settings").locator("#key").click();
  await page.getByLabel("Settings").locator("#key").fill("boolean1");
  await page.getByLabel("Settings").locator("#description").click();
  await page.getByLabel("Settings").locator("#description").fill("boolean1 description");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);

  await expect(page.getByText("boolean1#boolean1")).toBeVisible();
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  await expect(page.getByLabel("Display name")).toBeVisible();
  await expect(page.getByLabel("Display name")).toHaveValue("boolean1");
  await expect(page.getByLabel("Settings").locator("#key")).toHaveValue("boolean1");
  await expect(page.getByLabel("Settings").locator("#description")).toHaveValue(
    "boolean1 description",
  );
  await expect(page.getByLabel("Support multiple values")).not.toBeChecked();
  await expect(page.getByLabel("Use as title")).toBeHidden();
  await page.getByRole("tab", { name: "Validation" }).click();
  await expect(page.getByLabel("Make field required")).toBeDisabled();
  await expect(page.getByLabel("Set field as unique")).toBeDisabled();
  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByLabel("Set default value")).toHaveAttribute("aria-checked", "false");
  await page.getByRole("button", { name: "Cancel" }).click();

  await page.getByText("Content").click();
  await expect(page.getByLabel("edit").locator("svg")).toBeVisible();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.locator("label")).toContainText("boolean1");
  await expect(page.getByRole("main")).toContainText("boolean1 description");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await expect(page.getByLabel("boolean1")).toHaveAttribute("aria-checked", "false");
  await page.getByLabel("Back").click();
  await expect(page.getByRole("switch", { name: "close" })).toBeVisible();
  await page.getByRole("cell").getByLabel("edit").locator("svg").click();
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(500);
  await page.getByLabel("boolean1").click();
  await closeNotification(page);
  await expect(page.getByLabel("boolean1")).toHaveAttribute("aria-checked", "true");
  await page.getByLabel("Back").click();
  await page.getByRole("switch", { name: "check" }).click();
  await closeNotification(page);
  await expect(page.getByRole("switch", { name: "close" })).toBeVisible();
  await page.getByRole("cell").getByLabel("edit").locator("svg").click();
  await expect(page.getByLabel("boolean1")).toHaveAttribute("aria-checked", "false");
}

// Boolean Field Editing
// ===================

// Test Suite: Boolean Field Editing
// =============================

// Test editing Boolean fields with basic functionality
export async function BooleanMetadataEditing(page: Page) {
  await page.getByRole("tab", { name: "Meta Data" }).click();
  await page.locator("li").filter({ hasText: "Boolean" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("boolean1");
  await page.getByLabel("Settings").locator("#key").click();
  await page.getByLabel("Settings").locator("#key").fill("boolean1");
  await page.getByLabel("Settings").locator("#description").click();
  await page.getByLabel("Settings").locator("#description").fill("boolean1 description");
  await page.getByRole("tab", { name: "Default value" }).click();
  await page.getByLabel("Set default value").click();
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);

  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("boolean1");
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await expect(page.getByLabel("boolean1")).toHaveAttribute("aria-checked", "true");
  await page.getByLabel("Back").click();
  await expect(page.getByRole("switch", { name: "check" })).toBeVisible();

  await page.getByText("Schema").click();
  await page.getByRole("tab", { name: "Meta Data" }).click();
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("new boolean1");
  await page.getByLabel("Field Key").click();
  await page.getByLabel("Field Key").fill("new-boolean1");
  await page.getByLabel("Description(optional)").click();
  await page.getByLabel("Description(optional)").fill("new boolean1 description");
  await page.getByLabel("Support multiple values").check();
  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  await page.getByRole("button", { name: "plus New" }).click();
  await expect(page.getByRole("switch").nth(1)).toHaveAttribute("aria-checked", "false");
  await page.getByRole("switch").nth(1).click();
  await page.getByRole("button", { name: "plus New" }).click();
  await expect(page.getByRole("switch").nth(2)).toHaveAttribute("aria-checked", "false");
  await page.getByRole("button", { name: "arrow-down" }).nth(1).click();
  await expect(page.getByRole("switch").nth(1)).toHaveAttribute("aria-checked", "false");
  await expect(page.getByRole("switch").nth(2)).toHaveAttribute("aria-checked", "true");

  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await expect(page.getByLabel("Meta Data")).toContainText("new boolean1#new-boolean1");
  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("new boolean1");
  await expect(page.getByRole("switch", { name: "check" })).toBeVisible();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.locator("label")).toContainText("new boolean1");
  await expect(page.getByText("new boolean1 description")).toBeVisible();
  await expect(page.getByRole("switch").nth(0)).toHaveAttribute("aria-checked", "true");
  await expect(page.getByRole("switch").nth(1)).toHaveAttribute("aria-checked", "false");
  await expect(page.getByRole("switch").nth(2)).toHaveAttribute("aria-checked", "true");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);

  await expect(page.getByRole("switch").nth(0)).toHaveAttribute("aria-checked", "true");
  await expect(page.getByRole("switch").nth(1)).toHaveAttribute("aria-checked", "false");
  await expect(page.getByRole("switch").nth(2)).toHaveAttribute("aria-checked", "true");
  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "x3" }).click();
  await expect(page.getByRole("switch").nth(1)).toHaveAttribute("aria-checked", "true");
  await expect(page.getByRole("switch").nth(2)).toHaveAttribute("aria-checked", "false");
  await expect(page.getByRole("switch").nth(3)).toHaveAttribute("aria-checked", "true");
  await page.getByRole("switch").nth(1).click();
  await closeNotification(page);
  await page.getByRole("cell").getByLabel("edit").locator("svg").first().click();
  await expect(page.getByRole("switch").nth(0)).toHaveAttribute("aria-checked", "false");
  await expect(page.getByRole("switch").nth(1)).toHaveAttribute("aria-checked", "false");
  await expect(page.getByRole("switch").nth(2)).toHaveAttribute("aria-checked", "true");
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: "plus New" }).click();
  await closeNotification(page);
  await page.getByRole("switch").nth(2).click();
  await closeNotification(page);
  await page.getByRole("button", { name: "plus New" }).click();
  await closeNotification(page);
  await page.getByRole("switch").nth(4).click();
  await closeNotification(page);
  await page.getByRole("button", { name: "delete" }).first().click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "x4" }).click();
  await expect(page.getByRole("switch").nth(1)).toHaveAttribute("aria-checked", "false");
  await expect(page.getByRole("switch").nth(2)).toHaveAttribute("aria-checked", "false");
  await expect(page.getByRole("switch").nth(3)).toHaveAttribute("aria-checked", "false");
  await expect(page.getByRole("switch").nth(4)).toHaveAttribute("aria-checked", "true");
}
