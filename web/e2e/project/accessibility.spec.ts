import { expect, test } from "@reearth-cms/e2e/utils";

test("Workspace CRUD has succeeded", async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "plus New Project" }).click();
  await page.getByLabel("Project name").click();
  await page.getByLabel("Project name").fill("e2e project name");
  await page.getByLabel("Project alias").click();
  await page.getByLabel("Project alias").fill("e2e-project-alias");
  await page.getByLabel("Project description").click();
  await page.getByLabel("Project description").fill("e2e project description");
  await page.getByRole("button", { name: "OK" }).click();
  await page.getByText("e2e project name", { exact: true }).click();

  await page.getByText("Accessibility").click();
  await page.getByText("Private").click();
  await page.getByText("Public", { exact: true }).click();
  await page.getByRole("textbox").click();
  await page.getByRole("textbox").fill("new-e2e-project-alias");
  await page.getByRole("switch").click();
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("alert").last()).toContainText(
    "Successfully updated publication settings!",
  );
  await expect(page.locator("form")).toContainText("Public");
  await expect(page.getByRole("textbox")).toHaveValue("new-e2e-project-alias");
  await expect(page.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  await expect(page.locator("tbody")).toContainText(
    "http://localhost:8080/api/p/new-e2e-project-alias/assets",
  );

  await page.getByText("Settings").first().click();
  await page.getByRole("button", { name: "Delete Project" }).click();
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully deleted project!");
});
