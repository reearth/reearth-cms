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

test("Date metadata creating and updating has succeeded", async ({ page }) => {
  await page.getByRole("tab", { name: "Meta Data" }).click();
  await page.locator("li").filter({ hasText: "Date" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("date1");
  await page.getByLabel("Settings").locator("#key").click();
  await page.getByLabel("Settings").locator("#key").fill("date1");
  await page.getByLabel("Settings").locator("#description").click();
  await page.getByLabel("Settings").locator("#description").fill("date1 description");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);

  await expect(page.getByText("date1#date1")).toBeVisible();
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  await expect(page.getByLabel("Display name")).toBeVisible();
  await expect(page.getByLabel("Display name")).toHaveValue("date1");
  await expect(page.getByLabel("Settings").locator("#key")).toHaveValue("date1");
  await expect(page.getByLabel("Settings").locator("#description")).toHaveValue(
    "date1 description",
  );
  await expect(page.getByLabel("Support multiple values")).not.toBeChecked();
  await expect(page.getByLabel("Use as title")).toBeHidden();
  await page.getByRole("tab", { name: "Validation" }).click();
  await expect(page.getByLabel("Make field required")).not.toBeChecked();
  await expect(page.getByLabel("Set field as unique")).not.toBeChecked();
  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByPlaceholder("Select date")).toBeEmpty();
  await page.getByRole("button", { name: "Cancel" }).click();

  await page.getByText("Content").click();
  await expect(page.getByLabel("edit").locator("svg")).toBeVisible();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.locator("label")).toContainText("date1");
  await expect(page.getByRole("main")).toContainText("date1 description");
  await page.getByPlaceholder("Select date").click();
  await page.getByPlaceholder("Select date").fill("2024-01-01");
  await page.getByPlaceholder("Select date").press("Enter");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await expect(page.getByPlaceholder("Select date")).toHaveValue("2024-01-01");
  await page.getByLabel("Back").click();
  await expect(page.getByPlaceholder("-")).toHaveValue("2024-01-01");
  await page.getByRole("cell").getByLabel("edit").locator("svg").click();
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(500);
  await page.getByPlaceholder("Select date").click();
  await page.getByPlaceholder("Select date").fill("2024-01-02");
  await page.getByPlaceholder("Select date").press("Enter");
  await closeNotification(page);
  await expect(page.getByPlaceholder("Select date")).toHaveValue("2024-01-02");
  await page.getByLabel("Back").click();
  await expect(page.getByPlaceholder("-")).toHaveValue("2024-01-02");
  await page.getByPlaceholder("-").click();
  await page.getByPlaceholder("-").fill("2024-01-03");
  await page.getByPlaceholder("-").press("Enter");
  await closeNotification(page);
  await expect(page.getByPlaceholder("-")).toHaveValue("2024-01-03");
  await page.getByRole("cell").getByLabel("edit").locator("svg").click();
  await expect(page.getByPlaceholder("Select date")).toHaveValue("2024-01-03");
});

