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

test("One-way reference field creating and updating has succeeded", async ({
  fieldEditorPage,
  contentPage,
  schemaPage,
}) => {
  await schemaPage.firstPlusAddButton.click();
  await schemaPage.modelNameInput.fill("ref model");
  await schemaPage.modelKeyInput.fill("ref-model");
  await schemaPage.okButton.click();
  await contentPage.closeNotification();
  await fieldEditorPage.fieldTypeButton("Text").click();
  await fieldEditorPage.displayNameInput.click();
  await fieldEditorPage.displayNameInput.fill("text");
  await fieldEditorPage.useAsTitleCheckbox.check();
  await fieldEditorPage.okButton.click();
  await contentPage.closeNotification();
  await schemaPage.metaDataTab.click();
  await schemaPage.fieldTypeButton("Boolean").click();
  await fieldEditorPage.displayNameInput.click();
  await fieldEditorPage.displayNameInput.fill("boolean");
  await fieldEditorPage.okButton.click();
  await contentPage.closeNotification();
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
  await schemaPage.schemaText.click();
  await schemaPage.modelByText("e2e model name").click();
  await schemaPage.fieldTypeButton("Reference").click();
  await fieldEditorPage.selectModelToReferenceLabel.click();
  await expect(fieldEditorPage.modelOption("e2e model name #e2e-model-name")).toBeVisible();
  await expect(fieldEditorPage.modelOption("ref model #ref-model")).toBeVisible();

  await fieldEditorPage.modelOption("ref model #ref-model").click();
  await expect(
    fieldEditorPage.createReferenceFieldLabel.getByText("ref model #ref-model"),
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
  await schemaPage.fieldEditButton.click();
  await expect(fieldEditorPage.modelOption("ref model #ref-model")).toBeVisible();
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

test("Two-way reference field editing has succeeded", async ({
  fieldEditorPage,
  contentPage,
  schemaPage,
}) => {
  await schemaPage.plusAddButton.first().click();
  await schemaPage.modelNameLabel.click();
  await schemaPage.modelNameLabel.fill("ref model");
  await schemaPage.modelKeyLabel.click();
  await schemaPage.modelKeyLabel.fill("ref-model");
  await schemaPage.okButton.click();
  await contentPage.closeNotification();
  await schemaPage.fieldTypeButton("Text").click();
  await fieldEditorPage.displayNameInput.click();
  await fieldEditorPage.displayNameInput.fill("text");
  await fieldEditorPage.useAsTitleCheckbox.check();
  await fieldEditorPage.okButton.click();
  await contentPage.closeNotification();
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

  await schemaPage.schemaText.click();
  await schemaPage.modelByText("e2e model name").click();
  await schemaPage.fieldTypeButton("Text").click();
  await fieldEditorPage.displayNameInput.click();
  await fieldEditorPage.displayNameInput.fill("text");
  await fieldEditorPage.useAsTitleCheckbox.check();
  await fieldEditorPage.okButton.click();
  await contentPage.closeNotification();
  await schemaPage.fieldTypeButton("Reference").click();
  await fieldEditorPage.selectModelToReferenceLabel.click();
  await fieldEditorPage.modelOption("ref model #ref-model").click();
  await fieldEditorPage.twoWayReferenceCheckbox.check();
  await fieldEditorPage.nextButton.click();
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

  await expect(fieldEditorPage.confirmButton).toBeDisabled();
  await fieldEditorPage.displayNameInput.click();
  await fieldEditorPage.displayNameInput.fill("ref2");
  await expect(fieldEditorPage.confirmButton).toBeEnabled();
  await fieldEditorPage.descriptionInput.click();
  await fieldEditorPage.descriptionInput.fill("ref2 description");
  await fieldEditorPage.validationTab.click();
  await fieldEditorPage.makeFieldRequiredCheckbox.check();
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

  await expect(schemaPage.fieldsContainer).toContainText("ref1 *#ref1");
  await schemaPage.fieldEllipsisIcon("ref1 *#ref1").click();
  await expect(fieldEditorPage.modelOption("ref model #ref-model")).toBeVisible();
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

  await expect(contentPage.cellSpanByText("reference text1")).toBeVisible();
  await expect(contentPage.cellSpanByText("reference text2")).toBeVisible();
  await contentPage.modelLinkByText("ref model").click();
  await expect(contentPage.tableHead).toContainText("ref2");
  await expect(contentPage.cellByTextExact("text1").locator("span").first()).toBeVisible();
  await expect(contentPage.cellByTextExact("text2").locator("span").first()).toBeVisible();
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

  await contentPage.modelLinkByText("e2e model name").click();
  await expect(contentPage.cellByTextExact("reference text1").locator("span").first()).toBeHidden();
  await expect(
    contentPage.cellByTextExact("reference text2").locator("span").first(),
  ).toBeVisible();
});
