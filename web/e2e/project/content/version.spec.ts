import { stateColors } from "@reearth-cms/components/molecules/Content/utils";
import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { handleFieldForm } from "@reearth-cms/e2e/project/utils/field";
import { createModel } from "@reearth-cms/e2e/project/utils/model";
import { createProject, deleteProject } from "@reearth-cms/e2e/project/utils/project";
import { expect, test } from "@reearth-cms/e2e/utils";

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

test.beforeEach(async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
  await createModel(page);
  await page
    .getByRole("listitem")
    .filter({ has: page.getByText("Text", { exact: true }) })
    .click();
  await handleFieldForm(page, fieldName);
  await page.getByText("Content").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByLabel(fieldName).fill("1");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);

  await page.getByRole("tab", { name: "Version History" }).click();
});

test.afterEach(async ({ page }) => {
  await deleteProject(page);
});

test("Read versions successfully", async ({ page }) => {
  const requestStatus = page.getByTestId("requestStatus").locator("span");
  await expect(page.getByText(dateReg)).toBeVisible();
  await expect(page.getByText("current")).toBeVisible();
  await expect(page.getByText(/Created by .*/)).toBeVisible();
  await expect(requestStatus).toHaveCSS("background-color", getRgb(stateColors.DRAFT));
  await requestStatus.hover();
  await expect(page.getByRole("tooltip", { name: "DRAFT" })).toBeVisible();

  await createRequest(page);
  const request = page.getByRole("link", { name: `pull-request ${requestTitle}` });
  await expect(request).toBeVisible();
  await expect(requestStatus).toHaveCSS("background-color", getRgb(stateColors.REVIEW));
  await requestStatus.hover();
  await expect(page.getByRole("tooltip", { name: "REVIEW" })).toBeVisible();
  const itemId = page.url().split("/").at(-1);
  await request.click();
  await page.getByRole("button", { name: "Approve" }).click();
  await closeNotification(page);
  await page.getByRole("button", { name: itemId, exact: true }).click();
  await page.getByRole("tab", { name: "Version History" }).click();
  await expect(request).toBeHidden();
  await expect(requestStatus).toHaveCSS("background-color", getRgb(stateColors.PUBLIC));
  await requestStatus.hover();
  await expect(page.getByRole("tooltip", { name: "PUBLIC" })).toBeVisible();

  await page.getByLabel(fieldName).fill("2");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);

  await expect(page.getByText(dateReg)).toHaveCount(2);
  await expect(page.getByText(/Updated by .*/)).toBeVisible();
  await expect(requestStatus.first()).toHaveCSS("background-color", getRgb(stateColors.DRAFT));
  await expect(requestStatus.last()).toHaveCSS("background-color", getRgb(stateColors.PUBLIC));
});

test.describe("Version details", () => {
  test.beforeEach(async ({ page }) => {
    await page.getByLabel(fieldName).fill("2");
    await page.getByRole("button", { name: "Save" }).click();
    await closeNotification(page);

    await page.getByText(dateReg).last().click();
  });

  test("Read a version details successfully", async ({ page }) => {
    await expect(page.getByRole("tab", { name: "Version History" })).toBeHidden();
    await expect(page.getByLabel(fieldName).first()).toHaveValue("2");
    await expect(page.getByLabel(fieldName).last()).toHaveValue("1");

    await page.getByRole("button", { name: "back" }).last().click();
    await expect(page.getByRole("tab", { name: "Version History" })).toBeVisible();
  });

  test("Restore a version successfully", async ({ page }) => {
    const saveButton = page.getByRole("button", { name: "Save" });
    await expect(saveButton).toBeDisabled();
    await page.getByRole("button", { name: "Restore" }).click();
    await page.getByRole("alert").getByRole("button", { name: "Restore" }).click();
    await expect(saveButton).toBeEnabled();
    await expect(page.getByRole("tab", { name: "Version History" })).toBeVisible();
    await expect(page.getByLabel(fieldName)).toHaveValue("1");
    await page.getByText("current", { exact: true }).click();
    await page.getByRole("main").getByRole("button", { name: "Restore" }).click();
    await page.getByRole("alert").getByRole("button", { name: "Restore" }).first().click();
    await expect(saveButton).toBeDisabled();
    await expect(page.getByRole("tab", { name: "Version History" })).toBeVisible();
    await expect(page.getByLabel(fieldName)).toHaveValue("2");
  });
});
