import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import GeneralForm from "./GeneralForm";

describe("General form", () => {
  const user = userEvent.setup();

  const workspaceName = "workspaceName";
  const updateWorkspaceLoading = false;
  const hasUpdateRight = true;
  const onWorkspaceUpdate = () => {
    return Promise.resolve();
  };

  test("Workspace name is diplayed successfully", async () => {
    render(
      <GeneralForm
        hasUpdateRight={hasUpdateRight}
        onWorkspaceUpdate={onWorkspaceUpdate}
        updateWorkspaceLoading={updateWorkspaceLoading}
        workspaceName={workspaceName}
      />,
    );

    expect(screen.getByDisplayValue(workspaceName)).toBeVisible();
  });

  test("Loading is displayed successfully", async () => {
    render(
      <GeneralForm
        hasUpdateRight={hasUpdateRight}
        onWorkspaceUpdate={onWorkspaceUpdate}
        updateWorkspaceLoading={true}
        workspaceName={workspaceName}
      />,
    );

    expect(screen.getByLabelText("loading")).toBeVisible();
  });

  test("Input for workspace name is disabled according to user right successfully", () => {
    render(
      <GeneralForm
        hasUpdateRight={false}
        onWorkspaceUpdate={onWorkspaceUpdate}
        updateWorkspaceLoading={updateWorkspaceLoading}
        workspaceName={workspaceName}
      />,
    );

    const nameInput = screen.getByLabelText("Workspace Name");

    expect(nameInput).toBeDisabled();
  });

  test("Save button is toggled successfully", async () => {
    render(
      <GeneralForm
        hasUpdateRight={hasUpdateRight}
        onWorkspaceUpdate={onWorkspaceUpdate}
        updateWorkspaceLoading={updateWorkspaceLoading}
        workspaceName={workspaceName}
      />,
    );

    const saveButton = screen.getByRole("button", { name: "Save changes" });
    const nameInput = screen.getByLabelText("Workspace Name");

    expect(saveButton).toBeDisabled();

    await user.click(nameInput);
    await user.type(nameInput, "Updated");
    expect(saveButton).toBeEnabled();

    await user.clear(nameInput);
    await user.type(nameInput, workspaceName);
    expect(saveButton).toBeDisabled();
  });

  test("Updating function is fired successfully", async () => {
    const onWorkspaceUpdateMock = vi.fn();
    render(
      <GeneralForm
        hasUpdateRight={hasUpdateRight}
        onWorkspaceUpdate={onWorkspaceUpdateMock}
        updateWorkspaceLoading={updateWorkspaceLoading}
        workspaceName={workspaceName}
      />,
    );

    const saveButton = screen.getByRole("button", { name: "Save changes" });
    const nameInput = screen.getByLabelText("Workspace Name");

    await user.click(nameInput);
    await user.type(nameInput, "Updated");
    await user.click(saveButton);

    expect(saveButton).toBeDisabled();
    expect(onWorkspaceUpdateMock).toHaveBeenCalled();
  });
});
