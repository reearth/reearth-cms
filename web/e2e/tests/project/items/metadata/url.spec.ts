import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";

test.beforeEach(async ({ reearth, projectPage }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  const projectName = getId();
  await projectPage.createProject(projectName);
  await projectPage.gotoProject(projectName);
  await projectPage.createModelFromOverview();
});

test.afterEach(async ({ projectPage }) => {
  await projectPage.deleteProject();
});

test("Url metadata creating and updating has succeeded", async ({
  fieldEditorPage,
  contentPage,
}) => {
  await fieldEditorPage.metaDataTab.click();
  await fieldEditorPage.fieldTypeListItem("URL").click();
  await fieldEditorPage.displayNameInput.fill("url1");
  await fieldEditorPage.fieldKeyInput.fill("url1");
  await fieldEditorPage.descriptionRequiredInput.fill("url1 description");
  await fieldEditorPage.okButton.click();
  await contentPage.closeNotification();
  await expect(fieldEditorPage.fieldText("url1", "url1")).toBeVisible();

  await fieldEditorPage.ellipsisButton.click();
  await expect(fieldEditorPage.displayNameInput).toHaveValue("url1");
  await expect(fieldEditorPage.fieldKeyInput).toHaveValue("url1");
  await expect(fieldEditorPage.descriptionRequiredInput).toHaveValue("url1 description");
  await expect(fieldEditorPage.supportMultipleValuesCheckbox).not.toBeChecked();
  await expect(fieldEditorPage.useAsTitleCheckbox).toBeHidden();

  await fieldEditorPage.validationTab.click();
  await expect(fieldEditorPage.requiredFieldCheckbox).not.toBeChecked();
  await expect(fieldEditorPage.uniqueFieldCheckbox).not.toBeChecked();

  await fieldEditorPage.defaultValueTab.click();
  await expect(fieldEditorPage.setDefaultValueInput).toBeEmpty();

  await fieldEditorPage.cancelButton.click();
  await fieldEditorPage.menuItemByName("Content").click();
  await contentPage.newItemButton.click();
  await expect(contentPage.fieldInput("url1")).toBeVisible();
  await expect(contentPage.fieldDescriptionText("url1 description")).toBeVisible();

  await contentPage.fieldInput("url1").fill("http://test1.com");
  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  await expect(contentPage.itemInformationHeading).toBeVisible();
  await expect(contentPage.fieldInput("url1")).toHaveValue("http://test1.com");

  await contentPage.backButtonRole.click();
  const urlLink = contentPage.linkByName("http://test1.com");
  await expect(urlLink).toBeVisible();
  await urlLink.hover();
  const editButton = contentPage.tooltipEditButton;
  await editButton.waitFor({ state: "visible" });
  await editButton.click();
  await contentPage.textBoxes.fill("http://test2.com");
  await contentPage.tableBodyElement.click();
  await contentPage.closeNotification();
  await expect(contentPage.linkByName("http://test2.com")).toBeVisible();

  await contentPage.cellEditButton.click();
  await expect(contentPage.fieldInput("url1")).toHaveValue("http://test2.com");

  await contentPage.fieldInput("url1").fill("http://test3.com");
  await contentPage.closeNotification();
  await expect(contentPage.fieldInput("url1")).toHaveValue("http://test3.com");

  await contentPage.backButtonRole.click();
  await expect(contentPage.linkByName("http://test3.com")).toBeVisible();
});

