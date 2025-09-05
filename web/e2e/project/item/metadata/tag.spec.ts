import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { createModelFromOverview } from "@reearth-cms/e2e/project/utils/model";
import { createProject, deleteProject } from "@reearth-cms/e2e/project/utils/project";

const fieldName = "tag";
const description = "tag description";
const tag1 = "Tag1";
const tag2 = "Tag2";

test.beforeEach(async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
  await createModelFromOverview(page);
});

test.afterEach(async ({ page }) => {
  await deleteProject(page);
});

test("Tag metadata creating and updating has succeeded", async ({ page }) => {
  await page.getByRole("tab", { name: "Meta Data" }).click();
  await page.getByRole("listitem").filter({ hasText: "Tag" }).click();
  await page.getByLabel("Display name").fill(fieldName);
  await page.getByLabel("Field Key").fill(fieldName);
  await page.getByLabel("Description").fill(description);
  await page.getByRole("button", { name: "plus New" }).click();
  await page
    .getByRole("tabpanel", { name: "settings" })
    .locator("div")
    .filter({ hasText: /^Tag$/ })
    .last()
    .click();
  await page.getByRole("textbox").last().fill(tag1);
  await page.getByRole("button", { name: "plus New" }).click();
  await page
    .getByRole("tabpanel", { name: "settings" })
    .locator("div")
    .filter({ hasText: /^Tag$/ })
    .last()
    .click();
  await page.getByRole("textbox").last().fill("");
  await expect(page.getByText("Empty values are not allowed")).toBeVisible();
  await expect(page.getByRole("button", { name: "OK" })).toBeDisabled();

  await page.getByRole("textbox").last().fill(tag1);
  await expect(page.getByText("Labels must be unique")).toBeVisible();
  await expect(page.getByRole("button", { name: "OK" })).toBeDisabled();

  await page.getByRole("textbox").last().fill(tag2);
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await expect(page.getByText(`${fieldName}#${fieldName}`)).toBeVisible();

  await page.getByRole("button", { name: "ellipsis" }).click();
  await expect(page.getByLabel("Display name")).toHaveValue(fieldName);
  await expect(page.getByLabel("Field Key")).toHaveValue(fieldName);
  await expect(page.getByLabel("Description")).toHaveValue(description);
  await expect(page.getByText(tag1)).toBeVisible();
  await expect(page.getByText(tag2)).toBeVisible();
  await expect(page.getByLabel("Support multiple values")).not.toBeChecked();
  await expect(page.getByLabel("Use as title")).toBeHidden();

  await page.getByRole("tab", { name: "Validation" }).click();
  await expect(page.getByLabel("Make field required")).not.toBeChecked();
  await expect(page.getByLabel("Set field as unique")).not.toBeChecked();

  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByLabel("Set default value")).toBeEmpty();

  await page.getByRole("button", { name: "Cancel" }).click();
  await page.getByRole("menuitem", { name: "Content" }).click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.getByText(description)).toBeVisible();

  await page.getByLabel(fieldName).click();
  await page.getByText(tag1).click();
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await expect(page.getByRole("heading", { name: "Item Information" })).toBeVisible();
  await expect(page.getByRole("tabpanel").getByText(tag1)).toBeVisible();

  await page.getByRole("button", { name: "back" }).click();
  await page.getByRole("cell", { name: "tag" }).locator("div").nth(1).click();
  await page.getByText(tag2).last().click();
  await closeNotification(page);
  await expect(page.getByRole("cell", { name: tag2 })).toBeVisible();

  await page.getByRole("cell").getByLabel("edit").locator("svg").click();
  await expect(page.getByRole("tabpanel").getByText(tag2)).toBeVisible();

  await page.getByText(tag2).click();
  await page.getByText(tag1).click();
  await closeNotification(page);
  await expect(page.getByRole("tabpanel").getByText(tag1)).toBeVisible();

  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByRole("cell", { name: tag1 })).toBeVisible();
});

