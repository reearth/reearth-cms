import path from "path";
import { fileURLToPath } from "url";

import { SchemaFieldType } from "@reearth-cms/components/molecules/Schema/types";
import { expect, TAG, test } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMPORT_SCHEMA_TEMPLATE_PATH = path.resolve(
  __dirname,
  "../../../public/templates/import-schema-template.json",
);

test.beforeEach(async ({ projectPage }) => {
  await projectPage.goto("/");
  const projectName = getId();
  await projectPage.createProject(projectName);
  await projectPage.gotoProject(projectName);
  await projectPage.schemaMenuItem.click();
});

test.afterEach(async ({ projectPage }) => {
  await projectPage.deleteProject();
});

test("Model CRUD has succeeded", { tag: TAG.SMOKE }, async ({ schemaPage, fieldEditorPage }) => {
  const modelName = "model name";
  const modelKey = "model-key";
  const newModelName = "new model name";
  const newModelKey = "new-model-key";

  await test.step("Create model", async () => {
    await schemaPage.createModelFromSidebar(modelName, modelKey);
    await expect(fieldEditorPage.titleByText(modelName, true)).toBeVisible();
    await expect(schemaPage.textByExact(`#${modelKey}`)).toBeVisible();
    await expect(schemaPage.modelMenuItemSpan(modelName)).toBeVisible();
  });

  await test.step("Update model", async () => {
    await schemaPage.updateModel(newModelName, newModelKey);
    await expect(fieldEditorPage.titleByText(newModelName)).toBeVisible();
    await expect(schemaPage.textByExact(`#${newModelKey}`)).toBeVisible();
    await expect(schemaPage.modelMenuItemSpan(newModelName)).toBeVisible();
  });

  await test.step("Delete model", async () => {
    await schemaPage.deleteModel();
    await expect(fieldEditorPage.titleByText(newModelName)).toBeHidden();
  });
});

test("Model reordering has succeeded", async ({ schemaPage }) => {
  const modelName1 = "model1";
  const modelName2 = "model2";
  const modelName3 = "model3";

  await test.step("Create two models and verify initial order", async () => {
    await schemaPage.createModelFromSidebar(modelName1);
    await schemaPage.createModelFromSidebar(modelName2);
    await expect(schemaPage.modelMenuItems().nth(0)).toContainText(modelName1);
    await expect(schemaPage.modelMenuItems().nth(1)).toContainText(modelName2);
  });

  await test.step("Drag model2 above model1", async () => {
    await schemaPage.modelMenuItem(modelName2).dragTo(schemaPage.modelMenuItem(modelName1));
    await schemaPage.closeNotification();
    await expect(schemaPage.modelMenuItems().nth(0)).toContainText(modelName2);
    await expect(schemaPage.modelMenuItems().nth(1)).toContainText(modelName1);
  });

  await test.step("Create third model and verify it appears at the end", async () => {
    await schemaPage.createModelFromSidebar(modelName3);
    await expect(schemaPage.modelMenuItems().nth(0)).toContainText(modelName2);
    await expect(schemaPage.modelMenuItems().nth(1)).toContainText(modelName1);
    await expect(schemaPage.modelMenuItems().nth(2)).toContainText(modelName3);
  });
});

