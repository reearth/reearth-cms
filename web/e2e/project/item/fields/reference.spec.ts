import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { createModelFromOverview } from "@reearth-cms/e2e/project/utils/model";
import { createProject, deleteProject } from "@reearth-cms/e2e/project/utils/project";

test.beforeEach(async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
  await createModelFromOverview(page);
});

test.afterEach(async ({ page }) => {
  await deleteProject(page);
});

test("One-way reference field creating and updating has succeeded", async ({
  page,
  fieldEditorPage,
  contentPage,
  schemaPage,
  metadataEditorPage,
}) => {
  test.slow();
  await schemaPage.plusAddButton.first().click();
  await schemaPage.modelNameInput.fill("ref model");
  await schemaPage.modelKeyInput.fill("ref-model");
  await schemaPage.okButton.click();
  await closeNotification(page);
  await fieldEditorPage.fieldTypeButton("Text").click();
  await fieldEditorPage.displayNameInput.click();
  await fieldEditorPage.displayNameInput.fill("text");
  await fieldEditorPage.useAsTitleCheckbox.check();
  await fieldEditorPage.okButton.click();
  await closeNotification(page);
  await schemaPage.metaDataTab.click();
  await schemaPage.fieldTypeButton("Boolean").click();
  await fieldEditorPage.displayNameInput.click();
  await fieldEditorPage.displayNameInput.fill("boolean");
  await fieldEditorPage.okButton.click();
  await closeNotification(page);
  await contentPage.contentText.click();
  await contentPage.newItemButton.click();
  await contentPage.fieldInput("text").click();
  await contentPage.fieldInput("text").fill("text1");
  await contentPage.saveButton.click();
  await closeNotification(page);
  await contentPage.backButton.click();
  await contentPage.newItemButton.click();
  await contentPage.fieldInput("text").click();
  await contentPage.fieldInput("text").fill("text2");
  await contentPage.saveButton.click();
  await closeNotification(page);
  await schemaPage.schemaText.click();
  await schemaPage.modelByText("e2e model name").click();
  await schemaPage.fieldTypeButton("Reference").click();
  await metadataEditorPage.selectModelToReferenceLabel.click();
  await expect(metadataEditorPage.modelOption("e2e model name #e2e-model-name")).toBeVisible();
  await expect(metadataEditorPage.modelOption("ref model #ref-model")).toBeVisible();

  await metadataEditorPage.modelOption("ref model #ref-model").click();
  await expect(
    metadataEditorPage.createReferenceFieldLabel.getByText("ref model #ref-model"),
  ).toBeVisible();

  await expect(metadataEditorPage.oneWayReferenceCheckbox).toBeChecked();
  await metadataEditorPage.nextButton.click();
  await expect(metadataEditorPage.confirmButton).toBeDisabled();
  await metadataEditorPage.displayNameInput.click();
  await metadataEditorPage.displayNameInput.fill("ref");
  await expect(metadataEditorPage.confirmButton).toBeEnabled();
  await metadataEditorPage.descriptionInput.click();
  await metadataEditorPage.descriptionInput.fill("ref description");
  await expect(metadataEditorPage.supportMultipleValuesCheckbox).toBeDisabled();
  await expect(metadataEditorPage.useAsTitleCheckbox).toBeHidden();
  await metadataEditorPage.validationTab.click();
  await metadataEditorPage.makeFieldRequiredCheckbox.check();
  await metadataEditorPage.setFieldAsUniqueCheckbox.check();
  await metadataEditorPage.confirmButton.click();
  await closeNotification(page);
  await expect(schemaPage.fieldsContainer.getByRole("paragraph")).toContainText(
    "ref *#ref(unique)",
  );
  await schemaPage.fieldEditButton.click();
  await expect(metadataEditorPage.modelOption("ref model #ref-model")).toBeVisible();
  await expect(metadataEditorPage.selectModelToReferenceLabel).toBeDisabled();
  await expect(metadataEditorPage.oneWayReferenceCheckbox.locator("span").first()).toBeDisabled();
  await expect(metadataEditorPage.twoWayReferenceCheckbox.locator("span").first()).toBeDisabled();
  await expect(metadataEditorPage.nextButton).toBeEnabled();
  await metadataEditorPage.nextButton.click();
  await expect(metadataEditorPage.confirmButton).toBeDisabled();
  await metadataEditorPage.displayNameInput.click();
  await metadataEditorPage.displayNameInput.fill("reff");
  await expect(metadataEditorPage.confirmButton).toBeEnabled();
  await metadataEditorPage.displayNameInput.click();
  await metadataEditorPage.displayNameInput.fill("ref");
  await expect(metadataEditorPage.confirmButton).toBeDisabled();
  await metadataEditorPage.closeButton.first().click();
  await contentPage.contentText.click();
  await expect(contentPage.tableHead).toContainText("ref");
  await contentPage.newItemButton.click();
  await expect(metadataEditorPage.fieldParagraph("ref(unique)")).toBeVisible();
  await expect(metadataEditorPage.referToItemButton).toBeVisible();
  await expect(metadataEditorPage.modelOption("ref description")).toBeVisible();

  await metadataEditorPage.referToItemButton.click();
  await expect(metadataEditorPage.tableRows()).toHaveCount(2);

  await expect(metadataEditorPage.modelOption("text1")).toBeVisible();
  await expect(metadataEditorPage.modelOption("text2")).toBeVisible();
  await metadataEditorPage.searchInput.click();
  await metadataEditorPage.searchInput.fill("1");
  await metadataEditorPage.searchButton.click();
  await expect(metadataEditorPage.modelOption("text1")).toBeVisible();
  await expect(metadataEditorPage.modelOption("text2")).toBeHidden();
  await metadataEditorPage.rowButton(0).hover();
  await metadataEditorPage.rowButton(0).click();
  await expect(metadataEditorPage.referenceText("text1")).toBeVisible();
  await metadataEditorPage.clearReferenceButton().click();
  await expect(metadataEditorPage.referenceText("text1")).toBeHidden();
  await metadataEditorPage.referToItemButton.click();
  await expect(metadataEditorPage.modelOption("text1")).toBeVisible();
  await expect(metadataEditorPage.modelOption("text2")).toBeVisible();
  await metadataEditorPage.rowButton(0).hover();
  await metadataEditorPage.rowButton(0).click();
  await contentPage.saveButton.click();
  await closeNotification(page);
  await contentPage.backButton.click();
  await expect(contentPage.cellSpanByText("text1")).toBeVisible();
  await contentPage.editButton.click();
  await expect(metadataEditorPage.referenceText("text1")).toBeVisible();
  await metadataEditorPage.replaceItemButton.click();
  await metadataEditorPage.rowButton(1).hover();
  await metadataEditorPage.rowButton(1).click();
  await expect(metadataEditorPage.referenceText("text2")).toBeVisible();
  await contentPage.saveButton.click();
  await closeNotification(page);
  await contentPage.backButton.click();
  await expect(contentPage.cellSpanByText("text2")).toBeVisible();
});

