import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { createGroup } from "@reearth-cms/e2e/project/utils/group";
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

test("Group field creating and updating has succeeded", async ({ page }) => {
  test.slow();
  await expect(page.locator("li").getByText("Reference", { exact: true })).toBeVisible();
  await expect(page.locator("li").getByText("Group", { exact: true })).toBeVisible();

  await createGroup(page);
  await expect(page.locator("li").getByText("Reference", { exact: true })).toBeHidden();
  await expect(page.locator("li").getByText("Group", { exact: true })).toBeHidden();
  await page.locator("li").filter({ hasText: "Text" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("text1");
  await page.getByLabel("Settings").locator("#key").click();
  await page.getByLabel("Settings").locator("#key").fill("text1");
  await page.getByLabel("Settings").locator("#description").click();
  await page.getByLabel("Settings").locator("#description").fill("text1 description");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await expect(page.getByText("text1#text1")).toBeVisible();

  await page.getByText("e2e model name").click();
  await page.locator("li").getByText("Group", { exact: true }).click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("group1");
  await page.getByLabel("Settings").locator("#key").click();
  await page.getByLabel("Settings").locator("#key").fill("group1");
  await page.getByLabel("Settings").locator("#description").click();
  await page.getByLabel("Settings").locator("#description").fill("group1 description");
  await page.locator(".ant-select-selector").click();
  await page.getByText("e2e group name #e2e-group-key").click();
  await expect(page.getByLabel("Settings")).toContainText("e2e group name #e2e-group-key");
  await page.getByRole("tab", { name: "Validation" }).click();
  await expect(
    page.locator("label").filter({ hasText: "Make field required" }).locator("span").nth(1),
  ).toBeDisabled();
  await expect(
    page.locator("label").filter({ hasText: "Set field as unique" }).locator("span").nth(1),
  ).toBeDisabled();
  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByLabel("Set default value")).toBeDisabled();
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await expect(page.getByLabel("Fields").getByRole("paragraph")).toContainText("group1#group1");
  await page.getByText("Content").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.locator("label").first()).toContainText("group1");
  await expect(page.getByRole("main")).toContainText("group1 description");

  await page.getByLabel("text1").click();
  await page.getByLabel("text1").fill("text1");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  // TO DO: check if the group field shows correctly

  await page.getByRole("cell").getByLabel("edit").locator("svg").click();
  await expect(page.getByLabel("text1")).toHaveValue("text1");
  await page.getByLabel("text1").click();
  await page.getByLabel("text1").fill("new text1");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.locator("span").filter({ hasText: "Schema" }).click();
  await page.getByRole("tab", { name: "Meta Data" }).click();
  await page.getByRole("menuitem", { name: "e2e group name" }).locator("span").click();
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("new text1");
  await page.getByLabel("Field Key").click();
  await page.getByLabel("Field Key").fill("new-text1");
  await page.getByLabel("Description(optional)").click();
  await page.getByLabel("Description(optional)").fill("new text1 description");
  await page.getByLabel("Support multiple values").check();
  await page.getByLabel("Use as title").check();
  await page.getByRole("tab", { name: "Validation" }).click();
  await page.getByLabel("Set maximum length").click();
  await page.getByLabel("Set maximum length").fill("5");
  await page.getByLabel("Make field required").check();
  await page.getByLabel("Set field as unique").check();
  await page.getByRole("tab", { name: "Default value" }).click();
  await page.getByRole("button", { name: "plus New" }).click();
  await page.getByLabel("Set default value").click();
  await page.getByLabel("Set default value").fill("text12");
  await expect(page.getByRole("button", { name: "OK" })).toBeDisabled();
  await page.getByLabel("Set default value").click();
  await page.getByLabel("Set default value").fill("text1");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await page.getByText("Content").click();
  await page.getByText("e2e model name").click();
  await page.getByRole("cell").getByLabel("edit").locator("svg").click();
  await expect(page.getByRole("main")).toContainText("new text1(unique)");
  await expect(page.getByRole("main")).toContainText("new text1 description");
  await expect(page.getByRole("textbox")).toHaveValue("new text1");
  await expect(page.getByText("/ 5")).toBeVisible();
  await expect(page.getByRole("button", { name: "Save" })).toBeDisabled();
  await page.getByRole("textbox").click();
  await page.getByRole("textbox").fill("text1");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await page.getByRole("cell").getByLabel("edit").locator("svg").click();
  await expect(page.getByRole("textbox")).toHaveValue("text1");
  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.getByRole("textbox")).toHaveValue("text1");
  await page.getByRole("button", { name: "plus New" }).click();
  await page
    .locator("div")
    .filter({ hasText: /^0 \/ 5$/ })
    .getByRole("textbox")
    .click();
  await page
    .locator("div")
    .filter({ hasText: /^0 \/ 5$/ })
    .getByRole("textbox")
    .fill("text2");
  await page.getByRole("button", { name: "plus New" }).click();
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await page.getByRole("cell").getByLabel("edit").locator("svg").first().click();
  await expect(page.getByRole("textbox").nth(0)).toHaveValue("text1");
  await expect(page.getByRole("textbox").nth(1)).toHaveValue("text2");
  await page.getByRole("button", { name: "arrow-down" }).first().click();
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await page.getByRole("cell").getByLabel("edit").locator("svg").first().click();
  await expect(page.getByRole("textbox").nth(0)).toHaveValue("text2");
  await expect(page.getByRole("textbox").nth(1)).toHaveValue("text1");
});

