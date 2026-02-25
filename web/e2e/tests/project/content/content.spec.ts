import path from "path";
import { fileURLToPath } from "url";

import { SchemaFieldType } from "@reearth-cms/components/molecules/Schema/types";
import { expect, TAG, test } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";
import { t } from "@reearth-cms/e2e/support/i18n";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_IMPORT_CONTENT_JSON_PATH = path.resolve(
  __dirname,
  "../../../files/test-import-content.json",
);
const TEST_IMPORT_CONTENT_CSV_PATH = path.resolve(
  __dirname,
  "../../../files/test-import-content.csv",
);
const TEST_IMPORT_CONTENT_GEO_JSON_PATH = path.resolve(
  __dirname,
  "../../../files/test-import-content.geojson",
);

const textFieldName = "text";
const newTextValue = "new text";
const defaultTextValue = "default text";
const commentText = "comment";
const newCommentText = "new comment";
const importTextFieldKey = "text-field-key";
const importLocationName = "location";

let modelName: string;

test.beforeEach(async ({ projectPage }) => {
  modelName = `model-${getId()}`;
  await projectPage.goto("/");
  const projectName = getId();
  await projectPage.createProject(projectName);
  await projectPage.gotoProject(projectName);
  await projectPage.createModelFromOverview(modelName);
});

test.afterEach(async ({ projectPage }) => {
  await projectPage.deleteProject();
});

test(
  "Item CRUD and searching has succeeded",
  { tag: TAG.SMOKE },
  async ({ contentPage, fieldEditorPage, projectPage }) => {
    await test.step("Create text field and navigate to content", async () => {
      await fieldEditorPage.createField({ type: SchemaFieldType.Text, name: textFieldName });
      await projectPage.contentMenuItem.click();
    });

    await test.step("Create new item with text value", async () => {
      await contentPage.newItemButton.click();
      await contentPage.fieldInput(textFieldName).click();
      await contentPage.fieldInput(textFieldName).fill(textFieldName);
      await contentPage.saveButton.click();
      await contentPage.closeNotification();
      await contentPage.backButton.click();
      await expect(contentPage.cellByText(textFieldName, true)).toBeVisible();
    });

    await test.step("Search for non-existent item", async () => {
      await contentPage.searchInput.click();
      await contentPage.searchInput.fill("no field");
      await contentPage.searchButton.click();
      await expect(contentPage.cellByText(textFieldName, true)).toBeHidden();
    });

    await test.step("Clear search to show item again", async () => {
      await contentPage.searchInput.fill("");
      await contentPage.searchButton.click();
      await expect(contentPage.cellByText(textFieldName, true)).toBeVisible();
    });

    await test.step("Edit item with new text value", async () => {
      await contentPage.cellEditButton.click();
      await contentPage.fieldInput(textFieldName).click();
      await expect(contentPage.fieldInput(textFieldName)).toHaveValue(textFieldName);
      await contentPage.fieldInput(textFieldName).click();
      await contentPage.fieldInput(textFieldName).fill(newTextValue);
      await contentPage.saveButton.click();
      await contentPage.closeNotification();
      await contentPage.backButtonLabel.click();
      await expect(contentPage.cellByText(newTextValue)).toBeVisible();
    });

    await test.step("Delete item", async () => {
      await contentPage.selectAllCheckbox.check();
      await contentPage.deleteButton.click();
      await contentPage.closeNotification();
      await expect(contentPage.cellByText(newTextValue)).toBeHidden();
    });
  },
);