test("Two-way reference field editing has succeeded", async ({
  page,
  fieldEditorPage,
  contentPage,
  schemaPage,
  metadataEditorPage,
}) => {
  test.slow();
  await schemaPage.plusAddButton.first().click();
  await schemaPage.modelNameLabel.click();
  await schemaPage.modelNameLabel.fill("ref model");
  await schemaPage.modelKeyLabel.click();
  await schemaPage.modelKeyLabel.fill("ref-model");
  await schemaPage.okButton.click();
  await closeNotification(page);
  await schemaPage.fieldTypeButton("Text").click();
  await fieldEditorPage.displayNameInput.click();
  await fieldEditorPage.displayNameInput.fill("text");
  await fieldEditorPage.useAsTitleCheckbox.check();
  await fieldEditorPage.okButton.click();
  await closeNotification(page);
  await contentPage.contentText.click();
  await contentPage.newItemButton.click();
  await contentPage.fieldInput("text").click();
  await contentPage.fieldInput("text").fill("reference text1");
  await contentPage.saveButton.click();
  await closeNotification(page);
  await contentPage.backButton.click();
  await contentPage.newItemButton.click();
  await contentPage.fieldInput("text").click();
  await contentPage.fieldInput("text").fill("reference text2");
  await contentPage.saveButton.click();
  await closeNotification(page);

  await schemaPage.schemaText.click();
  await schemaPage.modelByText("e2e model name").click();
  await schemaPage.fieldTypeButton("Text").click();
  await fieldEditorPage.displayNameInput.click();
  await fieldEditorPage.displayNameInput.fill("text");
  await fieldEditorPage.useAsTitleCheckbox.check();
  await fieldEditorPage.okButton.click();
  await closeNotification(page);
  await schemaPage.fieldTypeButton("Reference").click();
  await metadataEditorPage.selectModelToReferenceLabel.click();
  await metadataEditorPage.modelOption("ref model #ref-model").click();
  await metadataEditorPage.twoWayReferenceCheckbox.check();
  await metadataEditorPage.nextButton.click();
  await expect(metadataEditorPage.nextButton).toBeDisabled();
  await metadataEditorPage.displayNameInput.click();
  await metadataEditorPage.displayNameInput.fill("ref1");
  await expect(metadataEditorPage.nextButton).toBeEnabled();
  await metadataEditorPage.descriptionInput.click();
  await metadataEditorPage.descriptionInput.fill("ref1 description");
  await expect(metadataEditorPage.supportMultipleValuesCheckbox).toBeDisabled();
  await expect(metadataEditorPage.useAsTitleCheckbox).toBeHidden();
  await metadataEditorPage.validationTab.click();
  await metadataEditorPage.makeFieldRequiredCheckbox.check();
  await expect(metadataEditorPage.setFieldAsUniqueCheckbox).toBeDisabled();
  await metadataEditorPage.nextButton.click();

  await expect(metadataEditorPage.confirmButton).toBeDisabled();
  await metadataEditorPage.displayNameInput.click();
  await metadataEditorPage.displayNameInput.fill("ref2");
  await expect(metadataEditorPage.confirmButton).toBeEnabled();
  await metadataEditorPage.descriptionInput.click();
  await metadataEditorPage.descriptionInput.fill("ref2 description");
  await metadataEditorPage.validationTab.click();
  await metadataEditorPage.makeFieldRequiredCheckbox.check();
  await metadataEditorPage.previousButton.click();
  await expect(metadataEditorPage.displayNameInput).toHaveValue("ref1");
  await expect(metadataEditorPage.fieldKeyInput).toHaveValue("ref1");
  await expect(metadataEditorPage.descriptionInput).toHaveValue("ref1 description");
  await metadataEditorPage.validationTab.click();
  await expect(metadataEditorPage.makeFieldRequiredCheckbox).toBeChecked();
  await metadataEditorPage.nextButton.click();
  await expect(metadataEditorPage.displayNameInput).toHaveValue("ref2");
  await expect(metadataEditorPage.fieldKeyInput).toHaveValue("ref2");
  await expect(metadataEditorPage.descriptionInput).toHaveValue("ref2 description");
  await metadataEditorPage.validationTab.click();
  await expect(metadataEditorPage.makeFieldRequiredCheckbox).toBeChecked();
  await metadataEditorPage.confirmButton.click();
  await closeNotification(page);

  await expect(schemaPage.fieldsContainer).toContainText("ref1 *#ref1");
  await schemaPage.ellipsisIcon().click();
  await expect(metadataEditorPage.modelOption("ref model #ref-model")).toBeVisible();
  await expect(metadataEditorPage.selectModelToReferenceLabel).toBeDisabled();
  await expect(metadataEditorPage.oneWayReferenceCheckbox.locator("span").first()).toBeDisabled();
  await expect(metadataEditorPage.twoWayReferenceCheckbox.locator("span").first()).toBeDisabled();
  await expect(metadataEditorPage.nextButton).toBeEnabled();
  await metadataEditorPage.nextButton.click();
  await expect(metadataEditorPage.nextButton).toBeEnabled();
  await metadataEditorPage.nextButton.click();
  await expect(metadataEditorPage.confirmButton).toBeDisabled();
  await metadataEditorPage.displayNameInput.click();
  await metadataEditorPage.displayNameInput.fill("reff");
  await expect(metadataEditorPage.confirmButton).toBeEnabled();
  await metadataEditorPage.displayNameInput.click();
  await metadataEditorPage.displayNameInput.fill("ref2");
  await expect(metadataEditorPage.confirmButton).toBeDisabled();
  await metadataEditorPage.previousButton.click();
  await metadataEditorPage.displayNameInput.click();
  await metadataEditorPage.displayNameInput.fill("reff");
  await metadataEditorPage.nextButton.click();
  await expect(metadataEditorPage.confirmButton).toBeEnabled();
  await metadataEditorPage.previousButton.click();
  await metadataEditorPage.displayNameInput.click();
  await metadataEditorPage.displayNameInput.fill("ref1");
  await metadataEditorPage.nextButton.click();
  await expect(metadataEditorPage.confirmButton).toBeDisabled();
  await metadataEditorPage.closeButton.first().click();
  await contentPage.contentText.click();
  await expect(contentPage.tableHead).toContainText("ref1");
  await contentPage.newItemButton.click();
  await expect(metadataEditorPage.fieldParagraph("ref1")).toBeVisible();
  await expect(metadataEditorPage.referToItemButton).toBeVisible();
  await expect(metadataEditorPage.modelOption("ref1 description")).toBeVisible();
  await contentPage.fieldInput("text").click();
  await contentPage.fieldInput("text").fill("text1");
  await metadataEditorPage.referToItemButton.click();
  await expect(metadataEditorPage.modelOption("reference text1")).toBeVisible();
  await expect(metadataEditorPage.modelOption("reference text2")).toBeVisible();
  await metadataEditorPage.rowButton(0).hover();
  await metadataEditorPage.rowButton(0).click();
  await expect(metadataEditorPage.referenceText("reference text1")).toBeVisible();
  await contentPage.saveButton.click();
  await closeNotification(page);
  await contentPage.backButton.click();

  await contentPage.newItemButton.click();
  await contentPage.fieldInput("text").click();
  await contentPage.fieldInput("text").fill("text2");
  await metadataEditorPage.referToItemButton.click();
  await metadataEditorPage.rowButton(1).hover();
  await metadataEditorPage.rowButton(1).click();
  await expect(metadataEditorPage.referenceText("reference text2")).toBeVisible();
  await contentPage.saveButton.click();
  await closeNotification(page);
  await contentPage.backButton.click();

  await expect(contentPage.cellSpanByText("reference text1")).toBeVisible();
  await expect(contentPage.cellSpanByText("reference text2")).toBeVisible();
  await contentPage.modelLinkByText("ref model").click();
  await expect(contentPage.tableHead).toContainText("ref2");
  await expect(contentPage.cellByTextExact("text1").locator("span").first()).toBeVisible();
  await expect(contentPage.cellByTextExact("text2").locator("span").first()).toBeVisible();
  await contentPage.editButton.first().click();
  await metadataEditorPage.referToItemButton.click();
  await metadataEditorPage.rowButton(0).hover();
  await metadataEditorPage.rowButton(0).click();
  await metadataEditorPage.okButton.click();
  await contentPage.saveButton.click();
  await closeNotification(page);
  await contentPage.backButton.click();
  await expect(contentPage.cellByTextExact("text1").locator("span").first()).toBeVisible();
  await expect(contentPage.cellByTextExact("text2").locator("span").first()).toBeHidden();

  await contentPage.modelLinkByText("e2e model name").click();
  await expect(contentPage.cellByTextExact("reference text1").locator("span").first()).toBeHidden();
  await expect(
    contentPage.cellByTextExact("reference text2").locator("span").first(),
  ).toBeVisible();
});