test("Url metadata editing has succeeded", async ({ fieldEditorPage, contentPage }) => {
  test.slow();
  await fieldEditorPage.metaDataTab.click();
  await fieldEditorPage.fieldTypeListItem("URL").click();
  await fieldEditorPage.displayNameInput.fill("url1");
  await fieldEditorPage.fieldKeyInput.fill("url1");
  await fieldEditorPage.descriptionRequiredInput.fill("url1 description");
  await fieldEditorPage.defaultValueTab.click();
  await fieldEditorPage.setDefaultValueInput.fill("http://default1.com");
  await fieldEditorPage.okButton.click();
  await contentPage.closeNotification();

  await fieldEditorPage.menuItemByName("Content").click();
  await expect(fieldEditorPage.columnHeaderWithEdit("url1")).toBeVisible();

  await contentPage.newItemButton.click();
  await expect(contentPage.fieldInput("url1")).toHaveValue("http://default1.com");

  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  await contentPage.backButtonRole.click();
  await fieldEditorPage.menuItemByName("Schema").click();
  await fieldEditorPage.metaDataTab.click();
  await fieldEditorPage.ellipsisButton.click();
  await fieldEditorPage.displayNameInput.fill("new url1");
  await fieldEditorPage.fieldKeyInput.fill("new-url1");
  await fieldEditorPage.descriptionRequiredInput.fill("new url1 description");
  await fieldEditorPage.supportMultipleValuesCheckbox.check();
  await fieldEditorPage.validationTab.click();
  await fieldEditorPage.requiredFieldCheckbox.check();
  await fieldEditorPage.uniqueFieldCheckbox.check();
  await fieldEditorPage.defaultValueTab.click();
  await expect(fieldEditorPage.firstTextbox).toHaveValue("http://default1.com");

  await fieldEditorPage.plusNewButton.click();
  await fieldEditorPage.textboxByIndex(1).fill("http://default2.com");
  await fieldEditorPage.okButton.click();
  await contentPage.closeNotification();
  await expect(fieldEditorPage.uniqueFieldText("new url1", "new-url1")).toBeVisible();

  await fieldEditorPage.menuItemByName("Content").click();
  await expect(fieldEditorPage.columnHeaderWithEdit("new url1")).toBeVisible();
  await expect(contentPage.linkByName("http://default1.com")).toBeVisible();

  await contentPage.newItemButton.click();
  await expect(fieldEditorPage.uniqueFieldLabel("new url1")).toBeVisible();
  await expect(contentPage.fieldDescriptionText("new url1 description")).toBeVisible();
  await expect(contentPage.textBoxByIndex(0)).toHaveValue("http://default1.com");
  await expect(contentPage.textBoxByIndex(1)).toHaveValue("http://default2.com");

  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  await expect(contentPage.textBoxByIndex(0)).toHaveValue("http://default1.com");
  await expect(contentPage.textBoxByIndex(1)).toHaveValue("http://default2.com");
  await contentPage.backButtonRole.click();
  await contentPage.x2Button.click();
  const tooltipLinks = fieldEditorPage.tooltip.getByRole("link");
  await expect(tooltipLinks.nth(0)).toContainText("http://default1.com");
  await expect(tooltipLinks.nth(1)).toContainText("http://default2.com");
  const urlLink = contentPage.linkByName("http://default2.com");
  await urlLink.hover();
  const editButton = contentPage.tooltipEditButton;
  await editButton.waitFor({ state: "visible" });
  await editButton.click();
  await contentPage.textBoxes.fill("http://new-default2.com");
  await contentPage.tooltipTextByName("new url1").click();
  await contentPage.closeNotification();
  await contentPage.cellEditButtonByIndex(0).click();
  await expect(contentPage.textBoxByIndex(0)).toHaveValue("http://default1.com");
  await expect(contentPage.textBoxByIndex(1)).toHaveValue("http://new-default2.com");
  await fieldEditorPage.plusNewButton.click();
  await fieldEditorPage.lastTextbox.fill("http://default3.com");
  await contentPage.closeNotification();
  await expect(contentPage.textBoxByIndex(0)).toHaveValue("http://default1.com");
  await expect(contentPage.textBoxByIndex(1)).toHaveValue("http://new-default2.com");
  await expect(contentPage.textBoxByIndex(2)).toHaveValue("http://default3.com");

  await contentPage.backButtonRole.click();
  await fieldEditorPage.x3Button.click();
  const updatedTooltipLinks = fieldEditorPage.tooltip.getByRole("link");
  await expect(updatedTooltipLinks.nth(0)).toContainText("http://default1.com");
  await expect(updatedTooltipLinks.nth(1)).toContainText("http://new-default2.com");
  await expect(updatedTooltipLinks.nth(2)).toContainText("http://default3.com");
});
