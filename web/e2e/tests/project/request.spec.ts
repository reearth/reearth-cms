import { SchemaFieldType } from "@reearth-cms/components/molecules/Schema/types";
import { expect, TAG, test } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";

let itemTitle: string;
let titleFieldName: string;
let requestTitle: string;
let modelName: string;

test.beforeEach(async ({ projectPage, fieldEditorPage, contentPage }) => {
  modelName = `model-${getId()}`;
  titleFieldName = `title-field-${getId()}`;
  itemTitle = `item-title-${getId()}`;
  requestTitle = `request-${getId()}`;
  await projectPage.goto("/");
  const projectName = getId();
  await projectPage.createProject(projectName);
  await projectPage.gotoProject(projectName);
  await projectPage.createModelFromOverview(modelName);
  await fieldEditorPage.createField({
    type: SchemaFieldType.Text,
    name: titleFieldName,
    isTitle: true,
    defaultValue: itemTitle,
  });
  await contentPage.createItem();
  await contentPage.createRequest(requestTitle);
});

test.afterEach(async ({ projectPage }) => {
  await projectPage.deleteProject();
});

test(
  "Request creating, searching, updating reviewer, and approving has succeeded",
  { tag: TAG.SMOKE },
  async ({ requestPage }) => {
    await test.step("Navigate to request page and verify request is visible", async () => {
      await requestPage.requestMenuItem.click();
      await expect(requestPage.tableBodyTextByText(requestTitle, true)).toBeVisible();
      await expect(requestPage.tableBodyTextByText("WAITING")).toBeVisible();
    });

    await test.step("Search for non-existent request", async () => {
      await requestPage.searchInput.click();
      await requestPage.searchInput.fill("no request");
      await requestPage.searchButton.click();
      await expect(requestPage.tableBodyTextByText(requestTitle, true)).toBeHidden();
      await expect(requestPage.tableBodyTextByText("WAITING")).toBeHidden();
    });

    await test.step("Clear search and verify request is visible again", async () => {
      await requestPage.searchInput.fill("");
      await requestPage.searchButton.click();
      await expect(requestPage.tableBodyTextByText(requestTitle, true)).toBeVisible();
      await expect(requestPage.tableBodyTextByText("WAITING")).toBeVisible();
    });

    await test.step("Assign reviewer to request", async () => {
      await requestPage.editButton.click();
      await requestPage.assignToButton.click();
      await requestPage.closeCircleButton.click();
      await requestPage.selectOverflow.click();
      await requestPage.selectItem.click();
      await requestPage.reviewerHeading.click();
    });

    await test.step("Approve request", async () => {
      await requestPage.approveButton.click();
      await requestPage.closeNotification();
      await requestPage.backButton.click();
    });

    await test.step("Verify request is approved and filter works correctly", async () => {
      await expect(requestPage.tableBodyTextByText(requestTitle, true)).toBeHidden();
      await requestPage.stateFilterButton.click();
      await requestPage.waitingMenuItem().uncheck();
      await requestPage.okButton.click();
      await expect(requestPage.tableBodyTextByText(requestTitle, true)).toBeVisible();
      await expect(requestPage.tableBodyTextByText("APPROVED")).toBeVisible();
    });
  },
);

test("Request closing and reopening has succeeded", async ({ requestPage }) => {
  await test.step("Navigate to request page and verify initial state", async () => {
    await requestPage.requestMenuItem.click();
    await expect(requestPage.tableBodyTextByText(requestTitle, true)).toBeVisible();
    await expect(requestPage.tableBodyTextByText("WAITING")).toBeVisible();
    await requestPage.editButton.click();
  });

  await test.step("Close request from edit page", async () => {
    await requestPage.closeButton.click();
    await requestPage.closeNotification();
    await requestPage.backButton.click();
    await expect(requestPage.tableBodyTextByText(requestTitle, true)).toBeHidden();
    await expect(requestPage.tableBodyTextByText("WAITING")).toBeHidden();
  });

  await test.step("Verify request appears as closed in list", async () => {
    await requestPage.stateFilterButton.click();
    await requestPage.waitingMenuItem().uncheck();
    await requestPage.okButton.click();
    await expect(requestPage.tableBodyTextByText("CLOSED")).toBeVisible();
  });

  await test.step("Reopen request from edit page", async () => {
    await requestPage.editButton.click();
    await expect(requestPage.statusText("CLOSED")).toBeVisible();
    await expect(requestPage.statusText("Closed")).toBeVisible();
    await requestPage.reopenButton.click();
    await requestPage.closeNotification();
    await requestPage.backButtonCapitalized.click();
  });

  await test.step("Verify request is reopened and waiting", async () => {
    await expect(requestPage.tableBodyTextByText(requestTitle, true)).toBeVisible();
    await expect(requestPage.tableBodyTextByText("WAITING")).toBeVisible();
  });

  await test.step("Close request from list view using bulk action", async () => {
    await requestPage.selectCheckbox.check();
    await requestPage.closeTextButton.click();
    await requestPage.closeNotification();
  });

  await test.step("Verify request is closed after bulk action", async () => {
    await requestPage.stateFilterButton.click();
    await requestPage.waitingMenuItem().uncheck();
    await requestPage.okButton.click();
    await expect(requestPage.tableBodyTextByText("CLOSED")).toBeVisible();
    await requestPage.editButton.click();
    await expect(requestPage.statusText("CLOSED")).toBeVisible();
  });
});

