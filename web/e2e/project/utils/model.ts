import { Page } from "@playwright/test";

import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect } from "@reearth-cms/e2e/utils";
import { Selectors } from "@reearth-cms/selectors";
// import { Reearth } from "@reearth-cms/e2e/utils";

export const modelName = "e2e model name";

// export async function createModel(page: Page, reearth: Reearth, name = modelName, key = "e2e-model-key") {
export async function createModel(page: Page, name = modelName, key = "e2e-model-key") {
  // await reearth.gql(
  //   `mutation CreateModel($projectId: ID!, $name: String, $description: String, $key: String) {
  //     createModel(input: { projectId: $projectId, name: $name, description: $description, key: $key }) {
  //       model {
  //         id
  //         name
  //       }
  //     }
  //   }`,
  //   {
  //     projectId: reearth.projectId,
  //     name: name,
  //     description: "e2e model description",
  //     key: key,
  //   },
  // );
  await page.getByTestId(Selectors.projectMenuSchema).click();
  await page.getByTestId(Selectors.modelsListButtonAdd).click();
  await page.getByTestId(Selectors.schemaFormModalInputName).fill(name);
  await page.getByTestId(Selectors.schemaFormModalInputDescription).fill("e2e model description");
  await page.getByTestId(Selectors.schemaFormModalInputKey).fill(key);
  await page.getByTestId(Selectors.schemaFormModalButtonOk).click();
  await closeNotification(page);

  await expect(page.getByTitle(name, { exact: true })).toBeVisible();
  await expect(page.getByText(`#${key}`)).toBeVisible();
  await expect(page.getByRole("menuitem", { name }).locator("span")).toBeVisible();
}

const updateModelName = "new e2e model name";

async function updateModel(page: Page) {
  await page.getByRole("button", { name: "more" }).hover();
  await page.getByText("Edit", { exact: true }).click();
  const updateModal = page.getByLabel("Update Model");
  await updateModal.getByTestId(Selectors.schemaFormModalInputName).click();
  await updateModal.getByTestId(Selectors.schemaFormModalInputName).fill(updateModelName);
  await updateModal.getByTestId(Selectors.schemaFormModalInputKey).click();
  await updateModal.getByTestId(Selectors.schemaFormModalInputKey).fill("new-e2e-model-key");
  await updateModal.getByTestId(Selectors.schemaFormModalButtonOk).click();
  await closeNotification(page);

  await expect(page.getByTitle(updateModelName)).toBeVisible();
  await expect(page.getByText("#new-e2e-model-key")).toBeVisible();
  await expect(page.getByRole("menuitem", { name: updateModelName }).locator("span")).toBeVisible();
}

async function deleteModel(page: Page) {
  await page.getByRole("button", { name: "more" }).hover();
  await page.getByText("Delete").click();
  await page.getByTestId(Selectors.schemaDeletionModalButtonDelete).click();
  await closeNotification(page);
  await expect(page.getByTitle(updateModelName)).toBeHidden();
}

export async function crudModel(page: Page) {
  await createModel(page);
  await updateModel(page);
  await deleteModel(page);
}