test("Tag metadata editing has succeeded", async ({ page }) => {
  const newFieldName = `new ${fieldName}`;
  const newKey = `new-${fieldName}`;
  const newDescription = `new ${description}`;
  const tag3 = "Tag3";

  await page.getByRole("tab", { name: "Meta Data" }).click();
  await page.getByRole("listitem").filter({ hasText: "Tag" }).click();
  await page.getByLabel("Display name").fill(fieldName);
  await page.getByLabel("Field Key").fill(fieldName);
  await page.getByLabel("Description").fill(description);
  await page.getByRole("button", { name: "plus New" }).click();
  await page
    .getByRole("tabpanel", { name: "settings" })
    .locator("div")
    .filter({ hasText: /^Tag$/ })
    .last()
    .click();
  await page.getByRole("textbox").last().fill(tag1);
  await page.getByRole("button", { name: "plus New" }).click();
  await page
    .getByRole("tabpanel", { name: "settings" })
    .locator("div")
    .filter({ hasText: /^Tag$/ })
    .last()
    .click();
  await page.getByRole("textbox").last().fill(tag2);
  await page.getByRole("tab", { name: "Default value" }).click();
  await page.getByLabel("Set default value").click();
  await page.getByText(tag1).last().click();
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);

  await page.getByRole("menuitem", { name: "Content" }).click();
  await expect(page.getByRole("columnheader", { name: `${fieldName} edit` })).toBeVisible();

  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.getByText("Tag1")).toBeVisible();

  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByRole("menuitem", { name: "Schema" }).click();
  await page.getByRole("tab", { name: "Meta Data" }).click();
  await page.getByRole("button", { name: "ellipsis" }).click();
  await page.getByLabel("Display name").fill(newFieldName);
  await page.getByLabel("Field Key").fill(newKey);
  await page.getByLabel("Description").fill(newDescription);
  await page.getByRole("button", { name: "plus New" }).click();
  await page
    .getByRole("tabpanel", { name: "settings" })
    .locator("div")
    .filter({ hasText: /^Tag$/ })
    .last()
    .click();
  await page.getByRole("textbox").last().fill(tag3);
  await page.getByLabel("Support multiple values").check();
  await page.getByRole("tab", { name: "Validation" }).click();
  await page.getByLabel("Make field required").check();
  await page.getByLabel("Set field as unique").check();
  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByLabel("Default value", { exact: true }).getByText(tag1)).toBeVisible();
  await page.locator(".ant-select-selector").click();
  await expect(page.getByText(tag1).last()).toBeVisible();
  await page.getByText(tag2).last().click();
  await page.getByText(tag3).last().click();
  await expect(page.getByLabel("Default value", { exact: true }).getByText(tag1)).toBeVisible();
  await expect(page.getByLabel("Default value", { exact: true }).getByText(tag2)).toBeVisible();
  await expect(page.getByLabel("Default value", { exact: true }).getByText(tag3)).toBeVisible();

  await page.getByRole("tab", { name: "Settings" }).click();
  await page.getByLabel("Update Tag").getByRole("button", { name: "delete" }).first().click();
  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByLabel("Default value", { exact: true }).getByText(tag1)).toBeHidden();
  await expect(page.getByLabel("Default value", { exact: true }).getByText(tag2)).toBeVisible();
  await expect(page.getByLabel("Default value", { exact: true }).getByText(tag3)).toBeVisible();

  await page.locator(".ant-select-selector").click();
  await expect(page.getByText(tag1).last()).toBeHidden();

  await page.locator(".ant-select-selector").click();
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await expect(page.getByText(`${newFieldName} *#${newKey}(unique)`)).toBeVisible();

  await page.getByRole("menuitem", { name: "Content" }).click();
  await expect(page.getByRole("columnheader", { name: `${newFieldName} edit` })).toBeVisible();
  await expect(page.getByText(tag1, { exact: true })).toBeHidden();

  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.getByText(`${newFieldName}(unique)`)).toBeVisible();
  await expect(page.getByText(newDescription)).toBeVisible();
  await expect(page.getByText(tag2)).toBeVisible();
  await expect(page.getByText(tag3)).toBeVisible();

  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await expect(page.getByText(tag2)).toBeVisible();
  await expect(page.getByText(tag3)).toBeVisible();

  await page.getByRole("button", { name: "Back" }).click();
  await page.getByRole("cell", { name: `${tag2} ${tag3}` }).click();
  await page.getByText(tag2).last().click();
  await closeNotification(page);
  await page.getByRole("cell").getByLabel("edit").locator("svg").first().click();
  await expect(page.getByText(tag2)).toBeHidden();
  await expect(page.getByText(tag3)).toBeVisible();

  await page.getByLabel("close-circle").locator("svg").hover();
  await page.getByLabel("close-circle").locator("svg").click();
  await expect(page.getByText("Please input field!")).toBeVisible();
  await page.locator(".ant-select-selector").click();
  await page.getByText(tag2).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await expect(page.getByText(tag2)).toBeVisible();
});
