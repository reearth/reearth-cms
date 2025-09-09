import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { createModelFromOverview } from "@reearth-cms/e2e/project/utils/model";
import { createProject, deleteProject } from "@reearth-cms/e2e/project/utils/project";

test.beforeEach(async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
  await createModelFromOverview(page);
});

test.afterEach(async ({ page }) => {
  await deleteProject(page);
});

test("Text metadata creating and updating has succeeded", async ({
  page,
  metadataEditorPage,
  contentPage,
  itemEditorPage,
}) => {
  // Create metadata field
  await metadataEditorPage.createMetadataField("Text", "text1", "text1", "text1 description");
  await metadataEditorPage.expectMetadataFieldInList("text1", "text1");

  // Verify metadata configuration
  await metadataEditorPage.editMetadataField();
  await metadataEditorPage.expectFieldValue("Display name", "text1");
  await metadataEditorPage.expectFieldValue("Field Key", "text1");
  await metadataEditorPage.expectFieldValue("Description", "text1 description");
  await metadataEditorPage.expectFieldChecked("Support multiple values", false);
  await metadataEditorPage.expectFieldHidden("Use as title");

  await metadataEditorPage.switchToTab("Validation");
  await metadataEditorPage.expectFieldEmpty("Set maximum length");
  await metadataEditorPage.expectFieldChecked("Make field required", false);
  await metadataEditorPage.expectFieldChecked("Set field as unique", false);

  await metadataEditorPage.switchToTab("Default value");
  await metadataEditorPage.expectFieldEmpty("Set default value");

  await metadataEditorPage.cancelMetadataConfiguration();

  // Test content creation
  await page.getByRole("menuitem", { name: "Content" }).click();
  await contentPage.createNewItem();
  await itemEditorPage.expectFieldVisible("text1");
  await expect(page.getByText("text1 description")).toBeVisible();

  await itemEditorPage.fillTextField("text1", "text1");
  await itemEditorPage.saveItem();
  await expect(page.getByRole("heading", { name: "Item Information" })).toBeVisible();
  await itemEditorPage.expectFieldValue("text1", "text1");

  await itemEditorPage.goBack();
  await expect(page.getByRole("textbox")).toHaveValue("text1");

  // Test inline editing
  await page.getByRole("textbox").fill("new text1");
  await page.locator(".ant-table-body").click();
  await itemEditorPage.closeNotification();
  await expect(page.getByRole("textbox")).toHaveValue("new text1");

  await page.getByRole("cell").getByLabel("edit").locator("svg").click();
  await itemEditorPage.expectFieldValue("text1", "new text1");

  await itemEditorPage.fillTextField("text1", "text1");
  await itemEditorPage.closeNotification();
  await itemEditorPage.expectFieldValue("text1", "text1");

  await itemEditorPage.goBack();
  await expect(page.getByRole("textbox")).toHaveValue("text1");
});

test("Text metadata editing has succeeded", async ({ page }) => {
  test.slow();
  await page.getByRole("tab", { name: "Meta Data" }).click();
  await page.getByRole("listitem").filter({ hasText: "Text" }).click();
  await page.getByLabel("Display name").fill("text1");
  await page.getByLabel("Field Key").fill("text1");
  await page.getByLabel("Description").fill("text1 description");
  await page.getByRole("tab", { name: "Default value" }).click();
  await page.getByLabel("Set default value").fill("text1 default value");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);

  await page.getByRole("menuitem", { name: "Content" }).click();
  await expect(page.getByRole("columnheader", { name: "text1 edit" })).toBeVisible();

  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.getByLabel("text1")).toHaveValue("text1 default value");

  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByRole("menuitem", { name: "Schema" }).click();
  await page.getByRole("tab", { name: "Meta Data" }).click();
  await page.getByRole("button", { name: "ellipsis" }).click();
  await page.getByLabel("Display name").fill("new text1");
  await page.getByLabel("Field Key").fill("new-text1");
  await page.getByLabel("Description").fill("new text1 description");
  await page.getByLabel("Support multiple values").check();
  await page.getByRole("tab", { name: "Validation" }).click();
  await page.getByLabel("Set maximum length").fill("5");
  await page.getByLabel("Make field required").check();
  await page.getByLabel("Set field as unique").check();
  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByRole("textbox").nth(0)).toHaveValue("text1 default value");

  await page.getByRole("button", { name: "plus New" }).click();
  await page.getByRole("textbox").nth(1).fill("text2");
  await expect(page.getByRole("button", { name: "OK" })).toBeDisabled();
  await page.getByRole("textbox").nth(0).fill("text1");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await expect(page.getByText("new text1 *#new-text1(unique)")).toBeVisible();

  await page.getByRole("menuitem", { name: "Content" }).click();
  await expect(page.getByRole("columnheader", { name: "new text1 edit" })).toBeVisible();
  await expect(page.getByRole("textbox")).toHaveValue("text1 default value");

  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.getByText("new text1(unique)")).toBeVisible();
  await expect(page.getByText("new text1 description")).toBeVisible();
  await expect(page.getByRole("textbox").nth(0)).toHaveValue("text1");
  await expect(page.getByRole("textbox").nth(1)).toHaveValue("text2");
  await page.getByRole("textbox").nth(1).fill("text22");
  await expect(page.getByRole("button", { name: "Save" })).toBeDisabled();
  await page.getByRole("textbox").nth(1).fill("text2");

  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await expect(page.getByRole("textbox").nth(0)).toHaveValue("text1");
  await expect(page.getByRole("textbox").nth(1)).toHaveValue("text2");

  await page.getByRole("button", { name: "Back" }).click();
  await page.getByRole("button", { name: "x2" }).click();
  await expect(page.getByRole("tooltip").getByRole("textbox").nth(0)).toHaveValue("text1");
  await expect(page.getByRole("tooltip").getByRole("textbox").nth(1)).toHaveValue("text2");

  await page.getByRole("tooltip").getByRole("textbox").nth(1).fill("new text2");
  await page.getByRole("tooltip").getByText("new text1").click();
  await closeNotification(page, false);
  await page.getByRole("button", { name: "x2" }).click();
  await page.getByRole("tooltip").getByRole("textbox").nth(1).fill("text3");
  await page.getByRole("tooltip").getByText("new text1").click();
  await closeNotification(page);
  await page.getByRole("cell").getByLabel("edit").locator("svg").first().click();
  await expect(page.getByRole("textbox").nth(0)).toHaveValue("text1");
  await expect(page.getByRole("textbox").nth(1)).toHaveValue("text3");
  await page.getByRole("button", { name: "plus New" }).click();
  await page.getByRole("textbox").last().fill("text2");
  await closeNotification(page);
  await expect(page.getByRole("textbox").nth(0)).toHaveValue("text1");
  await expect(page.getByRole("textbox").nth(1)).toHaveValue("text3");
  await expect(page.getByRole("textbox").nth(2)).toHaveValue("text2");

  await page.getByRole("button", { name: "Back" }).click();
  await page.getByRole("button", { name: "x3" }).click();
  await expect(page.getByRole("tooltip").getByRole("textbox").nth(0)).toHaveValue("text1");
  await expect(page.getByRole("tooltip").getByRole("textbox").nth(1)).toHaveValue("text3");
  await expect(page.getByRole("tooltip").getByRole("textbox").nth(2)).toHaveValue("text2");
});
