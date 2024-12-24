import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";

import ProjectCreationModal from ".";

test("ProjectCreationModal works successfully", async () => {
  const user = userEvent.setup();

  const onClose = () => {};
  const onSubmit = () => {
    return Promise.resolve();
  };
  const onProjectAliasCheck = () => {
    return Promise.resolve(true);
  };

  render(
    <ProjectCreationModal
      open
      onClose={onClose}
      onSubmit={onSubmit}
      onProjectAliasCheck={onProjectAliasCheck}
    />,
  );

  const nameInput = screen.getByLabelText("Project name");
  const aliasInput = screen.getByLabelText("Project alias");
  const saveButton = screen.getByRole("button", { name: "OK" });

  expect(saveButton).toHaveAttribute("disabled");
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();

  await user.type(nameInput, "test ");
  expect(aliasInput).toHaveValue("test-");
  await expect.poll(() => saveButton).not.toHaveAttribute("disabled");

  await user.clear(aliasInput);
  await expect.poll(() => screen.getByRole("alert")).toBeVisible();
  await expect.poll(() => saveButton).toHaveAttribute("disabled");

  await user.type(aliasInput, "alias");
  await expect.poll(() => screen.queryByRole("alert")).not.toBeInTheDocument();
  await expect.poll(() => saveButton).not.toHaveAttribute("disabled");

  await user.clear(nameInput);
  await expect.poll(() => screen.getByRole("alert")).toBeVisible();
  await expect.poll(() => saveButton).toHaveAttribute("disabled");

  await user.type(nameInput, "a");
  await expect.poll(() => screen.queryByRole("alert")).not.toBeInTheDocument();
  await expect.poll(() => saveButton).not.toHaveAttribute("disabled");
});
