import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";

import Accessibility from ".";

describe("Accessibility", () => {
  const user = userEvent.setup();

  const hasCreateRight = true;
  const hasUpdateRight = true;
  const hasDeleteRight = true;
  const hasPublishRight = true;
  const model1Id = "model1Id";
  const model1Name = "model1Name";
  const model1Key = "model1Key";
  const models = [{ id: model1Id, key: model1Key, name: model1Name }];
  const updateLoading = false;
  const apiUrl = "https://test.com/api/";
  const alias = "alias";
  const initialValues = {
    alias,
    assetPublic: false,
    models: { [model1Id]: false },
    scope: "PRIVATE" as const,
  };
  const onAPIKeyNew = () => {
    return Promise.resolve();
  };
  const onAPIKeyEdit = () => {
    return Promise.resolve();
  };
  const onAPIKeyDelete = () => {
    return Promise.resolve();
  };
  const onPublicUpdate = () => {
    return Promise.resolve();
  };
  const onSettingsPageOpen = () => {
    return Promise.resolve();
  };

  test("Scope, alias, and public status and API end point of models and assets are displayed successfully", async () => {
    render(
      <Accessibility
        alias={alias}
        apiUrl={apiUrl}
        hasCreateRight={hasCreateRight}
        hasDeleteRight={hasDeleteRight}
        hasPublishRight={hasPublishRight}
        hasUpdateRight={hasUpdateRight}
        initialValues={initialValues}
        models={models}
        onAPIKeyDelete={onAPIKeyDelete}
        onAPIKeyEdit={onAPIKeyEdit}
        onAPIKeyNew={onAPIKeyNew}
        onPublicUpdate={onPublicUpdate}
        onSettingsPageOpen={onSettingsPageOpen}
        updateLoading={updateLoading}
      />,
    );

    let switches = screen.getAllByRole("switch");
    switches = screen.getAllByRole("switch");
    const model1Switch = switches[0];
    const assetSwitch = switches[switches.length - 1];
    const saveButton = screen.getByRole("button", { name: "Save changes" });

    expect(screen.getByText(model1Name)).toBeVisible();
    expect(model1Switch).not.toBeChecked();
    expect(screen.getByText(`${apiUrl}model1Key`)).toBeVisible();
    expect(screen.getByText("Assets")).toBeVisible();
    expect(assetSwitch).not.toBeChecked();
    expect(screen.getByText(`${apiUrl}assets`)).toBeVisible();

    expect(saveButton).toHaveAttribute("disabled");
  });

  test("Toggle save button successfully", async () => {
    render(
      <Accessibility
        alias={alias}
        apiUrl={apiUrl}
        hasCreateRight={hasCreateRight}
        hasDeleteRight={hasDeleteRight}
        hasPublishRight={hasPublishRight}
        hasUpdateRight={hasUpdateRight}
        initialValues={initialValues}
        models={models}
        onAPIKeyDelete={onAPIKeyDelete}
        onAPIKeyEdit={onAPIKeyEdit}
        onAPIKeyNew={onAPIKeyNew}
        onPublicUpdate={onPublicUpdate}
        onSettingsPageOpen={onSettingsPageOpen}
        updateLoading={updateLoading}
      />,
    );

    let switches = screen.getAllByRole("switch");
    const saveButton = screen.getByRole("button", { name: "Save changes" });
    switches = screen.getAllByRole("switch");
    const model1Switch = switches[0];
    const assetSwitch = switches[switches.length - 1];

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

  test("Disable switch and button according to user right successfully", async () => {
    render(
      <Accessibility
        alias={alias}
        apiUrl={apiUrl}
        hasCreateRight={hasCreateRight}
        hasDeleteRight={hasDeleteRight}
        hasPublishRight={false}
        hasUpdateRight={hasUpdateRight}
        initialValues={initialValues}
        models={models}
        onAPIKeyDelete={onAPIKeyDelete}
        onAPIKeyEdit={onAPIKeyEdit}
        onAPIKeyNew={onAPIKeyNew}
        onPublicUpdate={onPublicUpdate}
        onSettingsPageOpen={onSettingsPageOpen}
        updateLoading={updateLoading}
      />,
    );

    let switches = screen.getAllByRole("switch");
    switches = screen.getAllByRole("switch");
    const model1Switch = switches[0];
    const assetSwitch = switches[switches.length - 1];

    expect(model1Switch).toBeDisabled();
    expect(assetSwitch).toBeDisabled();
  });
});
