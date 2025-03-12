import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, describe } from "vitest";

import Accessibility from ".";

describe("Accessibility", () => {
  const user = userEvent.setup();

  const hasPublishRight = true;
  const token = "";
  const model1Id = "model1Id";
  const model1Name = "model1Name";
  const model1Key = "model1Key";
  const models = [{ id: model1Id, name: model1Name, key: model1Key }];
  const updateLoading = false;
  const regenerateLoading = false;
  const apiUrl = "https://test.com/api/";
  const alias = "alias";
  const initialValues = {
    scope: "PRIVATE" as const,
    alias,
    assetPublic: false,
    models: { [model1Id]: false },
  };
  const onPublicUpdate = () => {
    return Promise.resolve();
  };
  const onRegenerateToken = () => {
    return Promise.resolve();
  };

  test("Scope, alias, and public status and API end point of models and assets are displayed successfully", async () => {
    render(
      <Accessibility
        initialValues={initialValues}
        hasPublishRight={hasPublishRight}
        token={token}
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
    await expect.poll(() => screen.getByRole("listbox")).toBeVisible();
    expect(screen.getByText("Limited")).toBeVisible();
    expect(screen.getByText("Public")).toBeVisible();
  });

  test("Toggle save button successfully", async () => {
    render(
      <Accessibility
        initialValues={initialValues}
        hasPublishRight={hasPublishRight}
        token={token}
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
    const saveButton = screen.getByRole("button", { name: "Save changes" });
    const switches = screen.getAllByRole("switch");
    const model1Switch = switches[0];
    const assetSwitch = switches[switches.length - 1];

    await user.click(scopeSelect);
    await user.click(await screen.findByText("Limited"));
    expect(screen.getAllByText("Limited")[1]).toBeVisible();
    await expect.poll(() => saveButton).not.toHaveAttribute("disabled");

    await user.click(scopeSelect);
    await user.click(await screen.findByText("Private"));

    expect(screen.getAllByText("Private")[1]).toBeVisible();
    await expect.poll(() => saveButton).toHaveAttribute("disabled");

    await user.click(model1Switch);
    await expect.poll(() => model1Switch).toBeChecked();
    await expect.poll(() => saveButton).not.toHaveAttribute("disabled");

    await user.click(model1Switch);
    await expect.poll(() => model1Switch).not.toBeChecked();
    await expect.poll(() => saveButton).toHaveAttribute("disabled");

    await user.click(assetSwitch);
    await expect.poll(() => assetSwitch).toBeChecked();
    await expect.poll(() => saveButton).not.toHaveAttribute("disabled");

    await user.click(saveButton);
    await expect.poll(() => saveButton).toHaveAttribute("disabled");
  });

  test("Set up limited scope and token is displayed successfully", () => {
    render(
      <Accessibility
        initialValues={{
          scope: "LIMITED",
          alias,
          assetPublic: true,
          models: { [model1Id]: true },
        }}
        hasPublishRight={hasPublishRight}
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
    const switches = screen.getAllByRole("switch");
    const model1Switch = switches[0];
    const assetSwitch = switches[switches.length - 1];

    expect(screen.getAllByText("Limited")[0]).toBeVisible();
    expect(tokenInput).toBeVisible();
    expect(tokenInput).toBeDisabled();
    expect(regenerateButton).toBeVisible();
    expect(model1Switch).toBeChecked();
    expect(assetSwitch).toBeChecked();
  });

  test("Disable switch and button according to user right successfully", () => {
    render(
      <Accessibility
        initialValues={initialValues}
        hasPublishRight={false}
        token={token}
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

    expect(scopeSelect).toBeDisabled();
    expect(model1Switch).toBeDisabled();
    expect(assetSwitch).toBeDisabled();
  });
});
