import { closeNotification } from "@reearth-cms/e2e/helpers/notification.helper";
import { expect, test } from "@reearth-cms/e2e/fixtures/test";

let originalUsername: string;
let originalEmail: string;

test.beforeEach(async ({ reearth, settingsPage }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await settingsPage.textByName("Account").click();
  originalUsername = await settingsPage.accountNameInput.inputValue();
  originalEmail = await settingsPage.yourEmailInput.inputValue();
});

test.afterEach(async ({ reearth, page, settingsPage }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await settingsPage.accountText.click();
  const username = await settingsPage.accountNameInput.inputValue();
  const email = await settingsPage.yourEmailInput.inputValue();
  if (username === originalUsername && email === originalEmail) {
    return;
  } else {
    await settingsPage.accountNameInput.fill(originalUsername);
    await settingsPage.yourEmailInput.fill(originalEmail);
    await settingsPage.formSubmitButton.click();
    await closeNotification(page);
  }
});

test("Name and email updating has succeeded", async ({ reearth, page, settingsPage }) => {
  // eslint-disable-next-line playwright/no-skipped-test
  test.skip(process.env.ENV !== "oss", "This test is only for oss");
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await settingsPage.textByName("Account").click();

  await settingsPage.accountNameInputExact.click();
  await settingsPage.accountNameInputExact.fill("new name");
  await settingsPage.yourEmailInputExact.click();
  await settingsPage.yourEmailInputExact.fill("test@test.com");
  await settingsPage.formSubmitButton.click();
  await closeNotification(page);

  await settingsPage.accountNameInputExact.click();
  await settingsPage.accountNameInputExact.fill(originalUsername);
  await settingsPage.yourEmailInputExact.click();
  await settingsPage.yourEmailInputExact.fill(originalEmail);
  await settingsPage.formSubmitButton.click();
  await closeNotification(page);
  await expect(settingsPage.headerElement).toContainText(originalUsername);
});
