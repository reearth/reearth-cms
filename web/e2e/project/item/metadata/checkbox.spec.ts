import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { createModelFromOverview } from "@reearth-cms/e2e/project/utils/model";
import { createProject, deleteProject } from "@reearth-cms/e2e/project/utils/project";
import { expect, test } from "@reearth-cms/e2e/utils";

test.beforeEach(async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
  await createModelFromOverview(page);
});

test.afterEach(async ({ page }) => {
  await deleteProject(page);
});

test("Checkbox metadata creating and updating has succeeded", async ({ page }) => {
  await page.getByRole("tab", { name: "Meta Data" }).click();
  await page.getByRole("listitem").filter({ hasText: "Check Box" }).click();
  await page.getByLabel("Display name").fill("checkbox1");
  await page.getByLabel("Field Key").fill("checkbox1");
  await page.getByLabel("Description").fill("checkbox1 description");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);

  await expect(page.getByText("checkbox1#checkbox1")).toBeVisible();
  await page.getByRole("button", { name: "ellipsis" }).click();
  await expect(page.getByLabel("Display name")).toHaveValue("checkbox1");
  await expect(page.getByLabel("Field Key")).toHaveValue("checkbox1");
  await expect(page.getByLabel("Description")).toHaveValue("checkbox1 description");
  await expect(page.getByLabel("Support multiple values")).not.toBeChecked();
  await expect(page.getByLabel("Use as title")).toBeHidden();

  await page.getByRole("tab", { name: "Validation" }).click();
  await expect(page.getByLabel("Make field required")).toBeDisabled();
  await expect(page.getByLabel("Set field as unique")).toBeDisabled();

  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByLabel("Set default value")).not.toBeChecked();

  await page.getByRole("button", { name: "Cancel" }).click();
  await page.getByRole("menuitem", { name: "Content" }).click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.getByRole("checkbox", { name: "checkbox1" })).toBeVisible();
  await expect(page.getByText("checkbox1 description")).toBeVisible();

  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await expect(page.getByRole("heading", { name: "Item Information" })).toBeVisible();
  await expect(page.getByRole("checkbox", { name: "checkbox1" })).not.toBeChecked();

  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByRole("cell").getByRole("checkbox").last()).not.toBeChecked();

  await page.getByRole("cell").getByLabel("edit").locator("svg").click();
  await expect(page.getByRole("heading", { name: "Item Information" })).toBeVisible();
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(800);
  await page.getByRole("checkbox").check();
  await closeNotification(page);
  await expect(page.getByRole("checkbox")).toBeChecked();

  await page.getByRole("button", { name: "Back" }).click();
  await page.getByRole("cell").getByRole("checkbox", { checked: true }).last().uncheck();
  await closeNotification(page);
  await expect(
    page.getByRole("cell").getByRole("checkbox", { checked: false }).last(),
  ).not.toBeChecked();

  await page.getByRole("cell").getByLabel("edit").locator("svg").click();
  await expect(page.getByRole("checkbox")).not.toBeChecked();
});

test("Checkbox metadata editing has succeeded", async ({ page }) => {
  await page.getByRole("tab", { name: "Meta Data" }).click();
  await page.getByRole("listitem").filter({ hasText: "Check Box" }).click();
  await page.getByLabel("Display name").fill("checkbox1");
  await page.getByLabel("Field Key").fill("checkbox1");
  await page.getByLabel("Description").fill("checkbox1 description");
  await page.getByRole("tab", { name: "Default value" }).click();
  await page.getByLabel("Set default value").check();
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);

  await page.getByRole("menuitem", { name: "Content" }).click();
  await expect(page.getByRole("columnheader", { name: "checkbox1 edit" })).toBeVisible();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await expect(page.getByLabel("checkbox1")).toBeChecked();

  await page.getByLabel("Back").click();
  await expect(page.getByRole("cell").getByRole("checkbox").last()).toBeChecked();

  await page.getByRole("menuitem", { name: "Schema" }).click();
  await page.getByRole("tab", { name: "Meta Data" }).click();
  await page.getByRole("button", { name: "ellipsis" }).click();
  await page.getByLabel("Display name").fill("new checkbox1");
  await page.getByLabel("Field Key").fill("new-checkbox1");
  await page.getByLabel("Description").fill("new checkbox1 description");
  await page.getByLabel("Support multiple values").check();
  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByRole("checkbox")).toBeChecked();
  await page.getByRole("button", { name: "plus New" }).click();
  await expect(page.getByRole("checkbox").nth(1)).not.toBeChecked();
  await page.getByRole("checkbox").nth(1).check();
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await expect(page.getByText("new checkbox1")).toBeVisible();
  await expect(page.getByText("#new-checkbox1")).toBeVisible();

  await page.getByRole("menuitem", { name: "Content" }).click();
  await expect(page.getByRole("columnheader", { name: "new checkbox1 edit" })).toBeVisible();
  await expect(page.getByRole("cell").getByRole("checkbox").last()).toBeChecked();

  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.getByText("new checkbox1", { exact: true })).toBeVisible();
  await expect(page.getByText("new checkbox1 description")).toBeVisible();
  await expect(page.getByRole("checkbox").nth(0)).toBeChecked();
  await expect(page.getByRole("checkbox").nth(1)).toBeChecked();

  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await expect(page.getByRole("checkbox").nth(0)).toBeChecked();
  await expect(page.getByRole("checkbox").nth(1)).toBeChecked();

  await page.getByRole("button", { name: "Back" }).click();
  await page.getByRole("button", { name: "x2" }).click();
  await expect(page.getByRole("tooltip").getByRole("checkbox").nth(0)).toBeChecked();
  await expect(page.getByRole("tooltip").getByRole("checkbox").nth(1)).toBeChecked();

  await page.getByRole("tooltip").getByRole("checkbox").nth(0).uncheck();
  await closeNotification(page);
  await page.getByRole("cell").getByLabel("edit").locator("svg").first().click();
  await expect(page.getByRole("checkbox").nth(0)).not.toBeChecked();
  await expect(page.getByRole("checkbox").nth(1)).toBeChecked();
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(800);
  await page.getByRole("button", { name: "plus New" }).click();
  await closeNotification(page);
  await expect(page.getByRole("checkbox").nth(0)).not.toBeChecked();
  await expect(page.getByRole("checkbox").nth(1)).toBeChecked();
  await expect(page.getByRole("checkbox").nth(2)).not.toBeChecked();

  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "x3" }).click();
  await expect(page.getByRole("tooltip").getByRole("checkbox").nth(0)).not.toBeChecked();
  await expect(page.getByRole("tooltip").getByRole("checkbox").nth(1)).toBeChecked();
  await expect(page.getByRole("tooltip").getByRole("checkbox").nth(2)).not.toBeChecked();
});
