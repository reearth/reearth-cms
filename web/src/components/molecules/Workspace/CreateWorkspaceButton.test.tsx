import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";

import CreateWorkspaceButton from "@reearth-cms/components/molecules/Workspace/CreateWorkspaceButton";

test("Create workspace button works successfully", async () => {
  const user = userEvent.setup();

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
