import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import CreateWorkspaceButton from "@reearth-cms/components/molecules/Workspace/CreateWorkspaceButton";

describe("CreateWorkspaceButton", () => {
  const user = userEvent.setup();

  test("Create workspace button works successfully", async () => {
    const onWorkspaceCreate = () => {
      return Promise.resolve();
    };

    render(<CreateWorkspaceButton onWorkspaceCreate={onWorkspaceCreate} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button"));
    expect(screen.queryByRole("dialog")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("renders Create a Workspace label on button", () => {
    render(<CreateWorkspaceButton onWorkspaceCreate={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Create a Workspace" })).toBeVisible();
  });

  test("calls onWorkspaceCreate with form values on submit", async () => {
    const onWorkspaceCreate = vi.fn().mockResolvedValue(undefined);
    render(<CreateWorkspaceButton onWorkspaceCreate={onWorkspaceCreate} />);

    await user.click(screen.getByRole("button", { name: "Create a Workspace" }));
    expect(screen.queryByRole("dialog")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Workspace name"), "My Workspace");

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "OK" })).not.toBeDisabled();
    });
    await user.click(screen.getByRole("button", { name: "OK" }));

    await waitFor(() => {
      expect(onWorkspaceCreate).toHaveBeenCalledWith({ name: "My Workspace" });
    });
  });
});
