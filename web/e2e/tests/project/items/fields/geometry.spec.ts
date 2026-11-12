import { SchemaFieldType } from "@reearth-cms/components/molecules/Schema/types";
import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";

// TODO: PR#2058, temporary skip it on CI before backend is ready
test.skip(true, "The unified Geometry field isn't deployed yet");

// Only what unit tests can't cover: the real map, persistence through the server, the content
// list's mini map and which editor a field gets.

const TYPE_POINT = /"type":\s*"Point"/;
const TYPE_LINE_STRING = /"type":\s*"LineString"/;

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

test("Geometry field drawn on the map is saved and shown in the list", async ({
  page,
  fieldEditorPage,
  contentPage,
  geometryEditorPage,
}) => {
  await test.step("Create a Geometry field", async () => {
    await fieldEditorPage.createField(SchemaFieldType.Geometry, "geometry1");
    await expect(fieldEditorPage.fieldsContainerParagraph).toContainText("geometry1#geometry1");
  });

  await test.step("Draw a point on the map, apply and save", async () => {
    await contentPage.contentText.click();
    await contentPage.newItemButton.click();
    await geometryEditorPage.addGeometryButton.click();
    await geometryEditorPage.drawPointAtMapCenter();
    await geometryEditorPage.apply();
    await contentPage.clickAndExpectSuccess(contentPage.saveButton);
  });

  await test.step("The point is still there after a reload", async () => {
    await page.reload();
    await geometryEditorPage.editGeometryButton.click();
    await geometryEditorPage.openGeoJsonPanel();
    await expect(geometryEditorPage.geoJsonText).toContainText(TYPE_POINT);
  });

  await test.step("The content list shows it on a mini map", async () => {
    await geometryEditorPage.close();
    await contentPage.backButton.click();
    await contentPage.tableContentFieldPopoverIcon.click();
    await expect(contentPage.geometryMiniMap).toBeVisible();
  });
});

test("Multiple Geometry field saves several geometries", async ({
  page,
  fieldEditorPage,
  contentPage,
  geometryEditorPage,
}) => {
  await test.step("Create a multiple Geometry field", async () => {
    await fieldEditorPage.fieldTypeButton(SchemaFieldType.Geometry).click();
    await fieldEditorPage.displayNameInput.fill("geometry2");
    await fieldEditorPage.settingsKeyInput.fill("geometry2");
    await fieldEditorPage.supportMultipleValuesCheckbox.check();
    await fieldEditorPage.clickAndExpectSuccess(fieldEditorPage.okButton);
  });

  await test.step("Paste a point and a line, apply and save", async () => {
    await contentPage.contentText.click();
    await contentPage.newItemButton.click();
    await geometryEditorPage.addGeometryButton.click();
    await geometryEditorPage.pasteGeoJson(
      '[{"type": "Point", "coordinates": [139.7, 35.6]}, ' +
        '{"type": "LineString", "coordinates": [[139.7, 35.6], [139.8, 35.7]]}]',
    );
    // Both rows appear only once the typed text is accepted, so a typo fails here, not at Apply.
    await expect(geometryEditorPage.shapeRows).toHaveCount(2);
    await geometryEditorPage.apply();
    await contentPage.clickAndExpectSuccess(contentPage.saveButton);
  });

  await test.step("Both geometries are still there after a reload", async () => {
    await page.reload();
    await geometryEditorPage.editGeometryButton.click();
    await geometryEditorPage.openGeoJsonPanel();
    await expect(geometryEditorPage.geoJsonText).toContainText(TYPE_POINT);
    await expect(geometryEditorPage.geoJsonText).toContainText(TYPE_LINE_STRING);
  });

  await test.step("The content list counts both", async () => {
    await geometryEditorPage.close();
    await contentPage.backButton.click();
    await expect(contentPage.tableContentFieldPopoverIcon).toContainText("x2");
  });
});

test("Legacy Geometry Object field keeps the old editor", async ({
  fieldEditorPage,
  contentPage,
  geometryEditorPage,
}) => {
  await test.step("Create a Geometry Object field limited to points", async () => {
    await fieldEditorPage.selectFieldType(SchemaFieldType.GeometryObject);
    await fieldEditorPage.displayNameInput.fill("geometryObject1");
    await fieldEditorPage.settingsKeyInput.fill("geometryObject1");
    await fieldEditorPage.pointCheckbox.check();
    await fieldEditorPage.clickAndExpectSuccess(fieldEditorPage.okButton);
  });

  await test.step("A new item shows the old GeoJSON editor, not the new one", async () => {
    await contentPage.contentText.click();
    await contentPage.newItemButton.click();
    await expect(fieldEditorPage.viewLinesEditor).toBeVisible();
    await expect(geometryEditorPage.addGeometryButton).toBeHidden();
  });
});
