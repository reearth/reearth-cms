import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";

test.beforeEach(async ({ reearth, projectPage }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  const projectName = getId();
  await projectPage.createProject(projectName);
  await projectPage.gotoProject(projectName);
});

test.afterEach(async ({ projectPage }) => {
  await projectPage.deleteProject();
});

test("Model CRUD on Overview page has succeeded", async ({ schemaPage, projectPage }) => {
  await expect(projectPage.noModelsYetText).toBeVisible();
  await projectPage.newModelButtonFirst.click();
  await expect(projectPage.newModelLabelText).toBeVisible();
  await schemaPage.modelKeyInput.fill("model key");
  await schemaPage.modelNameInput.fill("model name");
  await projectPage.modelDescriptionInput.fill("model description");
  await schemaPage.okButton.click();
  await projectPage.closeNotification();
  await expect(projectPage.modelTitleByName("model name")).toBeVisible();
  await expect(projectPage.modelKeyTextByKey("model-key")).toBeVisible();
  await expect(projectPage.modelMenuItemByName("model name")).toBeVisible();
  await projectPage.modelsMenuItem.click();
  await projectPage.modelListLink.click();
  await projectPage.editText.click();
  await projectPage.modelNameInput.fill("new model name");
  await projectPage.modelDescriptionInput.fill("new model description");
  await projectPage.modelKeyInput.fill("new-model-key");
  await projectPage.okButton.click();
  await projectPage.closeNotification();
  await expect(projectPage.rootElement).toContainText("new model name");
  await expect(projectPage.rootElement).toContainText("new model description");
  await projectPage.modelListLink.click();
  await projectPage.deleteText.click();
  await projectPage.deleteModelButton.click();
  await projectPage.closeNotification();
  await expect(projectPage.rootElement).not.toContainText("new model name");
  await expect(projectPage.noModelsYetText).toBeVisible();
});

test("Creating Model by using the button on placeholder has succeeded", async ({ projectPage }) => {
  await projectPage.newModelButtonLast.click();
  await expect(projectPage.dialogNewModelText).toBeVisible();
  await projectPage.modelNameInput.fill("model name");
  await projectPage.okButton.click();
  await projectPage.closeNotification();
  await expect(projectPage.modelTitleByName("model name")).toBeVisible();
  await expect(projectPage.modelKeyTextByKey("model-name")).toBeVisible();
  await expect(projectPage.modelMenuItemByName("model name")).toBeVisible();
});
