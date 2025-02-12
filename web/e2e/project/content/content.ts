import { Page, expect } from "@playwright/test";

import { closeNotification } from "@reearth-cms/e2e/common/notification";

import { crudComment } from "../utils/comment";
import { handleFieldForm } from "../utils/field";

export async function CRUDandSearching(page: Page) {
  // Setup text field
  await page.locator("li").filter({ hasText: "Text" }).locator("div").first().click();
  await handleFieldForm(page, "text");

  // Create and verify new item
  await page.getByText("Content").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByLabel("text").fill("text");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);

  // Verify and search
  await page.getByLabel("Back").click();
  const textCell = page.getByRole("cell", { name: "text", exact: true });
  await expect(textCell).toBeVisible();

  // Test search functionality
  const searchInput = page.getByPlaceholder("input search text");
  await searchInput.fill("no field");
  await page.getByRole("button", { name: "search" }).click();
  await expect(textCell).toBeHidden();

  await searchInput.fill("");
  await page.getByRole("button", { name: "search" }).click();
  await expect(textCell).toBeVisible();

  // Edit and verify
  await page.getByRole("cell").getByLabel("edit").locator("svg").click();
  await page.getByLabel("text").fill("new text");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);

  // Verify and delete
  await page.getByLabel("Back").click();
  const newTextCell = page.getByRole("cell", { name: "new text" });
  //   await expect(newTextCell).toBeVisible();

  await page.getByLabel("", { exact: true }).check();
  await page.getByText("Delete").click();
  await closeNotification(page);
  await expect(newTextCell).toBeHidden();
}

export async function PublishingAndUnpublishingFromEdit(page: Page) {
  // Setup text field
  await page.locator("li").filter({ hasText: "Text" }).locator("div").first().click();
  await handleFieldForm(page, "text");

  // Create and verify new item
  await page.getByText("Content").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByLabel("text").fill("text");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);

  // Verify draft state
  const draftState = page.getByText("DRAFT");
  await expect(draftState).toBeVisible();

  // Publish and verify
  await page.getByRole("button", { name: "Publish" }).click();
  await closeNotification(page);
  const publicState = page.getByText("PUBLIC");
  await expect(publicState).toBeVisible();

  // Navigate and verify published state
  await page.getByLabel("Back").click();
  await expect(publicState).toBeVisible();

  // Unpublish and verify
  await page.getByRole("cell").getByLabel("edit").locator("svg").click();
  await expect(publicState).toBeVisible();
  await page.getByRole("button", { name: "ellipsis" }).click();
  await page.getByText("Unpublish").click();
  await closeNotification(page);
  await expect(draftState).toBeVisible();

  // Final verification
  await page.getByLabel("Back").click();
  await expect(draftState).toBeVisible();
}

export async function PublishingAndUnpublishingFromTable(page: Page) {
  // Setup text field
  await page.locator("li").filter({ hasText: "Text" }).locator("div").first().click();
  await handleFieldForm(page, "text");

  // Create and verify new item
  await page.getByText("Content").first().click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByLabel("text").fill("text");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);

  // Verify draft state
  const draftState = page.getByText("DRAFT");
  await expect(draftState).toBeVisible();

  // Publish and verify
  await page.getByRole("button", { name: "Publish" }).click();
  await closeNotification(page);
  const publicState = page.getByText("PUBLIC");
  await expect(publicState).toBeVisible();

  // Navigate and verify published state
  await page.getByLabel("Back").click();
  await expect(publicState).toBeVisible();

  // Unpublish and verify
  await page.getByRole("cell").getByLabel("edit").locator("svg").click();
  await expect(publicState).toBeVisible();
  await page.getByRole("button", { name: "ellipsis" }).click();
  await page.getByText("Unpublish").click();
  await closeNotification(page);
  await expect(draftState).toBeVisible();
}
export async function ShowingItemTitle(page: Page) {
  // Setup text field
  await page.locator("li").filter({ hasText: "Text" }).locator("div").first().click();
  await handleFieldForm(page, "text");

  // Navigate to content and create new item
  await page.getByText("Content").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.getByTitle("e2e model name", { exact: true })).toBeVisible();

  // Fill text field and save
  await page.getByLabel("text").click();
  await page.getByLabel("text").fill("text");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);

  // Get item ID and verify title
  const itemId = await page
    .getByRole("main")
    .locator("p")
    .filter({ hasText: "ID" })
    .locator("div > span")
    .innerText();
  await expect(page.getByTitle(`e2e model name / ${itemId}`, { exact: true })).toBeVisible();

  // Configure schema to use text field as title
  await page.getByText("Schema").click();
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  await page.getByLabel("Use as title").check();

  // Set default value for text field
  await page.getByRole("tab", { name: "Default value" }).click();
  await page.getByLabel("Set default value").click();
  await page.getByLabel("Set default value").fill("default text");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);

  // Verify title updates with text field value
  await page.getByText("Content").click();
  await page.getByRole("cell").getByLabel("edit").locator("svg").click();
  await expect(page.getByTitle(`e2e model name / text`, { exact: true })).toBeVisible();
  await page.getByLabel("Back").click();

  // Create new item with default title
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.getByTitle("e2e model name", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);

  // Verify title uses default value
  await expect(page.getByTitle(`e2e model name / default text`, { exact: true })).toBeVisible();
}
export async function CommentCRUDonContentPage(page: Page) {
  // Setup text field
  await page.locator("li").filter({ hasText: "Text" }).locator("div").first().click();
  await handleFieldForm(page, "text");

  // Navigate to content and create new item
  await page.getByText("Content").click();
  await page.getByRole("button", { name: "plus New Item" }).click();

  // Fill text field and save
  await page.getByLabel("text").click();
  await page.getByLabel("text").fill("text");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);

  // Navigate back and open comments section
  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "0" }).click();

  // Verify comments section is visible and perform CRUD operations
  await expect(page.getByText("CommentsNo comments.0 / 1000Comment")).toBeVisible();
  await crudComment(page);
}
export async function CommentCRUDOnEditPage(page: Page) {
  // Setup text field
  await page.locator("li").filter({ hasText: "Text" }).locator("div").first().click();
  await handleFieldForm(page, "text");

  // Navigate to content and create new item
  await page.getByText("Content").click();
  await page.getByRole("button", { name: "plus New Item" }).click();

  // Fill text field and save
  await page.getByLabel("text").click();
  await page.getByLabel("text").fill("text");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);

  // Navigate back and open comments section from edit page
  await page.getByLabel("Back").click();
  await page.getByLabel("comment").click();

  // Wait for comments section to load and verify visibility
  await expect(page.getByRole("heading", { name: "Comments" })).toBeVisible();
  await expect(page.getByText("0 / 1000")).toBeVisible();
  await expect(page.getByRole("button", { name: "Comment" })).toBeVisible();

  // Perform CRUD operations
  await crudComment(page);
}