test.describe("Test import schema", () => {
  test("Import schema from static file has succeeded", async ({ schemaPage }) => {
    const modelName = `model-${getId()}`;
    const modelKey = `model-key-${getId()}`;

    await test.step("Create model in schema page", async () => {
      await schemaPage.createModelFromSidebar(modelName, modelKey);
      await expect(schemaPage.textByExact(`#${modelKey}`)).toBeVisible();
    });

    await test.step("Open import schema modal", async () => {
      await schemaPage.importSchemaOuterButton.click();
      await expect(schemaPage.importSchemaDialog).toBeVisible();
    });

    await test.step("Upload schema file and import", async () => {
      const importModal = schemaPage.importSchemaDialog;
      await schemaPage
        .getByTestId(DATA_TEST_ID.FileSelectionStep__FileSelect)
        .setInputFiles(IMPORT_SCHEMA_TEMPLATE_PATH);
      await expect(schemaPage.getByTestId(DATA_TEST_ID.SchemaPreviewStep__Wrapper)).toBeVisible();

      await schemaPage.importSchemaModalImportButton.click();
      await expect(importModal).toBeHidden();
      await schemaPage.closeNotification();
    });

    await test.step("Verify imported field is visible", async () => {
      await expect(schemaPage.textByExact("#text-field-key")).toBeVisible();
    });
  });

  test("Model Import Schema skips unchecked field", async ({ schemaPage }) => {
    const modelName = `model-${getId()}`;
    const modelKey = `model-key-${getId()}`;

    await test.step("Create model in schema page", async () => {
      await schemaPage.createModelFromSidebar(modelName, modelKey);
      await expect(schemaPage.textByExact(`#${modelKey}`)).toBeVisible();
    });

    await test.step("Open import schema modal", async () => {
      await schemaPage.importSchemaOuterButton.click();
      await expect(schemaPage.importSchemaDialog).toBeVisible();
    });

    await test.step("Upload schema file", async () => {
      await schemaPage
        .getByTestId(DATA_TEST_ID.FileSelectionStep__FileSelect)
        .setInputFiles(IMPORT_SCHEMA_TEMPLATE_PATH);
      await expect(schemaPage.getByTestId(DATA_TEST_ID.SchemaPreviewStep__Wrapper)).toBeVisible();
    });

    await test.step("Uncheck a field", async () => {
      const fieldRow = schemaPage
        .getByTestId(DATA_TEST_ID.SchemaPreviewStep__PreviewFieldList)
        .locator(".ant-list-item")
        .filter({ hasText: "#text-field-key", hasNotText: "#text-field-key-multi" });
      await fieldRow.getByTestId(DATA_TEST_ID.SchemaPreviewStep__PreviewSkipCheckbox).click();
    });

    await test.step("Import and verify unchecked field is skipped", async () => {
      await schemaPage.importSchemaModalImportButton.click();
      await expect(schemaPage.importSchemaDialog).toBeHidden();
      await schemaPage.closeNotification();
      await expect(schemaPage.getByText("#url-field-key", { exact: true })).toBeVisible();
      await expect(schemaPage.getByText("#text-field-key", { exact: true })).toHaveCount(0);
    });
  });
});

test("Group CRUD has succeeded", { tag: TAG.SMOKE }, async ({ schemaPage, fieldEditorPage }) => {
  const groupName = "e2e group name";
  const groupKey = "e2e-group-key";
  const updateGroupName = "new e2e group name";
  const updateGroupKey = "new-e2e-group-key";

  await test.step("Create group", async () => {
    await schemaPage.createGroup(groupName, groupKey);
    await expect(fieldEditorPage.titleByText(groupName, true)).toBeVisible();
    await expect(schemaPage.textByExact(`#${groupKey}`)).toBeVisible();
  });

  await test.step("Update group", async () => {
    await schemaPage.updateGroup(updateGroupName, updateGroupKey);
    await expect(fieldEditorPage.titleByText(updateGroupName)).toBeVisible();
    await expect(schemaPage.textByExact(`#${updateGroupKey}`)).toBeVisible();
    await expect(schemaPage.menuItemByName(updateGroupName)).toBeVisible();
  });

  await test.step("Delete group", async () => {
    await schemaPage.deleteGroup();
    await expect(fieldEditorPage.titleByText(updateGroupName)).toBeHidden();
  });
});

