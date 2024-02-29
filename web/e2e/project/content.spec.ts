import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect, test } from "@reearth-cms/e2e/utils";

import { crudComment } from "./utils/comment";
import { handleFieldForm } from "./utils/field";
import { createRequest } from "./utils/item";
import { createModel } from "./utils/model";
import { createProject, deleteProject } from "./utils/project";
import { createWorkspace, deleteWorkspace } from "./utils/workspace";

test("Item CRUD and searching has succeeded", async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
  await createModel(page);
  await page
    .locator("li")
    .filter({ hasText: "TextHeading and titles, one-" })
    .locator("div")
    .first()
    .click();
  await handleFieldForm(page, "text");
  await closeNotification(page);
  await page.getByText("Content").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByLabel("text").click();
  await page.getByLabel("text").fill("text");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created Item!");
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await expect(page.getByRole("cell", { name: "text", exact: true })).toBeVisible();
  await page.getByPlaceholder("Please enter").click();
  await page.getByPlaceholder("Please enter").fill("no field");
  await page.getByRole("button", { name: "search" }).click();
  await expect(page.getByRole("cell", { name: "text", exact: true })).not.toBeVisible();
  await page.getByPlaceholder("Please enter").fill("");
  await page.getByRole("button", { name: "search" }).click();
  await expect(page.getByRole("cell", { name: "text", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "edit", exact: true }).click();
  await page.getByLabel("text").click();

  await page.getByLabel("text").click();
  await page.getByLabel("text").fill("new text");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated Item!");
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await expect(page.getByRole("cell", { name: "new text" })).toBeVisible();
  await page.getByLabel("", { exact: true }).check();
  await page.getByText("Delete").click();
  await expect(page.getByRole("alert").last()).toContainText(
    "One or more items were successfully deleted!",
  );
  await closeNotification(page);
  await expect(page.getByRole("cell", { name: "new text" })).not.toBeVisible();
  await deleteProject(page);
});

test("Publishing and Unpublishing item has succeeded", async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
  await createModel(page);
  await page
    .locator("li")
    .filter({ hasText: "TextHeading and titles, one-" })
    .locator("div")
    .first()
    .click();
  await handleFieldForm(page, "text");
  await closeNotification(page);
  await page.getByText("Content").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByLabel("text").click();
  await page.getByLabel("text").fill("text");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created Item!");
  await closeNotification(page);
  await page.getByRole("button", { name: "Publish" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully published items!");
  await closeNotification(page);
  await expect(page.getByText("PUBLIC")).toBeVisible();
  await page.getByLabel("Back").click();
  await expect(page.getByText("PUBLIC")).toBeVisible();
  await page.getByLabel("", { exact: true }).check();
  await page.getByText("Unpublish").click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully unpublished items!");
  await closeNotification(page);
  await expect(page.getByText("DRAFT")).toBeVisible();
  await page.getByRole("link", { name: "edit", exact: true }).click();
  await expect(page.getByText("DRAFT")).toBeVisible();
  await page.getByRole("button", { name: "Publish" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully published items!");
  await closeNotification(page);
  await expect(page.getByText("PUBLIC")).toBeVisible();
  await page.getByRole("button", { name: "ellipsis" }).click();
  await page.getByText("Unpublish").click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully unpublished items!");
  await closeNotification(page);
  await expect(page.getByText("DRAFT")).toBeVisible();
  await page.getByLabel("Back").click();
  await expect(page.getByText("DRAFT")).toBeVisible();
  await deleteProject(page);
});

const requestTitle = "title";

test("Creating a new request and adding to request has succeeded", async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  const username = await page.locator("a").nth(1).locator("div").nth(2).locator("p").innerText();
  await createWorkspace(page);
  await createProject(page);
  await createModel(page);
  await createRequest(page, username, requestTitle);
  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created Item!");
  await closeNotification(page);
  await page.getByRole("button", { name: "ellipsis" }).click();
  await page.getByText("Add to Request").click();
  await page.getByLabel("", { exact: true }).check();
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated Request!");
  await closeNotification(page);
  await page.getByText("Request", { exact: true }).click();
  await page.getByRole("button", { name: "edit" }).click();
  await expect(page.getByRole("button", { name: "right e2e model name" }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "right e2e model name" }).nth(1)).toBeVisible();
  await deleteProject(page);
  await deleteWorkspace(page);
});

test("Comment CRUD on Content page has succeeded", async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
  await createModel(page);
  await page
    .locator("li")
    .filter({ hasText: "TextHeading and titles, one-" })
    .locator("div")
    .first()
    .click();
  await handleFieldForm(page, "text");
  await closeNotification(page);
  await page.getByText("Content").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByLabel("text").click();
  await page.getByLabel("text").fill("text");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created Item!");
  await closeNotification(page);

  await page.getByLabel("Back").click();

  await page.getByRole("button", { name: "0" }).click();
  await expect(page.getByText("CommentsNo comments.Comment")).toBeVisible();
  await crudComment(page);

  await deleteProject(page);
});

test("Comment CRUD on edit page has succeeded", async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
  await createModel(page);
  await page.locator("li").filter({ hasText: "Text" }).locator("div").first().click();
  await handleFieldForm(page, "text");
  await closeNotification(page);
  await page.getByText("Content").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByLabel("text").click();
  await page.getByLabel("text").fill("text");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created Item!");
  await closeNotification(page);
  await page.getByLabel("message").click();
  await expect(page.getByText("CommentsComment")).toBeVisible();
  await crudComment(page);
  await deleteProject(page);
});
