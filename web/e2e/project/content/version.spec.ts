import { stateColors } from "@reearth-cms/components/molecules/Content/utils";
import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { handleFieldForm } from "@reearth-cms/e2e/project/utils/field";
import { createModelFromOverview } from "@reearth-cms/e2e/project/utils/model";
import { createProject, deleteProject } from "@reearth-cms/e2e/project/utils/project";

import { createRequest, requestTitle } from "../utils/item";

const dateReg = /([0-9]{4})\/(0[1-9]|1[0-2])\/([0-2][0-9]|3[01]), ([01][0-9]|2[0-3]):[0-5][0-9]/;
const fieldName = "text";

function getRgb(colorCode: string) {
  return `rgb(${String(
    colorCode
      .slice(1)
      .match(/.{2}/g)
      ?.map(hex => parseInt(hex, 16)),
  ).replaceAll(",", ", ")})`;
}

test.beforeEach(async ({ reearth, page, contentPage }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
  await createModelFromOverview(page);

  await page
    .getByRole("listitem")
    .filter({ has: page.getByText("Text", { exact: true }) })
    .click();

  await handleFieldForm(page, fieldName);

  await contentPage.contentTab.click();
  await contentPage.newItemButton.click();
  await page.getByLabel(fieldName).fill("1");
  await contentPage.saveButton.click();
  await closeNotification(page);

  await contentPage.versionHistoryTab.click();
});

test.afterEach(async ({ page }) => {
  await deleteProject(page);
});

test("Read versions successfully", async ({ page, contentPage }) => {
  const requestStatus = contentPage.requestStatus;

  await expect(contentPage.versionTimestamp(dateReg)).toBeVisible();
  await expect(contentPage.currentChip).toBeVisible();
  await expect(page.getByText(/Created by .*/)).toBeVisible();

  await expect(requestStatus).toHaveCSS("background-color", getRgb(stateColors.DRAFT));
  await requestStatus.hover();
  await expect(contentPage.tooltipByName("DRAFT")).toBeVisible();

  await createRequest(page);

  const request = contentPage.requestLinkByTitle(requestTitle);
  await expect(request).toBeVisible();
  await expect(requestStatus).toHaveCSS("background-color", getRgb(stateColors.REVIEW));
  await requestStatus.hover();
  await expect(contentPage.tooltipByName("REVIEW")).toBeVisible();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const itemId = page.url().split("/").at(-1)!;

  await request.click();
  await contentPage.approveButton.click();
  await closeNotification(page);

  await contentPage.itemIdButton(itemId).click();
  await contentPage.versionHistoryTab.click();

  await expect(request).toBeHidden();
  await expect(requestStatus).toHaveCSS("background-color", getRgb(stateColors.PUBLIC));
  await requestStatus.hover();
  await expect(contentPage.tooltipByName("PUBLIC")).toBeVisible();

  await page.getByLabel(fieldName).fill("2");
  await contentPage.saveButton.click();
  await closeNotification(page);

  await expect(contentPage.versionTimestamp(dateReg)).toHaveCount(2);
  await expect(page.getByText(/Updated by .*/)).toBeVisible();
  await expect(requestStatus.first()).toHaveCSS("background-color", getRgb(stateColors.DRAFT));
  await expect(requestStatus.last()).toHaveCSS("background-color", getRgb(stateColors.PUBLIC));
});

test.describe("Version details", () => {
  test.beforeEach(async ({ page, contentPage }) => {
    await expect(page.getByLabel(fieldName)).toHaveValue("1");
    await page.getByLabel(fieldName).fill("2");
    await contentPage.saveButton.click();
    await closeNotification(page);

    await expect(contentPage.versionTimestamp(dateReg)).toHaveCount(2);
    await expect(page.getByLabel(fieldName)).toHaveValue("2");

    await contentPage.versionTimestamp(dateReg).last().click();
  });

  test("Read a version details successfully", async ({ page, contentPage }) => {
    await expect(contentPage.versionHistoryTab).toBeHidden();
    await expect(page.getByLabel(fieldName).first()).toHaveValue("2");
    await expect(page.getByLabel(fieldName).last()).toHaveValue("1");

    await contentPage.backIconButton.last().click();
    await expect(contentPage.versionHistoryTab).toBeVisible();
  });

  test("Restore a version successfully", async ({ page, contentPage }) => {
    const saveButton = contentPage.saveButton;
    await expect(saveButton).toBeDisabled();

    await contentPage.restoreButton.click();
    await contentPage.confirmRestoreButtonInAlert.click();

    await expect(saveButton).toBeEnabled();
    await expect(contentPage.versionHistoryTab).toBeVisible();
    await expect(page.getByLabel(fieldName)).toHaveValue("1");

    await contentPage.currentChip.click();
    await contentPage.mainRestoreButton.click();
    await contentPage.confirmRestoreButtonInAlert.first().click();

    await expect(saveButton).toBeDisabled();
    await expect(contentPage.versionHistoryTab).toBeVisible();
    await expect(page.getByLabel(fieldName)).toHaveValue("2");
  });
});
