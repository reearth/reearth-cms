import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, describe, vi } from "vitest";

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
        workspaceName={workspaceName}
        updateWorkspaceLoading={updateWorkspaceLoading}
        hasUpdateRight={hasUpdateRight}
        onWorkspaceUpdate={onWorkspaceUpdate}
      />,
    );

    expect(screen.getByDisplayValue(workspaceName)).toBeVisible();
  });

  test("Loading is displayed successfully", async () => {
    render(
      <GeneralForm
        workspaceName={workspaceName}
        updateWorkspaceLoading={true}
        hasUpdateRight={hasUpdateRight}
        onWorkspaceUpdate={onWorkspaceUpdate}
      />,
    );

    expect(screen.getByLabelText("loading")).toBeVisible();
  });

  test("Input for workspace name is disabled according to user right successfully", () => {
    render(
      <GeneralForm
        workspaceName={workspaceName}
        updateWorkspaceLoading={updateWorkspaceLoading}
        hasUpdateRight={false}
        onWorkspaceUpdate={onWorkspaceUpdate}
      />,
    );

    const nameInput = screen.getByLabelText("Workspace Name");

    expect(nameInput).toBeDisabled();
  });

  test("Save button is toggled successfully", async () => {
    render(
      <GeneralForm
        workspaceName={workspaceName}
        updateWorkspaceLoading={updateWorkspaceLoading}
        hasUpdateRight={hasUpdateRight}
        onWorkspaceUpdate={onWorkspaceUpdate}
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
        workspaceName={workspaceName}
        updateWorkspaceLoading={updateWorkspaceLoading}
        hasUpdateRight={hasUpdateRight}
        onWorkspaceUpdate={onWorkspaceUpdateMock}
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