test(
  "Publishing and Unpublishing item from edit page has succeeded",
  { tag: TAG.SMOKE },
  async ({ contentPage, fieldEditorPage }) => {
    await test.step("Create text field and new item", async () => {
      await fieldEditorPage.createField({ type: SchemaFieldType.Text, name: textFieldName });
      await contentPage.contentTextFirst.click();
      await contentPage.newItemButton.click();
      await contentPage.fieldInput(textFieldName).click();
      await contentPage.fieldInput(textFieldName).fill(textFieldName);
      await contentPage.saveButton.click();
      await contentPage.closeNotification();
      await expect(contentPage.draftStatus).toBeVisible();
    });

    await test.step("Publish item from edit page", async () => {
      await contentPage.publishButton.click();
      await contentPage.closeNotification();
      await expect(contentPage.publishedStatus).toBeVisible();
    });

    await test.step("Verify published status persists", async () => {
      await contentPage.backButtonLabel.click();
      await expect(contentPage.publishedStatus).toBeVisible();
      await contentPage.cellEditButton.click();
      await expect(contentPage.publishedStatus).toBeVisible();
    });

    await test.step("Unpublish item from edit page", async () => {
      await contentPage.ellipsisMenuButton.click();
      await contentPage.unpublishButton.click();
      await contentPage.closeNotification();
      await expect(contentPage.draftStatus).toBeVisible();
    });

    await test.step("Verify draft status persists", async () => {
      await contentPage.backButtonLabel.click();
      await expect(contentPage.draftStatus).toBeVisible();
    });
  },
);

test("Publishing and Unpublishing item from table has succeeded", async ({
  contentPage,
  fieldEditorPage,
}) => {
  await test.step("Create text field and new item", async () => {
    await fieldEditorPage.createField({ type: SchemaFieldType.Text, name: textFieldName });
    await contentPage.contentTextFirst.click();
    await contentPage.newItemButton.click();
    await contentPage.fieldInput(textFieldName).click();
    await contentPage.fieldInput(textFieldName).fill(textFieldName);
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
    await expect(contentPage.draftStatus).toBeVisible();
  });

  await test.step("Navigate to table and verify draft status", async () => {
    await contentPage.backButtonLabel.click();
    await expect(contentPage.draftStatus).toBeVisible();
  });

  await test.step("Publish item from table", async () => {
    await contentPage.selectAllCheckbox.check();
    await contentPage.publishFromTableButton.click();
    await contentPage.yesButton.click();
    await contentPage.closeNotification();
    await expect(contentPage.publishedStatus).toBeVisible();
  });

  await test.step("Unpublish item from table", async () => {
    await contentPage.unpublishButton.click();
    await contentPage.closeNotification();
    await expect(contentPage.draftStatus).toBeVisible();
  });

  await test.step("Verify draft status in edit page", async () => {
    await contentPage.cellEditButton.click();
    await expect(contentPage.draftStatus).toBeVisible();
  });
});

test("Showing item title has succeeded", async ({ contentPage, fieldEditorPage, schemaPage }) => {
  await test.step("Create text field and new item", async () => {
    await fieldEditorPage.createField({ type: SchemaFieldType.Text, name: textFieldName });
    await contentPage.contentText.click();
    await contentPage.newItemButton.click();
    await expect(contentPage.titleByText(modelName, true)).toBeVisible();
    await contentPage.fieldInput(textFieldName).click();
    await contentPage.fieldInput(textFieldName).fill(textFieldName);
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
    const itemId = contentPage.getCurrentItemId();
    await expect(contentPage.titleByText(`${modelName} / ${itemId}`, true)).toBeVisible();
  });

  await test.step("Configure field to use as title with default value", async () => {
    await schemaPage.schemaText.click();
    await fieldEditorPage.ellipsisMenuButton.click();
    await fieldEditorPage.useAsTitleCheckbox.check();
    await fieldEditorPage.defaultValueTab.click();
    await fieldEditorPage.setDefaultValueInput.click();
    await fieldEditorPage.defaultValueTextInput.fill(defaultTextValue);
    await fieldEditorPage.okButton.click();
    await contentPage.closeNotification();
  });

  await test.step("Verify title shows field value", async () => {
    await contentPage.contentText.click();
    await contentPage.cellEditButton.click();
    await expect(contentPage.titleByText(`${modelName} / text`, true)).toBeVisible();
    await contentPage.backButtonLabel.click();
  });

  await test.step("Verify title shows default value for new item", async () => {
    await contentPage.newItemButton.click();
    await expect(contentPage.titleByText(modelName, true)).toBeVisible();
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
    await expect(contentPage.titleByText(`${modelName} / default text`, true)).toBeVisible();
  });
});

