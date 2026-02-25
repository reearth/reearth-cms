import { SchemaFieldType } from "@reearth-cms/components/molecules/Schema/types";
import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";

const fieldName = "geometryObject1";
const fieldDescription = "geometryObject1 description";
const fieldHeader = "geometryObject1#geometryobject1";
const newFieldName = "new geometryObject1";
const newFieldKey = "new-geometryobject1";
const newFieldDescription = "new geometryObject1 description";

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

test("GeometryObject field creating and updating has succeeded", async ({
  fieldEditorPage,
  contentPage,
}) => {
  await test.step("Create GeometryObject field with Point support", async () => {
    await fieldEditorPage.createField({
      type: SchemaFieldType.GeometryObject,
      name: fieldName,
      description: fieldDescription,
      supportedTypes: ["POINT"],
    });
  });

  await test.step("Verify field created and navigate to new item", async () => {
    await expect(fieldEditorPage.fieldsContainerParagraph).toContainText(fieldHeader);
    await contentPage.contentText.click();
    await contentPage.newItemButton.click();
    await expect(contentPage.labelElement()).toContainText(fieldName);
    await expect(contentPage.mainElement).toContainText(fieldDescription);
  });

  await test.step("Add Point geometry with coordinates [0, 0]", async () => {
    await contentPage.viewLinesEditor.click();
    await contentPage.editorContent.fill('{\n"type": "Point",\n"coordinates": [0, 0]');
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
  });

  await test.step("Verify geometry saved correctly", async () => {
    await contentPage.backButton.click();
    await contentPage.tableColumnButton(5).click();
    await expect(contentPage.tooltip).toContainText('{ "type": "Point", "coordinates": [0, 0] }');
  });

  await test.step("Edit item and update geometry to [1, 0]", async () => {
    await contentPage.editButton.click();
    await contentPage.geometryDeleteButton.click();
    await contentPage.viewLinesEditor.click();
    await contentPage.editorContent.fill('{\n"type": "Point",\n"coordinates": [1, 0]');
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
  });

  await test.step("Verify updated geometry", async () => {
    await contentPage.backButton.click();
    await contentPage.tableColumnButton(5).click();
    await expect(contentPage.tooltip).toContainText('{ "type": "Point", "coordinates": [1, 0] }');
  });
});

test("GeometryObject field editing has succeeded", async ({
  fieldEditorPage,
  contentPage,
  schemaPage,
}) => {
  await test.step("Create GeometryObject field with default value", async () => {
    await fieldEditorPage.createField({
      type: SchemaFieldType.GeometryObject,
      name: fieldName,
      description: fieldDescription,
      supportedTypes: ["POINT"],
      defaultValue: '{\n"type": "Point",\n"coordinates": [0, 0]',
    });
  });

  await test.step("Create new item and verify default value applied", async () => {
    await contentPage.contentText.click();
    await expect(contentPage.tableHead).toContainText(fieldName);
    await contentPage.newItemButton.click();
    await expect(contentPage.viewLinesEditor).toContainText(
      '{  "type": "Point",  "coordinates": [0, 0]}',
    );
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
  });

  await test.step("Verify item saved with default geometry", async () => {
    await contentPage.backButton.click();
    await contentPage.tableColumnButton(5).click();
    await expect(contentPage.tooltip).toContainText('{ "type": "Point", "coordinates": [0, 0] }');
  });

  await test.step("Edit field settings: rename, enable multiple values, and validations", async () => {
    await schemaPage.schemaText.click();
    // TODO(editField): cannot migrate — interleaved reorder + geometry assertions
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
    await expect(fieldEditorPage.viewLinesEditor.nth(0)).toContainText(
      '{  "type": "Point",  "coordinates": [0, 0]}',
    );
  });

  await test.step("Add second default geometry and reorder", async () => {
    await fieldEditorPage.plusNewButton.click();
    await fieldEditorPage.editorContent.nth(1).fill('{\n"type": "Point",\n"coordinates": [1, 0]');
    await fieldEditorPage.firstArrowDownButton.click();
    await expect(fieldEditorPage.viewLinesEditor.nth(0)).toContainText(
      '{  "type": "Point",  "coordinates": [1, 0]}',
    );
    await expect(fieldEditorPage.viewLinesEditor.nth(1)).toContainText(
      '{  "type": "Point",  "coordinates": [0, 0]}',
    );
    await fieldEditorPage.okButton.click();
    await fieldEditorPage.closeNotification();
    // TODO(editField): end migration block
  });

  await test.step("Verify updated field in schema", async () => {
    await expect(schemaPage.uniqueFieldText(newFieldName, newFieldKey)).toBeVisible();
  });

  await test.step("Verify existing item shows old default value", async () => {
    await contentPage.contentText.click();
    await expect(contentPage.tableHead).toContainText(newFieldName);
    await contentPage.tableColumnButton(5).click();
    await expect(contentPage.tooltip).toContainText('{ "type": "Point", "coordinates": [0, 0] }');
  });

  await test.step("Create new item with multiple geometries and reorder", async () => {
    await contentPage.newItemButton.click();
    await expect(contentPage.viewLinesEditor.nth(0)).toContainText(
      '{  "type": "Point",  "coordinates": [1, 0]}',
    );
    await expect(contentPage.viewLinesEditor.nth(1)).toContainText(
      '{  "type": "Point",  "coordinates": [0, 0]}',
    );
    await fieldEditorPage.plusNewButton.click();
    await contentPage.editorContent.nth(2).fill('{\n"type": "Point",\n"coordinates": [2, 0]');
    await fieldEditorPage.arrowUpButtonByIndex(2).click();
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
  });

  await test.step("Verify multiple geometries displayed in list view tooltip", async () => {
    await contentPage.backButton.click();
    await contentPage.x3Button.click();
    await expect(contentPage.tooltipParagraphByIndex(0)).toContainText(
      '{ "type": "Point", "coordinates": [1, 0] }',
    );
    await expect(contentPage.tooltipParagraphByIndex(1)).toContainText(
      '{ "type": "Point", "coordinates": [2, 0] }',
    );
    await expect(contentPage.tooltipParagraphByIndex(2)).toContainText(
      '{ "type": "Point", "coordinates": [0, 0] }',
    );
  });
});