test("Comment CRUD on edit page has succeeded", {
  tag: TAG.TO_ABANDON,
  annotation: {
    type: "consolidate",
    description: '"Comment CRUD on Content page" in content.spec.ts (@smoke)',
  },
}, async ({ requestPage }) => {
  await test.step("Navigate to request edit page", async () => {
    await requestPage.requestMenuItem.click();
    await expect(requestPage.tableBodyTextByText(requestTitle, true)).toBeVisible();
    await expect(requestPage.tableBodyTextByText("WAITING")).toBeVisible();
    await requestPage.editButton.click();
  });

  await test.step("Create a comment", async () => {
    await requestPage.commentTextbox.click();
    await requestPage.commentTextbox.fill("comment");
    await requestPage.commentButton.click();
    await requestPage.closeNotification();
    await expect(requestPage.statusText("comment")).toBeVisible();
  });

  await test.step("Update the comment", async () => {
    await expect(requestPage.checkButton).toBeVisible();
    await requestPage.checkButton.click();
    await expect(requestPage.commentTextboxWithText("comment")).toBeVisible();
    await requestPage.commentTextboxWithText("comment").click();
    await requestPage.commentTextboxWithText("comment").fill("new comment");
    await expect(requestPage.checkButton).toBeVisible();
    await requestPage.checkButton.click();
    await requestPage.closeNotification();
    await expect(requestPage.getByText("new comment")).toBeVisible();
  });

  await test.step("Delete the comment", async () => {
    await expect(requestPage.deleteButton).toBeVisible();
    await requestPage.deleteButton.click();
    await requestPage.closeNotification();
    await expect(requestPage.getByText("new comment")).toBeHidden();
  });
});

test("Comment CRUD on Request page has succeeded", {
  tag: TAG.TO_ABANDON,
  annotation: {
    type: "consolidate",
    description: '"Comment CRUD on Content page" in content.spec.ts (@smoke)',
  },
}, async ({ requestPage, contentPage }) => {
  await test.step("Navigate to request comments panel", async () => {
    await requestPage.requestMenuItem.click();
    await requestPage.commentsCountButton("0").click();
  });

  await test.step("Create, update, and delete comment", async () => {
    await contentPage.createComment("comment");
    await contentPage.updateComment("comment", "new comment");
    await contentPage.deleteComment();
  });
});

test("Creating a new request and adding to request has succeeded", async ({ requestPage }) => {
  await test.step("Create a new item", async () => {
    await expect(requestPage.backButtonCapitalized).toBeVisible();
    await requestPage.backButtonCapitalized.click();
    await expect(requestPage.newItemButton).toBeVisible();
    await requestPage.newItemButton.click();
    await expect(requestPage.saveButton).toBeVisible();
    await requestPage.saveButton.click();
    await requestPage.closeNotification();
  });

  await test.step("Add new item to existing request", async () => {
    await expect(requestPage.ellipsisButton).toBeVisible();
    await requestPage.ellipsisButton.click();
    await expect(requestPage.addToRequestButton).toBeVisible();
    await requestPage.addToRequestButton.click();
    await expect(requestPage.selectCheckbox).toBeVisible();
    await requestPage.selectCheckbox.click();
    await requestPage.okButton.click();
    await requestPage.closeNotification();
  });

  await test.step("Verify both items appear in request", async () => {
    await requestPage.requestMenuItem.click();
    await expect(requestPage.editButton).toBeVisible();
    await requestPage.editButton.click();
    await expect(requestPage.collapsedModelButton(modelName, 0)).toBeVisible();
    await expect(requestPage.collapsedModelButton(modelName, 1)).toBeVisible();
  });
});

test("Navigating between item and request has succeeded", async ({ contentPage, requestPage }) => {
  await test.step("Navigate from item to request and approve", async () => {
    await requestPage.versionHistoryTab.click();
    await requestPage.requestTitleLink(requestTitle).click();
    await expect(requestPage.requestPageTitle(requestTitle)).toBeVisible();
    await expect(requestPage.requestHeading(requestTitle)).toBeVisible();
    await requestPage.approveButton.click();
    await requestPage.closeNotification();
  });

  await test.step("Navigate back to item and clear title", async () => {
    await requestPage.itemTitleButton(itemTitle).click();
    await expect(requestPage.titleFieldInput(titleFieldName, "Title")).toHaveValue(itemTitle);
    await requestPage.titleFieldInput(titleFieldName, "Title").click();
    await requestPage.titleFieldInput(titleFieldName, "Title").clear();
    await requestPage.saveButton.click();
    await requestPage.closeNotification();
  });

  let savedItemId: string;
  let newRequestTitle: string;

  await test.step("Create new request and update item title", async () => {
    savedItemId = requestPage.getCurrentItemId();
    await expect(requestPage.modelPathText(modelName, savedItemId)).toBeVisible();
    newRequestTitle = `new-request-${getId()}`;
    await contentPage.createRequest(newRequestTitle);
    const newItemTitle = `new-item-${getId()}`;
    await requestPage.titleFieldInput(titleFieldName, "Title").click();
    await requestPage.titleFieldInput(titleFieldName, "Title").fill(newItemTitle);
    await requestPage.saveButton.click();
    await requestPage.closeNotification();
  });

  await test.step("Navigate to new request and verify item is linked", async () => {
    await requestPage.versionHistoryTab.click();
    await requestPage.requestTitleLink(newRequestTitle).click();
    await expect(requestPage.collapsedModelItemButton(modelName, savedItemId)).toBeVisible();
  });
});
