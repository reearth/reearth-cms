import { SchemaFieldType } from "@reearth-cms/components/molecules/Schema/types";
import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";

test.beforeEach(async ({ projectPage }) => {
  await projectPage.goto("/", { waitUntil: "domcontentloaded" });
  const projectName = getId();
  await projectPage.createProject(projectName);
  await projectPage.gotoProject(projectName);
  await projectPage.createModelFromOverview();
});

test.afterEach(async ({ projectPage }) => {
  await projectPage.deleteProject();
});

test("@smoke Boolean field creating and updating has succeeded", async ({
  fieldEditorPage,
  contentPage,
}) => {
  await fieldEditorPage.createField({
    type: SchemaFieldType.Bool,
    name: "boolean1",
    key: "boolean1",
    description: "boolean1 description",
  });

  await expect(fieldEditorPage.fieldsContainerParagraph).toContainText("boolean1#boolean1");
  await contentPage.contentText.click();
  await contentPage.newItemButton.click();
  await expect(contentPage.labelElement()).toContainText("boolean1");
  await expect(contentPage.mainElement).toContainText("boolean1 description");

  await contentPage.fieldInput("boolean1").click();
  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  await contentPage.backButton.click();
  await expect(contentPage.allSwitches).toHaveAttribute("aria-checked", "true");
  await contentPage.editButton.click();
  await expect(contentPage.allSwitches).toHaveAttribute("aria-checked", "true");
  await contentPage.fieldInput("boolean1").click();
  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  await contentPage.backButton.click();
  await expect(contentPage.allSwitches).toHaveAttribute("aria-checked", "false");
});

test("Boolean field editing has succeeded", async ({
  fieldEditorPage,
  contentPage,
  schemaPage,
}) => {
  await fieldEditorPage.createField({
    type: SchemaFieldType.Bool,
    name: "boolean1",
    key: "boolean1",
    description: "boolean1 description",
    defaultValue: true,
  });
  await contentPage.contentText.click();
  await expect(contentPage.tableHead).toContainText("boolean1");
  await contentPage.newItemButton.click();
  await expect(contentPage.allSwitches).toHaveAttribute("aria-checked", "true");
  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  await contentPage.backButton.click();
  await expect(contentPage.allSwitches).toHaveAttribute("aria-checked", "true");
  await schemaPage.schemaText.click();
  await fieldEditorPage.ellipsisMenuButton.click();
  await fieldEditorPage.displayNameInput.click();
  await fieldEditorPage.displayNameInput.fill("new boolean1");
  await fieldEditorPage.fieldKeyInput.click();
  await fieldEditorPage.fieldKeyInput.fill("new-boolean1");
  await fieldEditorPage.descriptionInput.click();
  await fieldEditorPage.descriptionInput.fill("new boolean1 description");
  await fieldEditorPage.supportMultipleValuesCheckbox.check();
  await expect(fieldEditorPage.useAsTitleCheckbox).toBeHidden();
  await fieldEditorPage.validationTab.click();
  await expect(fieldEditorPage.makeFieldRequiredLabel.locator("span").nth(1)).toBeDisabled();
  await expect(fieldEditorPage.setFieldAsUniqueLabel.locator("span").nth(1)).toBeDisabled();
  await fieldEditorPage.defaultValueTab.click();
  await expect(fieldEditorPage.switchByIndex(0)).toHaveAttribute("aria-checked", "true");
  await fieldEditorPage.plusNewButton.click();
  await expect(fieldEditorPage.switchByIndex(1)).toHaveAttribute("aria-checked", "false");
  await fieldEditorPage.firstArrowDownButton.click();
  await expect(fieldEditorPage.switchByIndex(0)).toHaveAttribute("aria-checked", "false");
  await expect(fieldEditorPage.switchByIndex(1)).toHaveAttribute("aria-checked", "true");
  await fieldEditorPage.okButton.click();
  await contentPage.closeNotification();
  await expect(schemaPage.fieldText("new boolean1", "new-boolean1")).toBeVisible();
  await contentPage.contentText.click();
  await expect(contentPage.tableHead).toContainText("new boolean1");
  await expect(contentPage.checkSwitch).toBeVisible();
  await contentPage.newItemButton.click();
  await expect(contentPage.switchByIndex(0)).toHaveAttribute("aria-checked", "false");
  await expect(contentPage.switchByIndex(1)).toHaveAttribute("aria-checked", "true");
  await fieldEditorPage.plusNewButton.click();
  await expect(contentPage.switchByIndex(2)).toHaveAttribute("aria-checked", "false");
  await fieldEditorPage.arrowUpButtonByIndex(2).click();
  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  await contentPage.backButton.click();
  await contentPage.x3Button.click();
  await expect(contentPage.tooltip).toContainText("new boolean1");
  await expect(contentPage.switchByIndex(1)).toHaveAttribute("aria-checked", "false");
  await expect(contentPage.switchByIndex(2)).toHaveAttribute("aria-checked", "false");
  await expect(contentPage.switchByIndex(3)).toHaveAttribute("aria-checked", "true");
});
