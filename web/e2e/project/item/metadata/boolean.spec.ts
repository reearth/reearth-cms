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

test("Boolean metadata creating and updating has succeeded", async ({ page }) => {
  await page.getByRole("tab", { name: "Meta Data" }).click();
  await page.getByRole("listitem").filter({ hasText: "Boolean" }).click();
  await page.getByLabel("Display name").fill("boolean1");
  await page.getByLabel("Field Key").fill("boolean1");
  await page.getByLabel("Description").fill("boolean1 description");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await expect(page.getByText("boolean1#boolean1")).toBeVisible();

  await page.getByRole("button", { name: "ellipsis" }).click();
  await expect(page.getByLabel("Display name")).toHaveValue("boolean1");
  await expect(page.getByLabel("Field Key")).toHaveValue("boolean1");
  await expect(page.getByLabel("Description")).toHaveValue("boolean1 description");
  await expect(page.getByLabel("Support multiple values")).not.toBeChecked();
  await expect(page.getByLabel("Use as title")).toBeHidden();

  await page.getByRole("tab", { name: "Validation" }).click();
  await expect(page.getByLabel("Make field required")).toBeDisabled();
  await expect(page.getByLabel("Set field as unique")).toBeDisabled();

  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByLabel("Set default value")).toHaveAttribute("aria-checked", "false");

  await page.getByRole("button", { name: "Cancel" }).click();
  await page.getByRole("menuitem", { name: "Content" }).click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.getByLabel("boolean1")).toBeVisible();
  await expect(page.getByText("boolean1 description")).toBeVisible();

  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await expect(page.getByRole("heading", { name: "Item Information" })).toBeVisible();
  await expect(page.getByLabel("boolean1")).toHaveAttribute("aria-checked", "false");

  await page.getByRole("button", { name: "Back" }).click();
  await page.getByRole("switch", { name: "close" }).click();
  await closeNotification(page);
  await expect(page.getByRole("switch", { name: "check" })).toBeVisible();

  await page.getByRole("cell").getByLabel("edit").locator("svg").click();
  await expect(page.getByLabel("boolean1")).toHaveAttribute("aria-checked", "true");

  await page.getByLabel("boolean1").click();
  await closeNotification(page);
  await expect(page.getByLabel("boolean1")).toHaveAttribute("aria-checked", "false");

  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByRole("switch", { name: "close" })).toBeVisible();
});

test("Boolean metadata editing has succeeded", async ({ page }) => {
  await page.getByRole("tab", { name: "Meta Data" }).click();
  await page.getByRole("listitem").filter({ hasText: "Boolean" }).click();
  await page.getByLabel("Display name").fill("boolean1");
  await page.getByLabel("Field Key").fill("boolean1");
  await page.getByLabel("Description").fill("boolean1 description");
  await page.getByRole("tab", { name: "Default value" }).click();
  await page.getByLabel("Set default value").click();
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);

  await page.getByRole("menuitem", { name: "Content" }).click();
  await expect(page.getByRole("columnheader", { name: "boolean1 edit" })).toBeVisible();

  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.getByLabel("boolean1")).toHaveAttribute("aria-checked", "true");

  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByRole("menuitem", { name: "Schema" }).click();
  await page.getByRole("tab", { name: "Meta Data" }).click();
  await page.getByRole("button", { name: "ellipsis" }).click();
  await page.getByLabel("Display name").fill("new boolean1");
  await page.getByLabel("Field Key").fill("new-boolean1");
  await page.getByLabel("Description").fill("new boolean1 description");
  await page.getByLabel("Support multiple values").check();
  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByRole("switch")).toHaveAttribute("aria-checked", "true");

  await page.getByRole("button", { name: "plus New" }).click();
  await expect(page.getByRole("switch").nth(1)).toHaveAttribute("aria-checked", "false");
  await page.getByRole("switch").nth(1).click();
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await expect(page.getByText("new boolean1")).toBeVisible();
  await expect(page.getByText("#new-boolean1")).toBeVisible();

  await page.getByRole("menuitem", { name: "Content" }).click();
  await expect(page.getByRole("columnheader", { name: "new boolean1 edit" })).toBeVisible();
  await expect(page.getByRole("switch", { name: "check" })).toBeVisible();

  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.getByText("new boolean1", { exact: true })).toBeVisible();
  await expect(page.getByText("new boolean1 description")).toBeVisible();
  await expect(page.getByRole("switch").nth(0)).toHaveAttribute("aria-checked", "true");
  await expect(page.getByRole("switch").nth(1)).toHaveAttribute("aria-checked", "true");

  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await expect(page.getByRole("switch").nth(0)).toHaveAttribute("aria-checked", "true");
  await expect(page.getByRole("switch").nth(1)).toHaveAttribute("aria-checked", "true");

  await page.getByRole("button", { name: "Back" }).click();
  await page.getByRole("button", { name: "x2" }).click();
  await expect(page.getByRole("tooltip").getByRole("switch").nth(0)).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await expect(page.getByRole("tooltip").getByRole("switch").nth(1)).toHaveAttribute(
    "aria-checked",
    "true",
  );

  await page.getByRole("tooltip").getByRole("switch").nth(0).click();
  await closeNotification(page);
  await page.getByRole("cell").getByLabel("edit").locator("svg").first().click();
  await expect(page.getByRole("switch").nth(0)).toHaveAttribute("aria-checked", "false");
  await expect(page.getByRole("switch").nth(1)).toHaveAttribute("aria-checked", "true");
  await page.getByRole("button", { name: "plus New" }).click();
  await closeNotification(page);
  await expect(page.getByRole("switch").nth(0)).toHaveAttribute("aria-checked", "false");
  await expect(page.getByRole("switch").nth(1)).toHaveAttribute("aria-checked", "true");
  await expect(page.getByRole("switch").nth(2)).toHaveAttribute("aria-checked", "false");

  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "x3" }).click();
  await expect(page.getByRole("tooltip").getByRole("switch").nth(0)).toHaveAttribute(
    "aria-checked",
    "false",
  );
  await expect(page.getByRole("tooltip").getByRole("switch").nth(1)).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await expect(page.getByRole("tooltip").getByRole("switch").nth(2)).toHaveAttribute(
    "aria-checked",
    "false",
  );
});