test("Group field editing has succeeded", async ({ page }) => {
  test.slow();
  await expect(page.locator("li").getByText("Reference", { exact: true })).toBeVisible();
  await expect(page.locator("li").getByText("Group", { exact: true })).toBeVisible();

  await createGroup(page);
  await expect(page.locator("li").getByText("Reference", { exact: true })).toBeHidden();
  await expect(page.locator("li").getByText("Group", { exact: true })).toBeHidden();
  await page.locator("li").filter({ hasText: "Text" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("text1");
  await page.getByLabel("Settings").locator("#key").click();
  await page.getByLabel("Settings").locator("#key").fill("text1");
  await page.getByLabel("Settings").locator("#description").click();
  await page.getByLabel("Settings").locator("#description").fill("text1 description");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await expect(page.getByText("text1#text1")).toBeVisible();

  await page.getByText("e2e model name").click();
  await page.locator("li").getByText("Group", { exact: true }).click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("group1");
  await page.getByLabel("Settings").locator("#key").click();
  await page.getByLabel("Settings").locator("#key").fill("group1");
  await page.getByLabel("Settings").locator("#description").click();
  await page.getByLabel("Settings").locator("#description").fill("group1 description");
  await page.locator(".ant-select-selector").click();
  await page.getByText("e2e group name #e2e-group-key").click();
  await expect(page.getByLabel("Settings")).toContainText("e2e group name #e2e-group-key");
  await page.getByRole("tab", { name: "Validation" }).click();
  await expect(
    page.locator("label").filter({ hasText: "Make field required" }).locator("span").nth(1),
  ).toBeDisabled();
  await expect(
    page.locator("label").filter({ hasText: "Set field as unique" }).locator("span").nth(1),
  ).toBeDisabled();
  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByLabel("Set default value")).toBeDisabled();
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await expect(page.getByLabel("Fields").getByRole("paragraph")).toContainText("group1#group1");
  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("group1");
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.locator("label").first()).toContainText("group1");
  await expect(page.getByRole("main")).toContainText("group1 description");

  await page.getByLabel("text1").click();
  await page.getByLabel("text1").fill("text1");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);

  await page.getByText("Schema").click();
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("new group1");
  await page.getByLabel("Field Key").click();
  await page.getByLabel("Field Key").fill("new-group1");
  await page.getByLabel("Description(optional)").click();
  await page.getByLabel("Description(optional)").fill("new group1 description");
  await page.getByLabel("Support multiple values").check();
  await expect(page.getByLabel("Use as title")).toBeHidden();
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("new group1");
  await page.getByRole("cell").getByLabel("edit").locator("svg").click();
  await expect(page.getByRole("main")).toContainText("new group1");
  await expect(page.getByRole("main")).toContainText("new group1 (1)");
  await expect(page.getByRole("main")).toContainText("new group1 description");
  await expect(page.getByLabel("text1")).toHaveValue("text1");
  await page.getByRole("button", { name: "plus New" }).click();
  await expect(page.getByRole("main")).toContainText("new group1 (2)");
  await page
    .locator("div")
    .filter({ hasText: /^0text1 description$/ })
    .getByLabel("text1")
    .click();
  await page
    .locator("div")
    .filter({ hasText: /^0text1 description$/ })
    .getByLabel("text1")
    .fill("text1-2");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await page.getByRole("cell").getByLabel("edit").locator("svg").click();
  await expect(
    page
      .locator("div")
      .filter({ hasText: /^5text1 description$/ })
      .getByLabel("text1"),
  ).toHaveValue("text1");
  await expect(
    page
      .locator("div")
      .filter({ hasText: /^7text1 description$/ })
      .getByLabel("text1"),
  ).toHaveValue("text1-2");
  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByRole("button", { name: "plus New" }).click();
  await page.getByLabel("text1").click();
  await page.getByLabel("text1").fill("text1");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await page.getByRole("cell").getByLabel("edit").locator("svg").first().click();
  await expect(page.getByLabel("text1")).toHaveValue("text1");

  await page.locator("span").filter({ hasText: "Schema" }).click();
  await page.getByRole("menuitem", { name: "e2e group name" }).locator("span").click();
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  await page.getByLabel("Support multiple values").check();
  await page.getByRole("tab", { name: "Default value" }).click();
  await page.getByRole("button", { name: "plus New" }).click();
  await page.locator("#defaultValue").nth(0).click();
  await page.locator("#defaultValue").nth(0).fill("text1");
  await page.getByRole("button", { name: "plus New" }).click();
  await page.locator("#defaultValue").nth(1).click();
  await page.locator("#defaultValue").nth(1).fill("text2");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);

  await page.getByText("Content").click();
  await page.getByText("e2e model name").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByRole("button", { name: "plus New" }).click();
  await expect(page.getByRole("textbox").nth(0)).toHaveValue("text1");
  await expect(page.getByRole("textbox").nth(1)).toHaveValue("text2");
  await page.getByRole("button", { name: "plus New" }).nth(1).click();
  await expect(page.getByRole("textbox").nth(2)).toHaveValue("text1");
  await expect(page.getByRole("textbox").nth(3)).toHaveValue("text2");
  await page.getByRole("button", { name: "arrow-down" }).nth(3).click();
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await page.getByRole("cell").getByLabel("edit").locator("svg").first().click();
  await expect(page.getByRole("textbox").nth(0)).toHaveValue("text1");
  await expect(page.getByRole("textbox").nth(1)).toHaveValue("text2");
  await expect(page.getByRole("textbox").nth(2)).toHaveValue("text2");
  await expect(page.getByRole("textbox").nth(3)).toHaveValue("text1");
});
