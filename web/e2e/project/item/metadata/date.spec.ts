import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { createModelFromOverview } from "@reearth-cms/e2e/project/utils/model";
import { createProject, deleteProject } from "@reearth-cms/e2e/project/utils/project";

test.beforeEach(async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
  await createModelFromOverview(page);
});

test.afterEach(async ({ page }) => {
  await deleteProject(page);
});

test("Date metadata creating and updating has succeeded", async ({ page }) => {
  await page.getByRole("tab", { name: "Meta Data" }).click();
  await page.getByRole("listitem").filter({ hasText: "Date" }).click();
  await page.getByLabel("Display name").fill("date1");
  await page.getByLabel("Field Key").fill("date1");
  await page.getByLabel("Description").fill("date1 description");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await expect(page.getByText("date1#date1")).toBeVisible();

  await page.getByRole("button", { name: "ellipsis" }).click();
  await expect(page.getByLabel("Display name")).toHaveValue("date1");
  await expect(page.getByLabel("Field Key")).toHaveValue("date1");
  await expect(page.getByLabel("Description")).toHaveValue("date1 description");
  await expect(page.getByLabel("Support multiple values")).not.toBeChecked();
  await expect(page.getByLabel("Use as title")).toBeHidden();

  await page.getByRole("tab", { name: "Validation" }).click();
  await expect(page.getByLabel("Make field required")).not.toBeChecked();
  await expect(page.getByLabel("Set field as unique")).not.toBeChecked();

  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByPlaceholder("Select date")).toBeEmpty();

  await page.getByRole("button", { name: "Cancel" }).click();
  await page.getByRole("menuitem", { name: "Content" }).click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.getByLabel("date1")).toBeVisible();
  await expect(page.getByText("date1 description")).toBeVisible();

  await page.getByLabel("date1").fill("2024-01-01");
  await page.getByLabel("date1").press("Enter");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await expect(page.getByRole("heading", { name: "Item Information" })).toBeVisible();
  await expect(page.getByLabel("date1")).toHaveValue("2024-01-01");

  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByRole("textbox")).toHaveValue("2024-01-01");
  await page.getByRole("textbox").fill("2024-01-02");
  await page.getByRole("textbox").press("Enter");
  await closeNotification(page);
  await expect(page.getByRole("textbox")).toHaveValue("2024-01-02");

  await page.getByRole("cell").getByLabel("edit").locator("svg").click();
  await expect(page.getByLabel("date1")).toHaveValue("2024-01-02");

  await page.getByLabel("date1").fill("2024-01-03");
  await page.getByLabel("date1").press("Enter");
  await closeNotification(page);
  await expect(page.getByLabel("date1")).toHaveValue("2024-01-03");

  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByRole("textbox")).toHaveValue("2024-01-03");
});

test("Date metadata editing has succeeded", async ({ page }) => {
  test.slow();
  await page.getByRole("tab", { name: "Meta Data" }).click();
  await page.getByRole("listitem").filter({ hasText: "Date" }).click();
  await page.getByLabel("Display name").fill("date1");
  await page.getByLabel("Field Key").fill("date1");
  await page.getByLabel("Description").fill("date1 description");
  await page.getByRole("tab", { name: "Default value" }).click();
  await page.getByLabel("Set default value").fill("2024-01-01");
  await page.getByPlaceholder("Select date").press("Enter");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);

  await page.getByRole("menuitem", { name: "Content" }).click();
  await expect(page.getByRole("columnheader", { name: "date1 edit" })).toBeVisible();

  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.getByLabel("date1")).toHaveValue("2024-01-01");

  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByRole("menuitem", { name: "Schema" }).click();
  await page.getByRole("tab", { name: "Meta Data" }).click();
  await page.getByRole("button", { name: "ellipsis" }).click();
  await page.getByLabel("Display name").fill("new date1");
  await page.getByLabel("Field Key").fill("new-date1");
  await page.getByLabel("Description").fill("new date1 description");
  await page.getByLabel("Support multiple values").check();
  await page.getByRole("tab", { name: "Validation" }).click();
  await page.getByLabel("Make field required").check();
  await page.getByLabel("Set field as unique").check();
  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByRole("textbox")).toHaveValue("2024-01-01");

  await page.getByRole("button", { name: "plus New" }).click();
  await page.getByRole("textbox").nth(1).fill("2024-01-02");
  await page.getByRole("textbox").nth(1).press("Enter");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await expect(page.getByText("new date1 *#new-date1(unique)")).toBeVisible();

  await page.getByRole("menuitem", { name: "Content" }).click();
  await expect(page.getByRole("columnheader", { name: "new date1 edit" })).toBeVisible();
  await expect(page.getByRole("textbox")).toHaveValue("2024-01-01");

  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.getByText("new date1(unique)")).toBeVisible();
  await expect(page.getByText("new date1 description")).toBeVisible();
  await expect(page.getByRole("textbox").nth(0)).toHaveValue("2024-01-01");
  await expect(page.getByRole("textbox").nth(1)).toHaveValue("2024-01-02");

  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await expect(page.getByRole("textbox").nth(0)).toHaveValue("2024-01-01");
  await expect(page.getByRole("textbox").nth(1)).toHaveValue("2024-01-02");

  await page.getByRole("button", { name: "Back" }).click();
  await page.getByRole("button", { name: "x2" }).click();
  await expect(page.getByRole("tooltip").getByRole("textbox").nth(0)).toHaveValue("2024-01-01");
  await expect(page.getByRole("tooltip").getByRole("textbox").nth(1)).toHaveValue("2024-01-02");

  await page.getByRole("tooltip").getByRole("textbox").nth(1).fill("2024-01-03");
  await page.getByRole("tooltip").getByRole("textbox").nth(1).press("Enter");
  await closeNotification(page);
  await page.getByRole("cell").getByLabel("edit").locator("svg").first().click();
  await expect(page.getByRole("textbox").nth(0)).toHaveValue("2024-01-01");
  await expect(page.getByRole("textbox").nth(1)).toHaveValue("2024-01-03");
  await page.getByRole("button", { name: "plus New" }).click();
  await page.getByRole("textbox").last().fill("2024-01-02");
  await page.getByRole("textbox").last().press("Enter");
  await closeNotification(page);

  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "x3" }).click();
  await expect(page.getByRole("tooltip").getByRole("textbox").nth(0)).toHaveValue("2024-01-01");
  await expect(page.getByRole("tooltip").getByRole("textbox").nth(1)).toHaveValue("2024-01-03");
  await expect(page.getByRole("tooltip").getByRole("textbox").nth(2)).toHaveValue("2024-01-02");
});
