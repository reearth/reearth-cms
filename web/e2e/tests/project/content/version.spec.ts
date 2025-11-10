import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { stateColors } from "@reearth-cms/e2e/helpers/format.helper";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";

const dateReg = /([0-9]{4})\/(0[1-9]|1[0-2])\/([0-2][0-9]|3[01]), ([01][0-9]|2[0-3]):[0-5][0-9]/;
const requestTitle = "e2e request title";

const fieldName = "text";

function getRgb(colorCode: string) {
  return `rgb(${String(
    colorCode
      .slice(1)
      .match(/.{2}/g)
      ?.map(hex => parseInt(hex, 16)),
  ).replaceAll(",", ", ")})`;
}

test.beforeEach(async ({ reearth, fieldEditorPage, projectPage, contentPage, schemaPage }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  const projectName = getId();
  await projectPage.createProject(projectName);
  await projectPage.gotoProject(projectName);
  await projectPage.createModelFromOverview();
  await fieldEditorPage.fieldTypeButton("Text").click();
  await schemaPage.handleFieldForm(fieldName);
  await projectPage.contentMenuItem.click();
  await contentPage.newItemButton.click();
  await contentPage.fieldInput(fieldName).fill("1");
  await contentPage.saveButton.click();
  await contentPage.closeNotification();

  await contentPage.versionHistoryTab.click();
});

test.afterEach(async ({ projectPage }) => {
  await projectPage.deleteProject();
});

test("Read versions successfully", async ({ contentPage, page }) => {
  const requestStatus = contentPage.requestStatusElement;

  await test.step("Verify initial DRAFT version", async () => {
    await expect(contentPage.textByRegex(dateReg)).toBeVisible();
    await expect(contentPage.currentVersionText).toBeVisible();
    await expect(contentPage.textByRegex(/Created by .*/)).toBeVisible();
    await expect(requestStatus).toHaveCSS("background-color", getRgb(stateColors.DRAFT));
    await requestStatus.hover();
    await expect(contentPage.tooltipByName("DRAFT")).toBeVisible();
  });

  await test.step("Create request and verify REVIEW status", async () => {
    await contentPage.createRequest(requestTitle);
    const request = contentPage.requestLink(requestTitle);
    await expect(request).toBeVisible();
    await expect(requestStatus).toHaveCSS("background-color", getRgb(stateColors.REVIEW));
    await requestStatus.hover();
    await expect(contentPage.tooltipByName("REVIEW")).toBeVisible();
  });

  await test.step("Approve request and verify PUBLIC status", async () => {
    const request = contentPage.requestLink(requestTitle);
    const itemId = contentPage.url().split("/").at(-1) as string;
    await request.click();
    await contentPage.approveButton.click();
    await contentPage.closeNotification();
    await page.waitForTimeout(300);
    await contentPage.itemIdButton(itemId).click();
    await contentPage.versionHistoryTab.click();
    await expect(request).toBeHidden();
    await expect(requestStatus).toHaveCSS("background-color", getRgb(stateColors.PUBLIC));
    await requestStatus.hover();
    await expect(contentPage.tooltipByName("PUBLIC")).toBeVisible();
  });

  await test.step("Update item and verify multiple versions with different statuses", async () => {
    await contentPage.fieldInput(fieldName).fill("2");
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
    await page.waitForTimeout(300);

    await expect(contentPage.textByRegex(dateReg)).toHaveCount(2);
    await expect(contentPage.textByRegex(/Updated by .*/)).toBeVisible();
    await expect(requestStatus.first()).toHaveCSS("background-color", getRgb(stateColors.DRAFT));
    await expect(requestStatus.last()).toHaveCSS("background-color", getRgb(stateColors.PUBLIC));
  });
});

test.describe("Version details", () => {
  test.beforeEach(async ({ contentPage, page }) => {
    await expect(contentPage.fieldInput(fieldName)).toHaveValue("1");
    await contentPage.fieldInput(fieldName).fill("2");
    await contentPage.saveButton.click();
    await contentPage.closeNotification();
    await page.waitForTimeout(300);
    await expect(contentPage.textByRegex(dateReg)).toHaveCount(2);
    await expect(contentPage.fieldInput(fieldName)).toHaveValue("2");

    await contentPage.textByRegex(dateReg).last().click();
  });

  test("Read a version details successfully", async ({ contentPage, page }) => {
    await test.step("View version details and compare values", async () => {
      await expect(contentPage.versionHistoryTab).toBeHidden();
      await expect(contentPage.fieldInput(fieldName).first()).toHaveValue("2");
      await expect(contentPage.fieldInput(fieldName).last()).toHaveValue("1");
    });

    await test.step("Navigate back to version history", async () => {
      await contentPage.backButtonLast.click();
      await page.waitForTimeout(300);
      await expect(contentPage.versionHistoryTab).toBeVisible();
    });
  });

  test("Restore a version successfully", async ({ contentPage, page }) => {
    const saveButton = contentPage.saveButton;

    await test.step("Restore older version", async () => {
      await expect(saveButton).toBeDisabled();
      await contentPage.restoreButton.click();
      await contentPage.restoreButtonAlert.click();
      await page.waitForTimeout(300);
      await expect(saveButton).toBeEnabled();
      await expect(contentPage.versionHistoryTab).toBeVisible();
      await expect(contentPage.fieldInput(fieldName)).toHaveValue("1");
    });

    await test.step("Restore back to current version", async () => {
      await contentPage.currentVersionTextExact.click();
      await contentPage.restoreButtonMain.click();
      await contentPage.restoreButtonAlertFirst.click();
      await page.waitForTimeout(300);
      await expect(saveButton).toBeDisabled();
      await expect(contentPage.versionHistoryTab).toBeVisible();
      await expect(contentPage.fieldInput(fieldName)).toHaveValue("2");
    });
  });
});
