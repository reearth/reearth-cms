import { SchemaFieldType } from "@reearth-cms/components/molecules/Schema/types";
import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";

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

test("One-way reference field creating and updating has succeeded", async ({
  fieldEditorPage,
  contentPage,
  schemaPage,
}) => {
  const refModelName = `ref-model-${getId()}`;
  const refModelKey = `ref-key-${getId()}`;

  await test.step("Create reference model with text field and boolean metadata", async () => {
    await schemaPage.plusAddButton.click();
    await schemaPage.modelNameInput.fill(refModelName);
    await schemaPage.modelKeyInput.fill(refModelKey);
    await schemaPage.okButton.click();
    await contentPage.closeNotification();
    await fieldEditorPage.createField({ type: SchemaFieldType.Text, name: "text", isTitle: true });
    await schemaPage.metaDataTab.click();
    await fieldEditorPage.createField({ type: SchemaFieldType.Bool, name: "boolean" });
  });

  await test.step("Create two reference items with text values", async () => {
    await contentPage.contentText.click();
    await contentPage.newItemButton.click();
    await contentPage.fieldInput("text").click();
    await contentPage.fieldInput("text").fill("text1");
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
    await contentPage.backButton.click();
    await contentPage.newItemButton.click();
    await contentPage.fieldInput("text").click();
    await contentPage.fieldInput("text").fill("text2");
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
  });

  await test.step("Create one-way reference field with validations", async () => {
    await schemaPage.schemaText.click();
    await schemaPage.modelByText(modelName).click();
    await schemaPage.fieldTypeButton("Reference").click();
    await fieldEditorPage.selectModelToReferenceLabel.click();
    await expect(fieldEditorPage.modelOption(`${modelName} #${modelName}`)).toBeVisible();
    await expect(fieldEditorPage.modelOption(`${refModelName} #${refModelKey}`)).toBeVisible();

    await fieldEditorPage.modelOption(`${refModelName} #${refModelKey}`).click();
    await expect(
      fieldEditorPage.createReferenceFieldLabel.getByText(`${refModelName} #${refModelKey}`),
    ).toBeVisible();

    await expect(fieldEditorPage.oneWayReferenceCheckbox).toBeChecked();
    await fieldEditorPage.nextButton.click();
    await expect(fieldEditorPage.confirmButton).toBeDisabled();
    await fieldEditorPage.displayNameInput.click();
    await fieldEditorPage.displayNameInput.fill("ref");
    await expect(fieldEditorPage.confirmButton).toBeEnabled();
    await fieldEditorPage.descriptionInput.click();
    await fieldEditorPage.descriptionInput.fill("ref description");
    await expect(fieldEditorPage.supportMultipleValuesCheckbox).toBeDisabled();
    await expect(fieldEditorPage.useAsTitleCheckbox).toBeHidden();
    await fieldEditorPage.validationTab.click();
    await fieldEditorPage.makeFieldRequiredCheckbox.check();
    await fieldEditorPage.setFieldAsUniqueCheckbox.check();
    await fieldEditorPage.confirmButton.click();
    await contentPage.closeNotification();
    await expect(schemaPage.fieldsContainer.getByRole("paragraph")).toContainText(
      "ref *#ref(unique)",
    );
  });

  await test.step("Verify reference field settings are locked after creation", async () => {
    await schemaPage.fieldEditButton.click();
    await expect(fieldEditorPage.modelOption(`${refModelName} #${refModelKey}`)).toBeVisible();
    await expect(fieldEditorPage.selectModelToReferenceLabel).toBeDisabled();
    await expect(fieldEditorPage.oneWayReferenceCheckbox).toBeDisabled();
    await expect(fieldEditorPage.twoWayReferenceCheckbox).toBeDisabled();
    await expect(fieldEditorPage.nextButton).toBeEnabled();
    await fieldEditorPage.nextButton.click();
    await expect(fieldEditorPage.confirmButton).toBeDisabled();
    await fieldEditorPage.displayNameInput.click();
    await fieldEditorPage.displayNameInput.fill("reff");
    await expect(fieldEditorPage.confirmButton).toBeEnabled();
    await fieldEditorPage.displayNameInput.click();
    await fieldEditorPage.displayNameInput.fill("ref");
    await expect(fieldEditorPage.confirmButton).toBeDisabled();
    await fieldEditorPage.closeButton.first().click();
  });

  await test.step("Create new item and test reference field with search", async () => {
    await contentPage.contentText.click();
    await expect(contentPage.tableHead).toContainText("ref");
    await contentPage.newItemButton.click();
    await expect(fieldEditorPage.fieldParagraph("ref(unique)")).toBeVisible();
    await expect(fieldEditorPage.referToItemButton).toBeVisible();
    await expect(fieldEditorPage.modelOption("ref description")).toBeVisible();

    await fieldEditorPage.referToItemButton.click();
    await expect(fieldEditorPage.tableRows()).toHaveCount(2);

    await expect(fieldEditorPage.modelOption("text1")).toBeVisible();
    await expect(fieldEditorPage.modelOption("text2")).toBeVisible();
    await fieldEditorPage.searchInput.click();
    await fieldEditorPage.searchInput.fill("1");
    await fieldEditorPage.searchButton.click();
    await expect(fieldEditorPage.modelOption("text1")).toBeVisible();
    await expect(fieldEditorPage.modelOption("text2")).toBeHidden();
    await fieldEditorPage.rowButton(0).hover();
    await fieldEditorPage.rowButton(0).click();
    await expect(fieldEditorPage.referenceText("text1")).toBeVisible();
  });

  await test.step("Clear reference and select again", async () => {
    await fieldEditorPage.clearReferenceButton().click();
    await expect(fieldEditorPage.referenceText("text1")).toBeHidden();
    await fieldEditorPage.referToItemButton.click();
    await expect(fieldEditorPage.modelOption("text1")).toBeVisible();
    await expect(fieldEditorPage.modelOption("text2")).toBeVisible();
    await fieldEditorPage.rowButton(0).hover();
    await fieldEditorPage.rowButton(0).click();
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
    await contentPage.backButton.click();
    await expect(contentPage.cellSpanByText("text1")).toBeVisible();
  });

  await test.step("Edit item and replace reference value", async () => {
    await contentPage.editButton.click();
    await expect(fieldEditorPage.referenceText("text1")).toBeVisible();
    await fieldEditorPage.replaceItemButton.click();
    await fieldEditorPage.rowButton(1).hover();
    await fieldEditorPage.rowButton(1).click();
    await expect(fieldEditorPage.referenceText("text2")).toBeVisible();
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
    await contentPage.backButton.click();
    await expect(contentPage.cellSpanByText("text2")).toBeVisible();
  });
});

