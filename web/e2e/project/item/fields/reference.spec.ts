import { closeNotification } from "@reearth-cms/e2e/common/notification";
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

test("One-way reference field creating and updating has succeeded", async ({ page }) => {
  test.slow();
  await page.getByRole("button", { name: "plus Add" }).first().click();
  await page.getByLabel("Model name").click();
  await page.getByLabel("Model name").fill("ref model");
  await page.getByLabel("Model key").click();
  await page.getByLabel("Model key").fill("ref-model");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await page.locator("li").filter({ hasText: "Text" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("text");
  await page.getByLabel("Use as title").check();
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await page.getByRole("tab", { name: "Meta Data" }).click();
  await page.locator("li").filter({ hasText: "Boolean" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("boolean");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await page.getByText("Content").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByLabel("text").click();
  await page.getByLabel("text").fill("text1");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByLabel("text").click();
  await page.getByLabel("text").fill("text2");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByText("Schema").click();
  await page.getByText("e2e model name").click();
  await page.locator("li").filter({ hasText: "Reference" }).locator("div").first().click();
  await page.getByLabel("Select the model to reference").click();
  await expect(page.getByText("e2e model name #e2e-model-key")).toBeVisible();
  await expect(page.getByText("ref model #ref-model")).toBeVisible();

  await page.getByText("ref model #ref-model").click();
  await expect(
    page.getByLabel("Create Reference Field").getByText("ref model #ref-model"),
  ).toBeVisible();

  await expect(page.getByLabel("One-way reference")).toBeChecked();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("button", { name: "Confirm" })).toBeDisabled();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("ref");
  await expect(page.getByRole("button", { name: "Confirm" })).toBeEnabled();
  await page.getByLabel("Description(optional)").click();
  await page.getByLabel("Description(optional)").fill("ref description");
  await expect(
    page.locator("label").filter({ hasText: "Support multiple values" }).locator("span").nth(1),
  ).toBeDisabled();
  await expect(page.getByLabel("Use as title")).toBeHidden();
  await page.getByRole("tab", { name: "Validation" }).click();
  await page.getByLabel("Make field required").check();
  await page.getByLabel("Set field as unique").check();
  await page.getByRole("button", { name: "Confirm" }).click();
  await closeNotification(page);
  await expect(page.getByLabel("Fields").getByRole("paragraph")).toContainText("ref *#ref(unique)");
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  await expect(page.getByText("ref model #ref-model")).toBeVisible();
  await expect(page.getByLabel("Select the model to reference")).toBeDisabled();
  await expect(
    page.locator("label").filter({ hasText: "One-way reference" }).locator("span").first(),
  ).toBeDisabled();
  await expect(
    page.locator("label").filter({ hasText: "Two-way reference" }).locator("span").first(),
  ).toBeDisabled();
  await expect(page.getByRole("button", { name: "Next" })).toBeEnabled();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("button", { name: "Confirm" })).toBeDisabled();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("reff");
  await expect(page.getByRole("button", { name: "Confirm" })).toBeEnabled();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("ref");
  await expect(page.getByRole("button", { name: "Confirm" })).toBeDisabled();
  await page.getByLabel("Close", { exact: true }).first().click();
  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("ref");
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.locator("p").filter({ hasText: "ref(unique)" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Refer to item" })).toBeVisible();
  await expect(page.getByText("ref description")).toBeVisible();

  await page.getByRole("button", { name: "Refer to item" }).click();
  await expect(page.locator("tbody > tr:visible")).toHaveCount(2);

  await expect(page.getByText("text1")).toBeVisible();
  await expect(page.getByText("text2")).toBeVisible();
  await page.getByPlaceholder("input search text").click();
  await page.getByPlaceholder("input search text").fill("1");
  await page.getByRole("button", { name: "search" }).click();
  await expect(page.getByText("text1")).toBeVisible();
  await expect(page.getByText("text2")).toBeHidden();
  await page.getByRole("row").getByRole("button").nth(0).hover();
  await page.getByRole("row").getByRole("button").nth(0).click();
  await expect(page.locator("#root").getByText("text1")).toBeVisible();
  await page.getByRole("button").nth(3).click();
  await expect(page.locator("#root").getByText("text1")).toBeHidden();
  await page.getByRole("button", { name: "Refer to item" }).click();
  await expect(page.getByText("text1")).toBeVisible();
  await expect(page.getByText("text2")).toBeVisible();
  await page.getByRole("row").getByRole("button").nth(0).hover();
  await page.getByRole("row").getByRole("button").nth(0).click();
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await expect(page.getByRole("cell", { name: "text1" }).locator("span").first()).toBeVisible();
  await page.getByRole("cell").getByLabel("edit").locator("svg").click();
  await expect(page.locator("#root").getByText("text1")).toBeVisible();
  await page.getByRole("button", { name: "Replace item" }).click();
  await page.getByRole("row").getByRole("button").nth(1).hover();
  await page.getByRole("row").getByRole("button").nth(1).click();
  await expect(page.locator("#root").getByText("text2")).toBeVisible();
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await expect(page.getByRole("cell", { name: "text2" }).locator("span").first()).toBeVisible();
});

test("Two-way reference field editing has succeeded", async ({ page }) => {
  test.slow();
  await page.getByRole("button", { name: "plus Add" }).first().click();
  await page.getByLabel("Model name").click();
  await page.getByLabel("Model name").fill("ref model");
  await page.getByLabel("Model key").click();
  await page.getByLabel("Model key").fill("ref-model");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await page.locator("li").filter({ hasText: "Text" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("text");
  await page.getByLabel("Use as title").check();
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await page.getByText("Content").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByLabel("text").click();
  await page.getByLabel("text").fill("reference text1");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByLabel("text").click();
  await page.getByLabel("text").fill("reference text2");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);

  await page.getByText("Schema").click();
  await page.getByText("e2e model name").click();
  await page.locator("li").filter({ hasText: "Text" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("text");
  await page.getByLabel("Use as title").check();
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await page.locator("li").filter({ hasText: "Reference" }).locator("div").first().click();
  await page.getByLabel("Select the model to reference").click();
  await page.getByText("ref model #ref-model").click();
  await page.getByLabel("Two-way reference").check();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("button", { name: "Next" })).toBeDisabled();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("ref1");
  await expect(page.getByRole("button", { name: "Next" })).toBeEnabled();
  await page.getByLabel("Description(optional)").click();
  await page.getByLabel("Description(optional)").fill("ref1 description");
  await expect(
    page.locator("label").filter({ hasText: "Support multiple values" }).locator("span").nth(1),
  ).toBeDisabled();
  await expect(page.getByLabel("Use as title")).toBeHidden();
  await page.getByRole("tab", { name: "Validation" }).click();
  await page.getByLabel("Make field required").check();
  await expect(
    page.locator("label").filter({ hasText: "Set field as unique" }).locator("span").nth(1),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Next" }).click();

  await expect(page.getByRole("button", { name: "Confirm" })).toBeDisabled();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("ref2");
  await expect(page.getByRole("button", { name: "Confirm" })).toBeEnabled();
  await page.getByLabel("Description(optional)").click();
  await page.getByLabel("Description(optional)").fill("ref2 description");
  await page.getByRole("tab", { name: "Validation" }).click();
  await page.getByLabel("Make field required").check();
  await page.getByRole("button", { name: "Previous" }).click();
  await expect(page.getByLabel("Display name")).toHaveValue("ref1");
  await expect(page.getByLabel("Field Key")).toHaveValue("ref1");
  await expect(page.getByLabel("Description(optional)")).toHaveValue("ref1 description");
  await page.getByRole("tab", { name: "Validation" }).click();
  await expect(page.getByLabel("Make field required")).toBeChecked();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByLabel("Display name")).toHaveValue("ref2");
  await expect(page.getByLabel("Field Key")).toHaveValue("ref2");
  await expect(page.getByLabel("Description(optional)")).toHaveValue("ref2 description");
  await page.getByRole("tab", { name: "Validation" }).click();
  await expect(page.getByLabel("Make field required")).toBeChecked();
  await page.getByRole("button", { name: "Confirm" }).click();
  await closeNotification(page);

  await expect(page.getByLabel("Fields")).toContainText("ref1 *#ref1");
  await page.locator("li").filter({ hasText: "ref1 *#ref1" }).locator("svg").nth(3).click();
  await expect(page.getByText("ref model #ref-model")).toBeVisible();
  await expect(page.getByLabel("Select the model to reference")).toBeDisabled();
  await expect(
    page.locator("label").filter({ hasText: "One-way reference" }).locator("span").first(),
  ).toBeDisabled();
  await expect(
    page.locator("label").filter({ hasText: "Two-way reference" }).locator("span").first(),
  ).toBeDisabled();
  await expect(page.getByRole("button", { name: "Next" })).toBeEnabled();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("button", { name: "Next" })).toBeEnabled();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("button", { name: "Confirm" })).toBeDisabled();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("reff");
  await expect(page.getByRole("button", { name: "Confirm" })).toBeEnabled();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("ref2");
  await expect(page.getByRole("button", { name: "Confirm" })).toBeDisabled();
  await page.getByRole("button", { name: "Previous" }).click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("reff");
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("button", { name: "Confirm" })).toBeEnabled();
  await page.getByRole("button", { name: "Previous" }).click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("ref1");
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("button", { name: "Confirm" })).toBeDisabled();
  await page.getByLabel("Close", { exact: true }).first().click();
  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("ref1");
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.locator("p").filter({ hasText: "ref1" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Refer to item" })).toBeVisible();
  await expect(page.getByText("ref1 description")).toBeVisible();
  await page.getByLabel("text").click();
  await page.getByLabel("text").fill("text1");
  await page.getByRole("button", { name: "Refer to item" }).click();
  await expect(page.getByText("reference text1")).toBeVisible();
  await expect(page.getByText("reference text2")).toBeVisible();
  await page.getByRole("row").getByRole("button").nth(0).hover();
  await page.getByRole("row").getByRole("button").nth(0).click();
  await expect(page.locator("#root").getByText("reference text1")).toBeVisible();
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();

  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByLabel("text").click();
  await page.getByLabel("text").fill("text2");
  await page.getByRole("button", { name: "Refer to item" }).click();
  await page.getByRole("row").getByRole("button").nth(1).hover();
  await page.getByRole("row").getByRole("button").nth(1).click();
  await expect(page.locator("#root").getByText("reference text2")).toBeVisible();
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();

  await expect(
    page.getByRole("cell", { name: "reference text1" }).locator("span").first(),
  ).toBeVisible();
  await expect(
    page.getByRole("cell", { name: "reference text2" }).locator("span").first(),
  ).toBeVisible();
  await page.getByText("ref model").click();
  await expect(page.locator("thead")).toContainText("ref2");
  await expect(
    page.getByRole("cell", { name: "text1", exact: true }).locator("span").first(),
  ).toBeVisible();
  await expect(
    page.getByRole("cell", { name: "text2", exact: true }).locator("span").first(),
  ).toBeVisible();
  await page.getByRole("cell").getByLabel("edit").locator("svg").first().click();
  await page.getByRole("button", { name: "Refer to item" }).click();
  await page.getByRole("row").getByRole("button").nth(0).hover();
  await page.getByRole("row").getByRole("button").nth(0).click();
  await page.getByRole("button", { name: "OK" }).click();
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await expect(
    page.getByRole("cell", { name: "text1", exact: true }).locator("span").first(),
  ).toBeVisible();
  await expect(
    page.getByRole("cell", { name: "text2", exact: true }).locator("span").first(),
  ).toBeHidden();

  await page.getByText("e2e model name").click();
  await expect(
    page.getByRole("cell", { name: "reference text1", exact: true }).locator("span").first(),
  ).toBeHidden();
  await expect(
    page.getByRole("cell", { name: "reference text2", exact: true }).locator("span").first(),
  ).toBeVisible();
});