test(
  "Comment CRUD on Content page has succeeded",
  { tag: TAG.SMOKE },
  async ({ contentPage, fieldEditorPage }) => {
    await test.step("Create text field and new item", async () => {
      await fieldEditorPage.createField({ type: SchemaFieldType.Text, name: textFieldName });
      await contentPage.contentText.click();
      await contentPage.newItemButton.click();
      await contentPage.fieldInput(textFieldName).click();
      await contentPage.fieldInput(textFieldName).fill(textFieldName);
      await contentPage.saveButton.click();
      await contentPage.closeNotification();
      await contentPage.backButtonLabel.click();
    });

    await test.step("Open comments panel", async () => {
      await contentPage.commentsCountButton("0").click();
    });

    await test.step("Create comment", async () => {
      await contentPage.createComment(commentText);
    });

    await test.step("Update comment", async () => {
      await contentPage.updateComment(commentText, newCommentText);
    });

    await test.step("Delete comment", async () => {
      await contentPage.deleteComment();
    });
  },
);

test("Comment CRUD on edit page has succeeded", async ({ contentPage, fieldEditorPage }) => {
  await test.step("Create text field and new item", async () => {
    await fieldEditorPage.createField({ type: SchemaFieldType.Text, name: textFieldName });
    await contentPage.contentText.click();
    await contentPage.newItemButton.click();
    await contentPage.fieldInput(textFieldName).click();
    await contentPage.fieldInput(textFieldName).fill(textFieldName);
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
  });

  await test.step("Open comments panel", async () => {
    await contentPage.commentButton.click();
  });

  await test.step("Create comment", async () => {
    await contentPage.createComment(commentText);
  });

  await test.step("Update comment", async () => {
    await contentPage.updateComment(commentText, newCommentText);
  });

  await test.step("Delete comment", async () => {
    await contentPage.deleteComment();
  });
});