test("Date metadata editing has succeeded", async ({ page }) => {
  test.slow();
  await page.getByRole("tab", { name: "Meta Data" }).click();
  await page.locator("li").filter({ hasText: "Date" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("date1");
  await page.getByLabel("Settings").locator("#key").click();
  await page.getByLabel("Settings").locator("#key").fill("date1");
  await page.getByLabel("Settings").locator("#description").click();
  await page.getByLabel("Settings").locator("#description").fill("date1 description");
  await page.getByRole("tab", { name: "Default value" }).click();
  await page.getByPlaceholder("Select date").click();
  await page.getByPlaceholder("Select date").fill("2024-01-01");
  await page.getByPlaceholder("Select date").press("Enter");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);

  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("date1");
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.getByPlaceholder("Select date")).toHaveValue("2024-01-01");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await expect(page.getByPlaceholder("Select date")).toHaveValue("2024-01-01");
  await page.getByLabel("Back").click();
  await expect(page.getByPlaceholder("-")).toHaveValue("2024-01-01");

  await page.getByText("Schema").click();
  await page.getByRole("tab", { name: "Meta Data" }).click();
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("new date1");
  await page.getByLabel("Field Key").click();
  await page.getByLabel("Field Key").fill("new-date1");
  await page.getByLabel("Description(optional)").click();
  await page.getByLabel("Description(optional)").fill("new date1 description");
  await page.getByLabel("Support multiple values").check();
  await page.getByRole("tab", { name: "Validation" }).click();
  await page.getByLabel("Make field required").check();
  await page.getByLabel("Set field as unique").check();
  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByPlaceholder("Select date")).toHaveValue("2024-01-01");
  await page.getByRole("button", { name: "plus New" }).click();
  await page.getByRole("textbox").nth(1).click();
  await page.getByRole("textbox").nth(1).fill("2024-01-02");
  await page.getByRole("textbox").nth(1).press("Enter");
  await page.getByRole("button", { name: "plus New" }).click();
  await page.getByRole("textbox").nth(2).click();
  await page.getByRole("textbox").nth(2).fill("2024-01-03");
  await page.getByRole("textbox").nth(2).press("Enter");
  await page.getByRole("button", { name: "arrow-down" }).nth(1).click();
  await expect(page.getByRole("textbox").nth(1)).toHaveValue("2024-01-03");
  await expect(page.getByRole("textbox").nth(2)).toHaveValue("2024-01-02");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await expect(page.getByText("new date1 *#new-date1(unique)")).toBeVisible();

  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("new date1");
  await expect(page.getByPlaceholder("-")).toHaveValue("2024-01-01");
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.getByText("new date1(unique)")).toBeVisible();
  await expect(page.getByText("new date1 description")).toBeVisible();

  await expect(page.getByRole("textbox").nth(0)).toHaveValue("2024-01-01");
  await expect(page.getByRole("textbox").nth(1)).toHaveValue("2024-01-03");
  await expect(page.getByRole("textbox").nth(2)).toHaveValue("2024-01-02");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);

  await expect(page.getByRole("textbox").nth(0)).toHaveValue("2024-01-01");
  await expect(page.getByRole("textbox").nth(1)).toHaveValue("2024-01-03");
  await expect(page.getByRole("textbox").nth(2)).toHaveValue("2024-01-02");
  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "x3" }).click();
  await expect(page.getByRole("tooltip").getByRole("textbox").nth(0)).toHaveValue("2024-01-01");
  await expect(page.getByRole("tooltip").getByRole("textbox").nth(1)).toHaveValue("2024-01-03");
  await expect(page.getByRole("tooltip").getByRole("textbox").nth(2)).toHaveValue("2024-01-02");
  await page.getByRole("tooltip").getByRole("textbox").nth(1).click();
  await page.getByRole("tooltip").getByRole("textbox").nth(1).fill("2024-01-04");
  await page.getByRole("tooltip").getByRole("textbox").nth(1).press("Enter");
  await closeNotification(page);
  await page.getByRole("cell").getByLabel("edit").locator("svg").first().click();
  await expect(page.getByRole("textbox").nth(0)).toHaveValue("2024-01-01");
  await expect(page.getByRole("textbox").nth(1)).toHaveValue("2024-01-04");
  await expect(page.getByRole("textbox").nth(2)).toHaveValue("2024-01-02");
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: "plus New" }).click();
  await page.getByRole("textbox").nth(3).click();
  await page.getByRole("textbox").nth(3).fill("2024-01-05");
  await page.getByRole("textbox").nth(3).press("Enter");
  await closeNotification(page);
  await page.getByRole("button", { name: "plus New" }).click();
  await page.getByRole("textbox").nth(4).click();
  await page.getByRole("textbox").nth(4).fill("2024-01-06");
  await page.getByRole("textbox").nth(4).press("Enter");
  await closeNotification(page);
  await page.getByRole("button", { name: "delete" }).first().click();
  await closeNotification(page);
  await page.getByRole("button", { name: "plus New" }).click();
  await page.getByRole("textbox").nth(4).click();
  await page.getByRole("textbox").nth(4).fill("2024-01-07");
  await page.getByRole("textbox").nth(4).press("Enter");
  await closeNotification(page);
  await page.getByRole("button", { name: "close-circle" }).nth(4).click();
  await closeNotification(page);
  await expect(page.getByRole("textbox").nth(0)).toHaveValue("2024-01-04");
  await expect(page.getByRole("textbox").nth(1)).toHaveValue("2024-01-02");
  await expect(page.getByRole("textbox").nth(2)).toHaveValue("2024-01-05");
  await expect(page.getByRole("textbox").nth(3)).toHaveValue("2024-01-06");
  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "x4" }).click();
  await expect(page.getByRole("tooltip").getByRole("textbox").nth(0)).toHaveValue("2024-01-04");
  await expect(page.getByRole("tooltip").getByRole("textbox").nth(1)).toHaveValue("2024-01-02");
  await expect(page.getByRole("tooltip").getByRole("textbox").nth(2)).toHaveValue("2024-01-05");
  await expect(page.getByRole("tooltip").getByRole("textbox").nth(3)).toHaveValue("2024-01-06");
});
