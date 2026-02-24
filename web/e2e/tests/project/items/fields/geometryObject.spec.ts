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

test("GeometryObject field creating and updating has succeeded", async ({
  fieldEditorPage,
  contentPage,
}) => {
  await test.step("Create GeometryObject field with Point support", async () => {
    await fieldEditorPage.createField({
      type: SchemaFieldType.GeometryObject,
      name: "geometryObject1",
      description: "geometryObject1 description",
      supportedTypes: ["POINT"],
    });
  });

  await test.step("Verify field created and navigate to new item", async () => {
    await expect(fieldEditorPage.fieldsContainerParagraph).toContainText(
      "geometryObject1#geometryobject1",
    );
    await contentPage.contentText.click();
    await contentPage.newItemButton.click();
    await expect(contentPage.labelElement()).toContainText("geometryObject1");
    await expect(contentPage.mainElement).toContainText("geometryObject1 description");
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
    await fieldEditorPage.fieldTypeListItem("Geometry Object").click();
    await fieldEditorPage.displayNameInput.click();
    await fieldEditorPage.displayNameInput.fill("geometryObject1");
    await fieldEditorPage.settingsDescriptionInput.click();
    await fieldEditorPage.settingsDescriptionInput.fill("geometryObject1 description");
    await fieldEditorPage.pointCheckbox.check();
    await fieldEditorPage.defaultValueTab.click();
    await fieldEditorPage.viewLinesEditor.click();
    await fieldEditorPage.editorContent.fill('{\n"type": "Point",\n"coordinates": [0, 0]');
    await fieldEditorPage.okButton.click();
    await fieldEditorPage.closeNotification();
  });

  await test.step("Create new item and verify default value applied", async () => {
    await contentPage.contentText.click();
    await expect(contentPage.tableHead).toContainText("geometryObject1");
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
    await fieldEditorPage.ellipsisMenuButton.click();
    await fieldEditorPage.displayNameInput.click();
    await fieldEditorPage.displayNameInput.fill("new geometryObject1");
    await fieldEditorPage.fieldKeyInput.click();
    await fieldEditorPage.fieldKeyInput.fill("new-geometryobject1");
    await fieldEditorPage.descriptionInput.click();
    await fieldEditorPage.descriptionInput.fill("new geometryObject1 description");
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
  });

  await test.step("Verify updated field in schema", async () => {
    await expect(
      schemaPage.uniqueFieldText("new geometryObject1", "new-geometryobject1"),
    ).toBeVisible();
  });

  await test.step("Verify existing item shows old default value", async () => {
    await contentPage.contentText.click();
    await expect(contentPage.tableHead).toContainText("new geometryObject1");
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
