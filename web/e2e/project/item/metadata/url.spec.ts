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

test("Url metadata creating and updating has succeeded", async ({ page }) => {
  await page.getByRole("tab", { name: "Meta Data" }).click();
  await page.getByRole("listitem").filter({ hasText: "URL" }).click();
  await page.getByLabel("Display name").fill("url1");
  await page.getByLabel("Field Key").fill("url1");
  await page.getByLabel("Description").fill("url1 description");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await expect(page.getByText("url1#url1")).toBeVisible();

  await page.getByRole("button", { name: "ellipsis" }).click();
  await expect(page.getByLabel("Display name")).toHaveValue("url1");
  await expect(page.getByLabel("Field Key")).toHaveValue("url1");
  await expect(page.getByLabel("Description")).toHaveValue("url1 description");
  await expect(page.getByLabel("Support multiple values")).not.toBeChecked();
  await expect(page.getByLabel("Use as title")).toBeHidden();

  await page.getByRole("tab", { name: "Validation" }).click();
  await expect(page.getByLabel("Make field required")).not.toBeChecked();
  await expect(page.getByLabel("Set field as unique")).not.toBeChecked();

  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByLabel("Set default value")).toBeEmpty();

  await page.getByRole("button", { name: "Cancel" }).click();
  await page.getByRole("menuitem", { name: "Content" }).click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.getByLabel("url1")).toBeVisible();
  await expect(page.getByText("url1 description")).toBeVisible();

  await page.getByLabel("url1").fill("http://test1.com");
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await expect(page.getByRole("heading", { name: "Item Information" })).toBeVisible();
  await expect(page.getByLabel("url1")).toHaveValue("http://test1.com");

  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByRole("link", { name: "http://test1.com" })).toBeVisible();
  await page.getByRole("link", { name: "http://test1.com" }).hover();
  await page.getByRole("tooltip", { name: "edit" }).locator("svg").click();
  await page.getByRole("textbox").fill("http://test2.com");
  await page.locator(".ant-table-body").click();
  await closeNotification(page);
  await expect(page.getByRole("link", { name: "http://test2.com" })).toBeVisible();

  await page.getByRole("cell").getByLabel("edit").locator("svg").click();
  await expect(page.getByLabel("url1")).toHaveValue("http://test2.com");

  await page.getByLabel("url1").fill("http://test3.com");
  await closeNotification(page);
  await expect(page.getByLabel("url1")).toHaveValue("http://test3.com");

  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByRole("link", { name: "http://test3.com" })).toBeVisible();
});

test("Url metadata editing has succeeded", async ({ page }) => {
  test.slow();
  await page.getByRole("tab", { name: "Meta Data" }).click();
  await page.getByRole("listitem").filter({ hasText: "URL" }).click();
  await page.getByLabel("Display name").fill("url1");
  await page.getByLabel("Field Key").fill("url1");
  await page.getByLabel("Description").fill("url1 description");
  await page.getByRole("tab", { name: "Default value" }).click();
  await page.getByLabel("Set default value").fill("http://default1.com");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);

  await page.getByRole("menuitem", { name: "Content" }).click();
  await expect(page.getByRole("columnheader", { name: "url1 edit" })).toBeVisible();

  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.getByLabel("url1")).toHaveValue("http://default1.com");

  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByRole("button", { name: "Back" }).click();
  await page.getByRole("menuitem", { name: "Schema" }).click();
  await page.getByRole("tab", { name: "Meta Data" }).click();
  await page.getByRole("button", { name: "ellipsis" }).click();
  await page.getByLabel("Display name").fill("new url1");
  await page.getByLabel("Field Key").fill("new-url1");
  await page.getByLabel("Description").fill("new url1 description");
  await page.getByLabel("Support multiple values").check();
  await page.getByRole("tab", { name: "Validation" }).click();
  await page.getByLabel("Make field required").check();
  await page.getByLabel("Set field as unique").check();
  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByRole("textbox")).toHaveValue("http://default1.com");

  await page.getByRole("button", { name: "plus New" }).click();
  await page.getByRole("textbox").nth(1).fill("http://default2.com");
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await expect(page.getByText("new url1 *#new-url1(unique)")).toBeVisible();

  await page.getByRole("menuitem", { name: "Content" }).click();
  await expect(page.getByRole("columnheader", { name: "new url1 edit" })).toBeVisible();
  await expect(page.getByRole("link", { name: "http://default1.com" })).toBeVisible();

  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.getByText("new url1(unique)")).toBeVisible();
  await expect(page.getByText("new url1 description")).toBeVisible();
  await expect(page.getByRole("textbox").nth(0)).toHaveValue("http://default1.com");
  await expect(page.getByRole("textbox").nth(1)).toHaveValue("http://default2.com");

  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await expect(page.getByRole("textbox").nth(0)).toHaveValue("http://default1.com");
  await expect(page.getByRole("textbox").nth(1)).toHaveValue("http://default2.com");
  await page.getByRole("button", { name: "Back" }).click();
  await page.getByRole("button", { name: "x2" }).click();
  await expect(page.getByRole("tooltip").getByRole("link").nth(0)).toContainText(
    "http://default1.com",
  );
  await expect(page.getByRole("tooltip").getByRole("link").nth(1)).toContainText(
    "http://default2.com",
  );

  await page.getByRole("link", { name: "http://default2.com" }).hover();
  await page.getByRole("tooltip", { name: "edit" }).locator("svg").click();
  await page.getByRole("textbox").fill("http://new-default2.com");
  await page.getByRole("tooltip").getByText("new url1").click();
  await closeNotification(page);
  await page.getByRole("cell").getByLabel("edit").locator("svg").first().click();
  await expect(page.getByRole("textbox").nth(0)).toHaveValue("http://default1.com");
  await expect(page.getByRole("textbox").nth(1)).toHaveValue("http://new-default2.com");
  await page.getByRole("button", { name: "plus New" }).click();
  await page.getByRole("textbox").last().fill("http://default3.com");
  await closeNotification(page);
  await expect(page.getByRole("textbox").nth(0)).toHaveValue("http://default1.com");
  await expect(page.getByRole("textbox").nth(1)).toHaveValue("http://new-default2.com");
  await expect(page.getByRole("textbox").nth(2)).toHaveValue("http://default3.com");

  await page.getByRole("button", { name: "Back" }).click();
  await page.getByRole("button", { name: "x3" }).click();
  await expect(page.getByRole("tooltip").getByRole("link").nth(0)).toContainText(
    "http://default1.com",
  );
  await expect(page.getByRole("tooltip").getByRole("link").nth(1)).toContainText(
    "http://new-default2.com",
  );
  await expect(page.getByRole("tooltip").getByRole("link").nth(2)).toContainText(
    "http://default3.com",
  );
});