test("Two-way reference field editing has succeeded", async ({
  fieldEditorPage,
  contentPage,
  schemaPage,
}) => {
  const refModelName = `ref-model-${getId()}`;
  const refModelKey = `ref-key-${getId()}`;

  await test.step("Create reference model with text field and two items", async () => {
    await schemaPage.plusAddButton.first().click();
    await schemaPage.modelNameLabel.click();
    await schemaPage.modelNameLabel.fill(refModelName);
    await schemaPage.modelKeyLabel.click();
    await schemaPage.modelKeyLabel.fill(refModelKey);
    await schemaPage.okButton.click();
    await contentPage.closeNotification();
    await fieldEditorPage.createField({ type: SchemaFieldType.Text, name: "text", isTitle: true });
    await contentPage.contentText.click();
    await contentPage.newItemButton.click();
    await contentPage.fieldInput("text").click();
    await contentPage.fieldInput("text").fill("reference text1");
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
    await contentPage.backButton.click();
    await contentPage.newItemButton.click();
    await contentPage.fieldInput("text").click();
    await contentPage.fieldInput("text").fill("reference text2");
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
  });

  await test.step("Add text field to main model and create two-way reference", async () => {
    await schemaPage.schemaText.click();
    await schemaPage.modelByText(modelName).click();
    await fieldEditorPage.createField({ type: SchemaFieldType.Text, name: "text", isTitle: true });
    await schemaPage.fieldTypeButton("Reference").click();
    await fieldEditorPage.selectModelToReferenceLabel.click();
    await fieldEditorPage.modelOption(`${refModelName} #${refModelKey}`).click();
    await fieldEditorPage.twoWayReferenceCheckbox.check();
    await fieldEditorPage.nextButton.click();
  });

  await test.step("Configure first reference field (ref1) with validation", async () => {
    await expect(fieldEditorPage.nextButton).toBeDisabled();
    await fieldEditorPage.displayNameInput.click();
    await fieldEditorPage.displayNameInput.fill("ref1");
    await expect(fieldEditorPage.nextButton).toBeEnabled();
    await fieldEditorPage.descriptionInput.click();
    await fieldEditorPage.descriptionInput.fill("ref1 description");
    await expect(fieldEditorPage.supportMultipleValuesCheckbox).toBeDisabled();
    await expect(fieldEditorPage.useAsTitleCheckbox).toBeHidden();
    await fieldEditorPage.validationTab.click();
    await fieldEditorPage.makeFieldRequiredCheckbox.check();
    await expect(fieldEditorPage.setFieldAsUniqueCheckbox).toBeDisabled();
    await fieldEditorPage.nextButton.click();
  });

  await test.step("Configure second reference field (ref2) with validation", async () => {
    await expect(fieldEditorPage.confirmButton).toBeDisabled();
    await fieldEditorPage.displayNameInput.click();
    await fieldEditorPage.displayNameInput.fill("ref2");
    await expect(fieldEditorPage.confirmButton).toBeEnabled();
    await fieldEditorPage.descriptionInput.click();
    await fieldEditorPage.descriptionInput.fill("ref2 description");
    await fieldEditorPage.validationTab.click();
    await fieldEditorPage.makeFieldRequiredCheckbox.check();
  });

  await test.step("Navigate between ref1 and ref2 to verify settings persist", async () => {
    await fieldEditorPage.previousButton.click();
    await expect(fieldEditorPage.displayNameInput).toHaveValue("ref1");
    await expect(fieldEditorPage.fieldKeyInput).toHaveValue("ref1");
    await expect(fieldEditorPage.descriptionInput).toHaveValue("ref1 description");
    await fieldEditorPage.validationTab.click();
    await expect(fieldEditorPage.makeFieldRequiredCheckbox).toBeChecked();
    await fieldEditorPage.nextButton.click();
    await expect(fieldEditorPage.displayNameInput).toHaveValue("ref2");
    await expect(fieldEditorPage.fieldKeyInput).toHaveValue("ref2");
    await expect(fieldEditorPage.descriptionInput).toHaveValue("ref2 description");
    await fieldEditorPage.validationTab.click();
    await expect(fieldEditorPage.makeFieldRequiredCheckbox).toBeChecked();
    await fieldEditorPage.confirmButton.click();
    await contentPage.closeNotification();
  });

  await test.step("Verify two-way reference fields created and test editing restrictions", async () => {
    await expect(schemaPage.fieldsContainer).toContainText("ref1 *#ref1");
    await schemaPage.fieldEllipsisIcon("ref1 *#ref1").click();
    await expect(fieldEditorPage.modelOption(`${refModelName} #${refModelKey}`)).toBeVisible();
    await expect(fieldEditorPage.selectModelToReferenceLabel).toBeDisabled();
    await expect(fieldEditorPage.oneWayReferenceCheckbox).toBeDisabled();
    await expect(fieldEditorPage.twoWayReferenceCheckbox).toBeDisabled();
    await expect(fieldEditorPage.nextButton).toBeEnabled();
    await fieldEditorPage.nextButton.click();
    await expect(fieldEditorPage.nextButton).toBeEnabled();
    await fieldEditorPage.nextButton.click();
    await expect(fieldEditorPage.confirmButton).toBeDisabled();
    await fieldEditorPage.displayNameInput.click();
    await fieldEditorPage.displayNameInput.fill("reff");
    await expect(fieldEditorPage.confirmButton).toBeEnabled();
    await fieldEditorPage.displayNameInput.click();
    await fieldEditorPage.displayNameInput.fill("ref2");
    await expect(fieldEditorPage.confirmButton).toBeDisabled();
    await fieldEditorPage.previousButton.click();
    await fieldEditorPage.displayNameInput.click();
    await fieldEditorPage.displayNameInput.fill("reff");
    await fieldEditorPage.nextButton.click();
    await expect(fieldEditorPage.confirmButton).toBeEnabled();
    await fieldEditorPage.previousButton.click();
    await fieldEditorPage.displayNameInput.click();
    await fieldEditorPage.displayNameInput.fill("ref1");
    await fieldEditorPage.nextButton.click();
    await expect(fieldEditorPage.confirmButton).toBeDisabled();
    await fieldEditorPage.closeButton.first().click();
  });

  await test.step("Create two items in main model with references", async () => {
    await contentPage.contentText.click();
    await expect(contentPage.tableHead).toContainText("ref1");
    await contentPage.newItemButton.click();
    await expect(fieldEditorPage.fieldParagraph("ref1")).toBeVisible();
    await expect(fieldEditorPage.referToItemButton).toBeVisible();
    await expect(fieldEditorPage.modelOption("ref1 description")).toBeVisible();
    await contentPage.fieldInput("text").click();
    await contentPage.fieldInput("text").fill("text1");
    await fieldEditorPage.referToItemButton.click();
    await expect(fieldEditorPage.modelOption("reference text1")).toBeVisible();
    await expect(fieldEditorPage.modelOption("reference text2")).toBeVisible();
    await fieldEditorPage.rowButton(0).hover();
    await fieldEditorPage.rowButton(0).click();
    await expect(fieldEditorPage.referenceText("reference text1")).toBeVisible();
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
    await contentPage.backButton.click();

    await contentPage.newItemButton.click();
    await contentPage.fieldInput("text").click();
    await contentPage.fieldInput("text").fill("text2");
    await fieldEditorPage.referToItemButton.click();
    await fieldEditorPage.rowButton(1).hover();
    await fieldEditorPage.rowButton(1).click();
    await expect(fieldEditorPage.referenceText("reference text2")).toBeVisible();
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
    await contentPage.backButton.click();
  });

  await test.step("Verify two-way reference appears in ref model", async () => {
    await expect(contentPage.cellSpanByText("reference text1")).toBeVisible();
    await expect(contentPage.cellSpanByText("reference text2")).toBeVisible();
    await contentPage.modelLinkByText(refModelName).click();
    await expect(contentPage.tableHead).toContainText("ref2");
    await expect(contentPage.cellByTextExact("text1").locator("span").first()).toBeVisible();
    await expect(contentPage.cellByTextExact("text2").locator("span").first()).toBeVisible();
  });

  await test.step("Edit ref model item and verify two-way sync", async () => {
    await contentPage.editButton.first().click();
    await fieldEditorPage.referToItemButton.click();
    await fieldEditorPage.rowButton(0).hover();
    await fieldEditorPage.rowButton(0).click();
    await fieldEditorPage.okButton.click();
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
    await contentPage.backButton.click();
    await expect(contentPage.cellByTextExact("text1").locator("span").first()).toBeVisible();
    await expect(contentPage.cellByTextExact("text2").locator("span").first()).toBeHidden();

    await contentPage.modelLinkByText(modelName).click();
    await expect(
      contentPage.cellByTextExact("reference text1").locator("span").first(),
    ).toBeHidden();
    await expect(
      contentPage.cellByTextExact("reference text2").locator("span").first(),
    ).toBeVisible();
  });
});
