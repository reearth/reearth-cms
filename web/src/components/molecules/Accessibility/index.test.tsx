import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";

import Accessibility from ".";

it("Accessibility component worked successfully", async () => {
  const user = userEvent.setup();

  const model1Id = "model1Id";
  const model1Name = "model1Name";
  const model1Key = "model1Key";
  const models = [{ id: model1Id, name: model1Name, key: model1Key }];
  const updateLoading = false;
  const regenerateLoading = false;
  const apiUrl = "https://test.com/api/";
  const alias = "alias";
  const onPublicUpdate = () => {
    return Promise.resolve();
  };
  const onRegenerateToken = () => {
    return Promise.resolve();
  };

  const { rerender } = render(
    <Accessibility
      initialValues={{
        scope: "PRIVATE",
        alias,
        assetPublic: false,
        models: { [model1Id]: false },
      }}
      hasPublishRight={true}
      token={""}
      models={models}
      updateLoading={updateLoading}
      regenerateLoading={regenerateLoading}
      apiUrl={apiUrl}
      alias={alias}
      onPublicUpdate={onPublicUpdate}
      onRegenerateToken={onRegenerateToken}
    />,
  );

  const scopeSelect = screen.getByRole("combobox");
  const switches = screen.getAllByRole("switch");
  const model1Switch = switches[0];
  const assetSwitch = switches[switches.length - 1];
  const saveButton = screen.getByRole("button", { name: "Save changes" });

  expect(screen.getByText("Private")).toBeVisible();
  expect(screen.getByDisplayValue(alias)).toBeVisible();
  expect(screen.getByDisplayValue(alias)).toBeDisabled();
  expect(screen.queryByTestId("token")).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Re-generate" })).not.toBeInTheDocument();

  expect(screen.getByText(model1Name)).toBeVisible();
  expect(model1Switch).not.toBeChecked();
  expect(screen.getByText(`${apiUrl}model1Key`)).toBeVisible();
  expect(screen.getByText("Assets")).toBeVisible();
  expect(assetSwitch).not.toBeChecked();
  expect(screen.getByText(`${apiUrl}assets`)).toBeVisible();

  expect(saveButton).toHaveAttribute("disabled");

  await user.click(scopeSelect);
  await user.click(await screen.findByText("Limited"));
  expect(screen.getAllByText("Limited")[1]).toBeVisible();
  await expect.poll(() => saveButton).not.toHaveAttribute("disabled");

  await user.click(scopeSelect);
  await user.click(await screen.findByText("Private"));

  expect(screen.getAllByText("Private")[1]).toBeVisible();
  await expect.poll(() => saveButton).toHaveAttribute("disabled");

  await user.click(assetSwitch);
  await expect.poll(() => assetSwitch).toBeChecked();
  await expect.poll(() => saveButton).not.toHaveAttribute("disabled");

  await user.click(saveButton);
  await expect.poll(() => saveButton).toHaveAttribute("disabled");

  rerender(
    <Accessibility
      initialValues={{
        scope: "LIMITED",
        alias,
        assetPublic: true,
        models: { [model1Id]: true },
      }}
      hasPublishRight={false}
      token={"token"}
      models={models}
      updateLoading={updateLoading}
      regenerateLoading={regenerateLoading}
      apiUrl={apiUrl}
      alias={alias}
      onPublicUpdate={onPublicUpdate}
      onRegenerateToken={onRegenerateToken}
    />,
  );

  const tokenInput = screen.queryByTestId("token");
  const regenerateButton = screen.queryByRole("button", { name: "Re-generate" });

  expect(screen.getAllByText("Limited")[0]).toBeVisible();
  expect(scopeSelect).toBeDisabled();
  expect(tokenInput).toBeVisible();
  expect(tokenInput).toBeDisabled();
  expect(regenerateButton).toBeVisible();
  expect(model1Switch).toBeChecked();
  expect(model1Switch).toBeDisabled();
  expect(assetSwitch).toBeChecked();
  expect(assetSwitch).toBeDisabled();
});
