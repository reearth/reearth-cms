import { SchemaFieldType } from "@reearth-cms/components/molecules/Schema/types";
import { expect, TAG, test } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";

const fieldName = "date1";
const fieldKey = "date1";
const fieldDescription = "date1 description";
const fieldHeader = "date1#date1";
const newFieldName = "new date1";
const newFieldKey = "new-date1";
const newFieldDescription = "new date1 description";
const defaultDate = "2024-01-01";

test.beforeEach(async ({ projectPage }) => {
  await projectPage.goto("/");
  const projectName = getId();
  await projectPage.createProject(projectName);
  await projectPage.gotoProject(projectName);
  await projectPage.createModelFromOverview();
});

test.afterEach(async ({ projectPage }) => {
  await projectPage.deleteProject();
});

test(
  "Date field creating and updating has succeeded",
  { tag: TAG.SMOKE },
  async ({ fieldEditorPage, contentPage }) => {
    await fieldEditorPage.createField({
      type: SchemaFieldType.Date,
      name: fieldName,
      key: fieldKey,
      description: fieldDescription,
    });

    await expect(fieldEditorPage.fieldsContainerParagraph).toContainText(fieldHeader);
    await contentPage.contentText.click();
    await contentPage.newItemButton.click();
    await expect(contentPage.labelElement()).toContainText(fieldName);
    await expect(contentPage.mainElement).toContainText(fieldDescription);

    await contentPage.selectDatePlaceholder.click();
    await contentPage.selectDatePlaceholder.fill(defaultDate);
    await contentPage.selectDatePlaceholder.press("Enter");
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
    await contentPage.backButton.click();
    await expect(contentPage.tableBody).toContainText(defaultDate);
    await contentPage.editButton.click();
    await contentPage.closeDateButton.click();
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
    await contentPage.backButton.click();
    await expect(contentPage.tableBody).not.toContainText(defaultDate);
  },
);

test("Date field editing has succeeded", async ({ fieldEditorPage, contentPage, schemaPage }) => {
  await fieldEditorPage.createField({
    type: SchemaFieldType.Date,
    name: fieldName,
    key: fieldKey,
    description: fieldDescription,
    defaultValue: defaultDate,
  });
  await contentPage.contentText.click();
  await expect(contentPage.tableHead).toContainText(fieldName);
  await contentPage.newItemButton.click();
  await expect(contentPage.selectDatePlaceholder).toHaveValue(defaultDate);
  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  await contentPage.backButton.click();
  await expect(contentPage.tableBody).toContainText(defaultDate);
  await schemaPage.schemaText.click();
  await fieldEditorPage.ellipsisMenuButton.click();
  await fieldEditorPage.displayNameInput.click();
  await fieldEditorPage.displayNameInput.fill(newFieldName);
  await fieldEditorPage.fieldKeyInput.click();
  await fieldEditorPage.fieldKeyInput.fill(newFieldKey);
  await fieldEditorPage.descriptionInput.click();
  await fieldEditorPage.descriptionInput.fill(newFieldDescription);
  await fieldEditorPage.supportMultipleValuesCheckbox.check();
  await expect(fieldEditorPage.useAsTitleCheckbox).toBeHidden();
  await fieldEditorPage.validationTab.click();
  await fieldEditorPage.requiredFieldCheckbox.check();
  await fieldEditorPage.uniqueFieldCheckbox.check();
  await fieldEditorPage.defaultValueTab.click();
  await expect(fieldEditorPage.selectDatePlaceholder).toHaveValue(defaultDate);
  await fieldEditorPage.textboxByIndex(0).click();
  await fieldEditorPage.titleDiv("2024-01-02").click();
  await fieldEditorPage.plusNewButton.click();
  await fieldEditorPage.textboxByIndex(1).click();
  await fieldEditorPage.textboxByIndex(1).fill("2024-01-03");
  await fieldEditorPage.textboxByIndex(1).press("Enter");
  await fieldEditorPage.firstArrowDownButton.click();
  await expect(fieldEditorPage.selectDatePlaceholder.nth(0)).toHaveValue("2024-01-03");
  await fieldEditorPage.okButton.click();
  await contentPage.closeNotification();
  await expect(schemaPage.uniqueFieldText(newFieldName, newFieldKey)).toBeVisible();
  await contentPage.contentText.click();
  await expect(contentPage.tableHead).toContainText(newFieldName);
  await expect(contentPage.tableBody).toContainText(defaultDate);
  await contentPage.newItemButton.click();
  await expect(contentPage.labelElement()).toContainText("new date1(unique)");
  await expect(contentPage.textBoxByIndex(0)).toHaveValue("2024-01-03");
  await expect(contentPage.textBoxByIndex(1)).toHaveValue("2024-01-02");
  await fieldEditorPage.plusNewButton.click();
  await contentPage.textBoxByIndex(2).click();
  await contentPage.textBoxByIndex(2).fill("2024-01-04");
  await contentPage.textBoxByIndex(2).press("Enter");
  await contentPage.saveButton.click();
  await contentPage.closeNotification();
  await contentPage.backButton.click();
  await contentPage.x3Button.click();
  await expect(contentPage.tooltipParagraphByIndex(0)).toContainText("2024-01-03");
  await expect(contentPage.tooltipParagraphByIndex(1)).toContainText("2024-01-02");
  await expect(contentPage.tooltipParagraphByIndex(2)).toContainText("2024-01-04");
});
