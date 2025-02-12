import { Page, expect } from "@playwright/test";

import { closeNotification } from "@reearth-cms/e2e/common/notification";
// import { Reearth } from "@reearth-cms/e2e/utils";
import { Selectors } from "@reearth-cms/selectors";

// Creates a new project with a random ID and description
export async function createProject(page: Page) {
  const id = Math.ceil(Math.random() * (100000 - 10000) + 10000).toString();
  //   await reearth.gql(
  //     `mutation CreateProject(
  //   $workspaceId: ID!,
  //   $name: String!,
  //   $description: String!,
  //   $alias: String!
  // ) {
  //   createProject(input: {
  //     workspaceId: $workspaceId,
  //     name: $name,
  //     description: $description,
  //     alias: $alias
  //   }) {
  //     project {
  //       id
  //       name
  //       description
  //       alias
  //     }
  //   }
  // }`,
  //     {
  //       workspaceId: reearth.workspaceId,
  //       name: id,
  //       description: "e2e project description",
  //       alias: id,
  //     },
  //   );
  await page.getByTestId(Selectors.projectListButtonNewProject).click();
  await page.getByTestId(Selectors.projectCreationModalInputName).fill(id);
  await page
    .getByTestId(Selectors.projectCreationModalTextareaDescription)
    .fill("e2e project description");
  await page.getByTestId(Selectors.projectCreationModalButtonOk).click();
  await closeNotification(page);
  await page.getByText(id, { exact: true }).click();
}

// Creates a new project with fixed name, alias and description
export async function createNewProject(page: Page) {
  await page.getByTestId(Selectors.projectListButtonNewProject).click();
  await page.getByTestId(Selectors.projectCreationModalInputName).fill("project name");
  await page.getByTestId(Selectors.projectCreationModalInputAlias).fill("project alias");
  await page
    .getByTestId(Selectors.projectCreationModalTextareaDescription)
    .fill("project description");
  await page.getByTestId(Selectors.projectCreationModalButtonOk).click();
  await closeNotification(page);

  await expect(page.getByText("project name", { exact: true })).toBeVisible();
  await expect(page.getByText("project description", { exact: true })).toBeVisible();
}

// Searches for a project and verifies search functionality
export async function searchProject(page: Page) {
  await page.getByTestId(Selectors.workspaceHeaderSearchInput).click();
  await page.getByTestId(Selectors.workspaceHeaderSearchInput).fill("no project");
  await page.getByRole("button", { name: "search" }).click();
  await expect(page.getByText("project name", { exact: true })).toBeHidden();
  await page.getByRole("button", { name: "close-circle" }).click();
  await expect(page.getByText("project name", { exact: true })).toBeVisible();
  await page.getByText("project name", { exact: true }).click();
  await expect(page.getByText("project name").nth(1)).toBeVisible();
  await expect(page.getByText("project description")).toBeVisible();
}

// Updates project name, description and owner settings
export async function updateProject(page: Page) {
  await page.getByTestId(Selectors.projectMenuSettings).click();
  await page.getByTestId(Selectors.projectSettingInputName).click();
  await page.getByTestId(Selectors.projectSettingInputName).fill("new project name");
  await page
    .getByTestId(Selectors.projectSettingTextareaDescription)
    .fill("new project description");
  await page.getByTestId(Selectors.projectSettingButtonSave).click();
  await closeNotification(page);

  await expect(page.locator("#root")).toContainText("Project Settings / new project name");
  await expect(page.locator("header")).toContainText("new project name");
  await page.getByTestId(Selectors.projectSettingOwnerSwitch).click();
  await page.getByTestId(Selectors.projectSettingUpdateButtonSave).click();
  await expect(page.getByTestId(Selectors.projectSettingOwnerSwitch)).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await closeNotification(page);

  await page.getByTestId(Selectors.projectMenuOverview).click();
  await expect(page.locator("#root")).toContainText("new project name");
  await expect(page.locator("#root")).toContainText("new project description");
}

// Deletes the current project
export async function deleteProject(page: Page) {
  await page.getByTestId(Selectors.projectMenuSettings).click();
  await page.getByTestId(Selectors.projectSettingsDangerZoneButtonDelete).click();
  await page.getByTestId(Selectors.projectDeleteConfirmOk).click();
  await closeNotification(page);
}

// Updates project accessibility settings
export async function UpdateSetting(page: Page) {
  await page.getByTestId(Selectors.projectMenuSettings).click();
  await page.getByTestId(Selectors.accessibilitySwitch).click();
  await page.getByTestId(Selectors.accessibilitySaveChangesButton).click();
  await expect(page.getByTestId(Selectors.accessibilitySwitch)).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await closeNotification(page);
}

// Updates project public visibility settings
export async function SettingPublicSetting(page: Page) {
  await page.getByTestId(Selectors.projectMenuSettings).click();
  await page.getByTestId(Selectors.publicSwitch).click();
  await page.getByTestId(Selectors.accessibilitySaveChangesButton).click();
  await expect(page.getByTestId(Selectors.publicSwitch)).toHaveAttribute("aria-checked", "true");
  await closeNotification(page);
}