test.describe("Import content", () => {
  [
    { path: TEST_IMPORT_CONTENT_JSON_PATH, type: "JSON" },
    { path: TEST_IMPORT_CONTENT_CSV_PATH, type: "CSV" },
  ].forEach(({ path, type }) => {
    test(
      `Pass Case: Import content with matching schema succeeds with ${type}`,
      { tag: TAG.SMOKE },
      async ({ contentPage, fieldEditorPage, projectPage }) => {
        await test.step("Create text field matching template schema", async () => {
          await fieldEditorPage.createField({ type: SchemaFieldType.Text, name: importTextFieldKey });
          await projectPage.contentMenuItem.click();
        });

        await test.step("Open import modal and upload JSON file", async () => {
          await contentPage.openImportContentModal();
          await contentPage.uploadImportFile(path);
        });

        await test.step("Verify import job is created and modal closes", async () => {
          await expect(contentPage.importContentModal).toBeHidden();
          await contentPage.tableReloadIcon.click();
          await expect(contentPage.cellByText("text111")).toBeVisible();
        });
      },
    );
  });

  test(
    "Pass Case: Import content with matching schema succeeds with GeoJSON",
    { tag: TAG.SMOKE },
    async ({ contentPage, fieldEditorPage, projectPage }) => {
      await test.step("Create geometry object field matching template schema", async () => {
        await fieldEditorPage.createField({
          type: SchemaFieldType.GeometryObject,
          name: importLocationName,
          supportedTypes: ["POINT"],
        });

        await fieldEditorPage.createField({ type: SchemaFieldType.Text, name: "title" });

        await projectPage.contentMenuItem.click();
      });

      await test.step("Open import modal and upload GeoJSON file", async () => {
        await contentPage.openImportContentModal();
        await contentPage.uploadImportFile(TEST_IMPORT_CONTENT_GEO_JSON_PATH);
      });

      await test.step("Verify import job is created and modal closes", async () => {
        await expect(contentPage.importContentModal).toBeHidden();
        await expect(contentPage.tableReloadIcon).toBeVisible();
        await contentPage.tableReloadIcon.click();
        await expect(contentPage.tableContentFieldPopoverIcon).toBeVisible();
        await contentPage.tableContentFieldPopoverIcon.click();
        await expect(contentPage.tableContentFieldPopoverContent).toBeVisible();
        await expect(contentPage.tableContentFieldPopoverContent).toHaveText(
          '{"coordinates":[25.105497,121.597366],"type":"Point"}',
        );
      });
    },
  );

  [
    { path: TEST_IMPORT_CONTENT_JSON_PATH, type: "JSON" },
    { path: TEST_IMPORT_CONTENT_CSV_PATH, type: "CSV" },
  ].forEach(({ path, type }) => {
    test(`Fail Case: Import content with ${type} file shows schema mismatch warning`, async ({
      contentPage,
      fieldEditorPage,
      projectPage,
    }) => {
      await test.step("Create text field with different key than template", async () => {
        await fieldEditorPage.createField({
          type: SchemaFieldType.Text,
          name: importTextFieldKey,
          key: importTextFieldKey,
          required: true,
        });

        await fieldEditorPage.createField({
          type: SchemaFieldType.Number,
          name: "number-field-key",
          key: "number-field-key",
          required: true,
        });

        await projectPage.contentMenuItem.click();
      });

      await test.step("Open import modal and upload JSON file", async () => {
        await contentPage.openImportContentModal();
        await contentPage.uploadImportFile(path);
      });

      await test.step("Verify schema mismatch warning is displayed", async () => {
        await expect(contentPage.importContentErrorWrapper).toBeVisible();
        await expect(contentPage.importContentErrorTitle).toContainText(
          t("Some fields don't match the schema"),
        );
        await expect(contentPage.importContentGoBackButton).toBeVisible();
      });
    });
  });

  test("Fail Case: Import content with GeoJSON file shows schema mismatch warning", async ({
    contentPage,
    fieldEditorPage,
    projectPage,
  }) => {
    await test.step("Create text field with different key than template", async () => {
      await fieldEditorPage.createField({
        type: SchemaFieldType.Text,
        name: "title-1",
        key: "title-1",
        required: true,
      });

      await fieldEditorPage.createField({
        type: SchemaFieldType.GeometryObject,
        name: importLocationName,
        supportedTypes: ["POINT"],
      });

      await projectPage.contentMenuItem.click();
    });

    await test.step("Open import modal and upload GeoJSON file", async () => {
      await contentPage.openImportContentModal();
      await contentPage.uploadImportFile(TEST_IMPORT_CONTENT_GEO_JSON_PATH);
    });

    await test.step("Verify schema mismatch warning is displayed", async () => {
      await expect(contentPage.importContentErrorWrapper).toBeVisible();
      await expect(contentPage.importContentErrorTitle).toContainText(
        t("Some fields don't match the schema"),
      );
    });
  });

  test("Fail Case: Import content shows no matching fields error when schema completely mismatches", async ({
    contentPage,
    fieldEditorPage,
    projectPage,
  }) => {
    await test.step("Create field with unique key not in any template", async () => {
      await fieldEditorPage.createField({
        type: SchemaFieldType.Text,
        name: "text-field-key-1",
        key: "text-field-key-1",
        required: true,
      });

      await fieldEditorPage.createField({
        type: SchemaFieldType.Number,
        name: "number-field-key-1",
        key: "number-field-key-1",
        required: true,
      });

      await projectPage.contentMenuItem.click();
    });

    await test.step("Open import modal and upload JSON file", async () => {
      await contentPage.openImportContentModal();
      await contentPage.uploadImportFile(TEST_IMPORT_CONTENT_JSON_PATH);
    });

    await test.step("Verify error is displayed for no matching fields", async () => {
      await expect(contentPage.importContentErrorWrapper).toBeVisible();

      await expect(contentPage.importContentErrorTitle).toBeVisible();
      await expect(contentPage.importContentErrorTitle).toContainText(
        t("No matching fields found"),
      );
    });
  });
});
