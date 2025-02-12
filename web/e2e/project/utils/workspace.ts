import { Page } from "@playwright/test";

import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect} from "@reearth-cms/e2e/utils";
import { Selectors } from "@reearth-cms/selectors";
// import { Reearth } from "@reearth-cms/e2e/utils";


// Creates a new workspace with a fixed name
// export async function createWorkspace(page: Page, reearth: Reearth) {
export async function createWorkspace(page: Page, ) {
  // await reearth.gql(
  //   `mutation CreateWorkspace(
  //   $name: String!
  //   ) {
  //     createWorkspace(input: { 
  //       name: $name 
  //     }) {
  //       workspace {
  //         id
  //         name
  //       }
  //     }
  //   }`,
  //   {
  //     name: "e2e workspace name"
  //   }
  // );
  await page.getByTestId(Selectors.workspaceHeaderButtonCreateWorkspace).click();
  await page.getByTestId(Selectors.workspaceCreationModalInputName).click();
  await page.getByTestId(Selectors.workspaceCreationModalInputName).fill("e2e workspace name");
  await page.getByTestId(Selectors.workspaceCreationModalButtonOk).click();
  await closeNotification(page);
}

// Creates a new workspace from the tab and verifies its creation
export async function createWorkspaceFromTab(page: Page) {
  await page.locator("a").first().click(); 
  await page.getByTestId(Selectors.workspaceCreateButton).click();
  await page.getByTestId(Selectors.workspaceCreationModalInputName).click();
  await page.getByTestId(Selectors.workspaceCreationModalInputName).fill("workspace name");
  await page.getByTestId(Selectors.workspaceCreationModalButtonOk).click();
  await closeNotification(page);

  await expect(page.locator("header")).toContainText("workspace name");
  await page.getByTestId(Selectors.workspaceSettingsMenuItem).click();
  await page.getByTestId(Selectors.workspaceSettingsDangerZoneButtonDelete).click();
  await page.getByTestId(Selectors.workspaceSettingsDangerZoneButtonDeleteConfirmOk).click();
  await closeNotification(page);
}

// Updates the workspace name and verifies the change
export async function updateWorkspace(page: Page) {
  await page.getByTestId(Selectors.workspaceSettingsMenuItem).click();
  await page.getByTestId(Selectors.workspaceSettingsInputName).click();
  await page.getByTestId(Selectors.workspaceSettingsInputName).fill("new workspace name");
  await page.getByTestId(Selectors.workspaceSettingsButtonSave).click();
  await closeNotification(page);
  await expect(page.getByTestId(Selectors.workspaceSettingsInputName)).toHaveValue("new workspace name");
 
}

// Deletes a workspace after it has been updated
export async function deleteWorkspaceAfterUpdated(page: Page) {
  await page.getByTestId(Selectors.workspaceSettingsDangerZoneButtonDelete).click();
  await page.getByTestId(Selectors.workspaceSettingsDangerZoneButtonDeleteConfirmOk).click();
  await closeNotification(page);
  await page.locator("a").first().click();
  await expect(page.getByTestId(Selectors.workspaceSettingsInputName)).toBeHidden();
}

// Deletes the current workspace
export async function deleteWorkspace(page: Page) {
  await page.getByTestId(Selectors.workspaceSettingsMenuItem).click();
  await page.getByTestId(Selectors.workspaceSettingsDangerZoneButtonDelete).click();
  await page.getByTestId(Selectors.workspaceSettingsDangerZoneButtonDeleteConfirmOk).click();
  await closeNotification(page);
}
