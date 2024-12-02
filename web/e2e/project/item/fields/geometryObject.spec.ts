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

test("GeometryObject field creating and updating has succeeded", async ({ page }) => {
  await page.locator("li").filter({ hasText: "Geometry Object" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("geometryObject1");
  await page.getByLabel("Settings").locator("#description").click();
  await page.getByLabel("Settings").locator("#description").fill("geometryObject1 description");
  await page.getByLabel("Point", { exact: true }).check();
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);

  await expect(page.getByLabel("Fields").getByRole("paragraph")).toContainText(
    "geometryObject1#geometryobject1",
  );
  await page.getByText("Content").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.locator("label")).toContainText("geometryObject1");
  await expect(page.getByRole("main")).toContainText("geometryObject1 description");
  await page.locator(".view-lines").click();
  await page
    .getByLabel("Editor content;Press Alt+F1")
    .fill('{\n"type": "Point",\n"coordinates": [0, 0]');
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await page.locator(".ant-table-row > td:nth-child(9)").getByRole("button").click();
  await expect(page.getByRole("tooltip")).toContainText(
    '{ "type": "Point", "coordinates": [0, 0] }',
  );

  await page.getByRole("cell").getByLabel("edit").locator("svg").click();
  await page.locator(".ant-row").getByRole("button").nth(1).click();
  await page.locator(".view-lines").click();
  await page
    .getByLabel("Editor content;Press Alt+F1")
    .fill('{\n"type": "Point",\n"coordinates": [1, 0]');
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await page.locator(".ant-table-row > td:nth-child(9)").getByRole("button").click();
  await expect(page.getByRole("tooltip")).toContainText(
    '{ "type": "Point", "coordinates": [1, 0] }',
  );
});

test("GeometryObject field editing has succeeded", async ({ page }) => {
  await page.locator("li").filter({ hasText: "Geometry Object" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("geometryObject1");
  await page.getByLabel("Settings").locator("#description").click();
  await page.getByLabel("Settings").locator("#description").fill("geometryObject1 description");
  await page.getByLabel("Point", { exact: true }).check();
  await page.getByRole("tab", { name: "Default value" }).click();
  await page.locator(".view-lines").click();
  await page
    .getByLabel("Editor content;Press Alt+F1")
    .fill('{\n"type": "Point",\n"coordinates": [0, 0]');
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("geometryObject1");
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.locator(".view-lines")).toContainText(
    '{    "type":     "Point",    "coordinates":     [0, 0]}',
  );

  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await page.locator(".ant-table-row > td:nth-child(9)").getByRole("button").click();
  await expect(page.getByRole("tooltip")).toContainText(
    '{ "type": "Point", "coordinates": [0, 0] }',
  );
  await page.getByText("Schema").click();
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("new geometryObject1");
  await page.getByLabel("Field Key").click();
  await page.getByLabel("Field Key").fill("new-geometryobject1");
  await page.getByLabel("Description(optional)").click();
  await page.getByLabel("Description(optional)").fill("new geometryObject1 description");
  await page.getByLabel("Support multiple values").check();
  await expect(page.getByLabel("Use as title")).toBeHidden();
  await page.getByRole("tab", { name: "Validation" }).click();
  await page.getByLabel("Make field required").check();
  await page.getByLabel("Set field as unique").check();
  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.locator(".view-lines").nth(0)).toContainText(
    '{  "type": "Point",  "coordinates": [0, 0]}',
  );

  await page.getByRole("button", { name: "plus New" }).click();
  await page
    .getByLabel("Editor content;Press Alt+F1")
    .nth(1)
    .fill('{\n"type": "Point",\n"coordinates": [1, 0]');
  await page.getByRole("button", { name: "arrow-down" }).first().click();
  await expect(page.locator(".view-lines").nth(0)).toContainText(
    '{  "type": "Point",  "coordinates": [1, 0]}',
  );
  await expect(page.locator(".view-lines").nth(1)).toContainText(
    '{  "type": "Point",  "coordinates": [0, 0]}',
  );
  await page.getByRole("button", { name: "OK" }).click();
  await closeNotification(page);
  await expect(page.getByText("new geometryObject1 *#new-geometryobject1(unique)")).toBeVisible();
  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("new geometryObject1");
  await page.locator(".ant-table-row > td:nth-child(9)").getByRole("button").click();
  await expect(page.getByRole("tooltip")).toContainText(
    '{ "type": "Point", "coordinates": [0, 0] }',
  );
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.locator(".view-lines").nth(0)).toContainText(
    '{  "type": "Point",  "coordinates": [1, 0]}',
  );
  await expect(page.locator(".view-lines").nth(1)).toContainText(
    '{  "type": "Point",  "coordinates": [0, 0]}',
  );
  await page.getByRole("button", { name: "plus New" }).click();
  await page
    .getByLabel("Editor content;Press Alt+F1")
    .nth(2)
    .fill('{\n"type": "Point",\n"coordinates": [2, 0]');
  await page.getByRole("button", { name: "arrow-up" }).nth(2).click();
  await page.getByRole("button", { name: "Save" }).click();
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "x3" }).click();
  await expect(page.getByRole("tooltip").locator("p").nth(0)).toContainText(
    '{ "type": "Point", "coordinates": [1, 0] }',
  );
  await expect(page.getByRole("tooltip").locator("p").nth(1)).toContainText(
    '{ "type": "Point", "coordinates": [2, 0] }',
  );
  await expect(page.getByRole("tooltip").locator("p").nth(2)).toContainText(
    '{ "type": "Point", "coordinates": [0, 0] }',
  );
});
