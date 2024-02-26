import { expect, test } from "@reearth-cms/e2e/utils";

import { createProject, deleteProject } from "./utils";

test("Update settings on Accesibility page has succeeded", async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);

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

  await deleteProject(page);
});
