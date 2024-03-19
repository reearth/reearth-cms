import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { handleFieldForm } from "@reearth-cms/e2e/project/utils/field";
import { createModel } from "@reearth-cms/e2e/project/utils/model";
import { createProject, deleteProject } from "@reearth-cms/e2e/project/utils/project";
import { expect, test } from "@reearth-cms/e2e/utils";

test.beforeEach(async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
  await createModel(page);
});

test.afterEach(async ({ page }) => {
  await deleteProject(page);
});

test("View CRUD has succeeded", async ({ page }) => {
  await page.locator("li").filter({ hasText: "Text" }).locator("div").first().click();
  await handleFieldForm(page, "text");
  await closeNotification(page);
  await page.getByText("Content").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByLabel("text").click();
  await page.getByLabel("text").fill("text1");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created Item!");
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByLabel("text").click();
  await page.getByLabel("text").fill("text2");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created Item!");
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "Save as new view" }).click();
  await page.getByLabel("View Name").click();
  await page.getByLabel("View Name").fill("view1");
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created view!");
  await closeNotification(page);
  await expect(page.getByText("view1")).toBeVisible();
  await expect(page.getByRole("tab").nth(0)).toHaveAttribute("aria-selected", "true");

  await page.getByLabel("more").locator("svg").click();
  await page.getByText("Rename").click();
  await page.getByLabel("View Name").click();
  await page.getByLabel("View Name").fill("new view1");
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully renamed view!");
  await closeNotification(page);
  await expect(page.getByText("new view1")).toBeVisible();
  await page.getByLabel("more").locator("svg").click();
  await page.getByText("Remove View").click();
  await page.getByRole("button", { name: "Remove" }).click();
  await expect(page.getByRole("alert").last()).toContainText(
    "input: deleteView model should have at least one view",
  );
  await closeNotification(page);

  await page.getByText("text", { exact: true }).click();
  await expect(
    page.getByRole("cell", { name: "text caret-up caret-down" }).locator(".anticon-caret-up"),
  ).toHaveClass(/active/);
  await expect(page.locator(".ant-table-row").nth(0)).toContainText("text1");
  await expect(page.locator(".ant-table-row").nth(1)).toContainText("text2");

  await page.getByRole("button", { name: "Save as new view" }).click();
  await page.getByLabel("View Name").click();
  await page.getByLabel("View Name").fill("view2");
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created view!");
  await closeNotification(page);
  await expect(page.getByRole("tab").nth(0)).toHaveAttribute("aria-selected", "false");
  await expect(page.getByRole("tab").nth(1)).toHaveAttribute("aria-selected", "true");
  await expect(
    page.getByRole("cell", { name: "text caret-up caret-down" }).locator(".anticon-caret-up"),
  ).toHaveClass(/active/);
  await expect(page.locator(".ant-table-row").nth(0)).toContainText("text1");
  await expect(page.locator(".ant-table-row").nth(1)).toContainText("text2");

  await page.getByText("new view1").click();
  await expect(page.getByRole("tab").nth(0)).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tab").nth(1)).toHaveAttribute("aria-selected", "false");
  await expect(
    page.getByRole("cell", { name: "text caret-up caret-down" }).locator(".anticon-caret-up"),
  ).not.toHaveClass(/active/);
  await expect(page.locator(".ant-table-row").nth(0)).toContainText("text2");
  await expect(page.locator(".ant-table-row").nth(1)).toContainText("text1");

  await page.getByText("text", { exact: true }).click();
  await page.getByText("text", { exact: true }).click();
  await page.getByRole("tab", { name: "new view1 more" }).locator("svg").click();
  await page.getByText("Update View").click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated view!");
  await closeNotification(page);

  await page.getByText("view2").click();
  await expect(
    page.getByRole("cell", { name: "text caret-up caret-down" }).locator(".anticon-caret-up"),
  ).toHaveClass(/active/);

  await page.getByText("new view1").click();
  await expect(
    page.getByRole("cell", { name: "text caret-up caret-down" }).locator(".anticon-caret-down"),
  ).toHaveClass(/active/);
  await expect(page.locator(".ant-table-row").nth(0)).toContainText("text2");
  await expect(page.locator(".ant-table-row").nth(1)).toContainText("text1");

  await page.getByRole("tab", { name: "new view1 more" }).click();
  await page.getByRole("tab", { name: "new view1 more" }).locator("svg").click();
  await page.getByText("Remove View").click();
  await page.getByRole("button", { name: "Remove" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully deleted view!");
  await closeNotification(page);
  await expect(page.getByText("new view1")).not.toBeVisible();
  await expect(page.getByText("view2")).toBeVisible();
  await expect(page.getByRole("tab").nth(0)).toHaveAttribute("aria-selected", "true");
  await expect(
    page.getByRole("cell", { name: "text caret-up caret-down" }).locator(".anticon-caret-up"),
  ).toHaveClass(/active/);
  await expect(page.locator(".ant-table-row").nth(0)).toContainText("text1");
  await expect(page.locator(".ant-table-row").nth(1)).toContainText("text2");
});
