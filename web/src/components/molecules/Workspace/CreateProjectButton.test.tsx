import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, describe, vi } from "vitest";

import CreateProjectButton from "./CreateProjectButton";

describe("Create project button", () => {
  const user = userEvent.setup();

  const onProjectCreate = () => {
    return Promise.resolve();
  };
  const onProjectAliasCheck = () => {
    return Promise.resolve(true);
  };

  test("Modal works successfully", async () => {
    render(
      <CreateProjectButton
        hasCreateRight={true}
        onProjectCreate={onProjectCreate}
        onProjectAliasCheck={onProjectAliasCheck}
      />,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button"));
    expect(screen.queryByRole("dialog")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("Creating button is disabled due to user right", () => {
    render(
      <CreateProjectButton
        hasCreateRight={false}
        onProjectCreate={onProjectCreate}
        onProjectAliasCheck={onProjectAliasCheck}
      />,
    );

    expect(screen.getByRole("button")).toHaveAttribute("disabled");
  });

  test("renders New Project label on button", () => {
    render(
      <CreateProjectButton
        hasCreateRight={true}
        onProjectCreate={onProjectCreate}
        onProjectAliasCheck={onProjectAliasCheck}
      />,
    );

    expect(screen.getByRole("button", { name: /New Project/ })).toBeVisible();
  });

  test("handleSubmit success path calls onProjectCreate and closes modal", async () => {
    const onProjectCreateMock = vi.fn().mockResolvedValue(undefined);
    render(
      <CreateProjectButton
        hasCreateRight={true}
        onProjectCreate={onProjectCreateMock}
        onProjectAliasCheck={onProjectAliasCheck}
      />,
    );

    await user.click(screen.getByRole("button", { name: /New Project/ }));
    expect(screen.queryByRole("dialog")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Project name"), "Test Project");
    await user.type(screen.getByLabelText("Project alias"), "test-project");

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "OK" })).not.toBeDisabled();
    });
    await user.click(screen.getByRole("button", { name: "OK" }));

    await waitFor(() => {
      expect(onProjectCreateMock).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  test("handleSubmit error path calls console.error when onProjectCreate rejects", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error("fail");
    const onProjectCreateMock = vi.fn().mockRejectedValue(error);
    render(
      <CreateProjectButton
        hasCreateRight={true}
        onProjectCreate={onProjectCreateMock}
        onProjectAliasCheck={onProjectAliasCheck}
      />,
    );

    await user.click(screen.getByRole("button", { name: /New Project/ }));

    await user.type(screen.getByLabelText("Project name"), "Test Project");
    await user.type(screen.getByLabelText("Project alias"), "test-project");

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "OK" })).not.toBeDisabled();
    });
    await user.click(screen.getByRole("button", { name: "OK" }));

    await waitFor(() => {
      expect(onProjectCreateMock).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    consoleSpy.mockRestore();
  });
});
