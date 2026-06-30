import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { FormType } from "../../types";

import ReadingSettings from ".";

describe("ReadingSettings", () => {
  const user = userEvent.setup();

  const apiUrl = "https://test.com/api/";
  const models = [{ id: "m1", name: "Model One", key: "model1" }];
  const initialValues: FormType = { assetPublic: false, models: { m1: false } };

  // The table renders one switch per model plus a trailing "Assets" row.
  const modelSwitch = () => screen.getAllByRole("switch")[0];
  const assetSwitch = () => screen.getAllByRole("switch")[1];
  const saveButton = () => screen.getByRole("button", { name: "Save changes" });

  const renderSettings = ({
    isPublic = false,
    hasPublishRight = true,
    onPublicUpdate = vi.fn().mockResolvedValue(undefined),
  }: {
    isPublic?: boolean;
    hasPublishRight?: boolean;
    onPublicUpdate?: (
      settings: FormType,
      models: { modelId: string; status: boolean }[],
    ) => Promise<void>;
  } = {}) =>
    render(
      <ReadingSettings
        apiUrl={apiUrl}
        isPublic={isPublic}
        initialValues={initialValues}
        hasPublishRight={hasPublishRight}
        models={models}
        updateLoading={false}
        onPublicUpdate={onPublicUpdate}
      />,
    );

  test("Save changes is disabled until a model is toggled", async () => {
    renderSettings();
    expect(saveButton()).toBeDisabled();

    await user.click(modelSwitch());
    expect(saveButton()).toBeEnabled();
  });

  test("toggling a model on then off restores the disabled state", async () => {
    renderSettings();
    await user.click(modelSwitch());
    expect(saveButton()).toBeEnabled();

    await user.click(modelSwitch());
    expect(saveButton()).toBeDisabled();
  });

  test("Save submits the form values and only the changed models, then disables", async () => {
    const onPublicUpdate = vi.fn().mockResolvedValue(undefined);
    renderSettings({ onPublicUpdate });

    await user.click(modelSwitch());
    await user.click(saveButton());

    expect(onPublicUpdate).toHaveBeenCalledWith({ assetPublic: false, models: { m1: true } }, [
      { modelId: "m1", status: true },
    ]);
    expect(saveButton()).toBeDisabled();
  });

  test("toggling the asset flag enables Save and is submitted via the settings, not the model list", async () => {
    const onPublicUpdate = vi.fn().mockResolvedValue(undefined);
    renderSettings({ onPublicUpdate });

    await user.click(assetSwitch());
    expect(saveButton()).toBeEnabled();

    await user.click(saveButton());
    expect(onPublicUpdate).toHaveBeenCalledWith({ assetPublic: true, models: { m1: false } }, []);
  });

  test("hides the Save button when public", () => {
    renderSettings({ isPublic: true });
    expect(screen.queryByRole("button", { name: "Save changes" })).not.toBeInTheDocument();
  });

  test("disables the switches without publish right", () => {
    renderSettings({ hasPublishRight: false });
    screen.getAllByRole("switch").forEach(s => expect(s).toBeDisabled());
  });
});