test("Group creating from adding field has succeeded", async ({ schemaPage, fieldEditorPage }) => {
  await test.step("Create model and open group field dialog", async () => {
    await schemaPage.createModelFromSidebar();
    await expect(fieldEditorPage.fieldTypeListItem("Group")).toBeVisible();
    await fieldEditorPage.fieldTypeListItem("Group").click();
    await expect(schemaPage.addGroupButton).toBeVisible();
    await schemaPage.addGroupButton.click();
    await expect(schemaPage.newGroupDialog).toContainText("New Group");
    await expect(fieldEditorPage.okButton).toBeDisabled();
  });

  await test.step("Create new group from field dialog", async () => {
    await expect(schemaPage.groupNameInput).toBeVisible();
    await schemaPage.groupNameInput.click();
    await schemaPage.groupNameInput.fill("e2e group name");
    await schemaPage.groupKeyInput.click();
    await schemaPage.groupKeyInput.fill("e2e-group-key");
    await expect(fieldEditorPage.okButton).toBeEnabled();
    await fieldEditorPage.okButton.click();
    await schemaPage.closeNotification();
  });

  await test.step("Verify group created and field type restrictions applied", async () => {
    await expect(schemaPage.groupMenuItemSpan("e2e group name")).toBeVisible();
    await expect(schemaPage.groupNameByText("e2e group name#e2e-group-key")).toBeVisible();
    await expect(schemaPage.fieldsMetaDataText).toBeHidden();
    await expect(schemaPage.textByExact("Reference")).toBeHidden();
    await expect(schemaPage.textByExact("Group")).toBeHidden();
  });

  await test.step("Add text field to model", async () => {
    await expect(fieldEditorPage.fieldTypeListItem("Text")).toBeVisible();
    await fieldEditorPage.createField({ type: SchemaFieldType.Text, name: "text" });
  });

  await test.step("Verify group can be selected for group field in model", async () => {
    await expect(schemaPage.modelByText("e2e model name")).toBeVisible();
    await schemaPage.modelByText("e2e model name").click();
    await expect(schemaPage.lastTextByExact("Group")).toBeVisible();
    await schemaPage.lastTextByExact("Group").click();
    await expect(schemaPage.createGroupFieldButton).toBeVisible();
    await expect(schemaPage.groupSelectTrigger).toBeVisible();
    await schemaPage.groupSelectTrigger.click();
    await expect(schemaPage.groupNameByText("e2e group name #e2e-group-key")).toBeVisible();
    await expect(fieldEditorPage.cancelButton).toBeVisible();
    await fieldEditorPage.cancelButton.click();
  });
});

test("Group reordering has succeeded", async ({ schemaPage }) => {
  await test.step("Create two groups and verify initial order", async () => {
    await schemaPage.createGroup("group1", "group1");
    await schemaPage.createGroup("group2", "group2");
    await expect(schemaPage.groupMenuItems.nth(0)).toContainText("group1");
    await expect(schemaPage.groupMenuItems.nth(1)).toContainText("group2");
  });

  await test.step("Drag group2 above group1", async () => {
    await schemaPage.groupMenuItems.nth(1).dragTo(schemaPage.groupMenuItems.nth(0));
    await schemaPage.closeNotification();
    await expect(schemaPage.groupMenuItems.nth(0)).toContainText("group2");
    await expect(schemaPage.groupMenuItems.nth(1)).toContainText("group1");
  });

  await test.step("Create third group and verify it appears at the end", async () => {
    await schemaPage.createGroup("group3", "group3");
    await expect(schemaPage.groupMenuItems.nth(0)).toContainText("group2");
    await expect(schemaPage.groupMenuItems.nth(1)).toContainText("group1");
    await expect(schemaPage.groupMenuItems.nth(2)).toContainText("group3");
  });
});

test("Text field CRUD has succeeded", async ({ fieldEditorPage, schemaPage }) => {
  await test.step("Create model and add text field", async () => {
    await schemaPage.createModelFromSidebar();
    await fieldEditorPage.createField({ type: SchemaFieldType.Text, name: "text" });
  });

  await test.step("Update text field", async () => {
    await fieldEditorPage.ellipsisMenuButton.click();
    await fieldEditorPage.displayNameInput.fill("new text");
    await fieldEditorPage.settingsKeyInput.fill("new-text");
    await fieldEditorPage.okButton.click();
    await fieldEditorPage.closeNotification();
  });

  await test.step("Delete text field", async () => {
    await fieldEditorPage.deleteField();
    await expect(schemaPage.fieldText("new text", "new-text")).toBeHidden();
  });
});

test("Schema reordering has succeeded", async ({ schemaPage, fieldEditorPage }) => {
  await test.step("Create model and add two text fields", async () => {
    await schemaPage.createModelFromSidebar();
    await fieldEditorPage.createField({ type: SchemaFieldType.Text, name: "text1" });
    await fieldEditorPage.createField({ type: SchemaFieldType.Text, name: "text2" });
  });

  await test.step("Verify initial field order", async () => {
    await expect(schemaPage.draggableItems.nth(0)).toContainText("text1#text1");
    await expect(schemaPage.draggableItems.nth(1)).toContainText("text2#text2");
  });

  await test.step("Drag text2 above text1", async () => {
    await schemaPage.grabbableItems.nth(1).dragTo(schemaPage.draggableItems.nth(0));
    await schemaPage.closeNotification();
  });

  await test.step("Verify field order changed", async () => {
    await expect(schemaPage.draggableItems.nth(0)).toContainText("text2#text2");
    await expect(schemaPage.draggableItems.nth(1)).toContainText("text1#text1");
  });
});
