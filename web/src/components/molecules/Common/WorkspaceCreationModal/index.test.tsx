import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";

import WorkspaceCreationModal from ".";

test("Workspace creation modal works successfully", async () => {
  const user = userEvent.setup();

  const onClose = () => {};
  const onSubmit = () => {
    return Promise.resolve();
  };

  render(<WorkspaceCreationModal open onClose={onClose} onSubmit={onSubmit} />);

  const input = screen.getByLabelText("Workspace name");
  const saveButton = screen.getByRole("button", { name: "OK" });

  expect(saveButton).toHaveAttribute("disabled");
  expect(input).toBeValid();

  await user.type(input, "test");
  expect(saveButton).not.toHaveAttribute("disabled");
  await user.clear(input);
  expect(saveButton).toHaveAttribute("disabled");
  await expect.poll(() => input).toBeInvalid();
});
