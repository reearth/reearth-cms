import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";

import GeneralForm from "./GeneralForm";

test("General form works successfully", async () => {
  const user = userEvent.setup();

  const name = "name";
  const email = "email";
  const me = {
    name,
    email,
  };
  const onUserUpdate = () => {
    return Promise.resolve();
  };

  render(<GeneralForm initialValues={me} onUserUpdate={onUserUpdate} />);

  const nameInput = screen.getByLabelText("Account Name");
  const emailInput = screen.getByLabelText("Your Email");
  const saveButton = screen.getByRole("button");

  expect(nameInput).toHaveValue(name);
  expect(emailInput).toHaveValue(email);
  expect(saveButton).toHaveAttribute("disabled");

  await user.type(nameInput, "test");
  expect(saveButton).not.toHaveAttribute("disabled");

  await user.clear(nameInput);
  expect(saveButton).toHaveAttribute("disabled");
  await expect.poll(() => nameInput).toBeInvalid();

  await user.type(nameInput, name);
  expect(saveButton).toHaveAttribute("disabled");
  expect(nameInput).toBeValid();

  await user.clear(emailInput);
  expect(saveButton).toHaveAttribute("disabled");
  await expect.poll(() => emailInput).toBeInvalid();

  await user.type(emailInput, "test@test.com");
  expect(saveButton).not.toHaveAttribute("disabled");
  expect(emailInput).toBeValid();

  await user.click(saveButton);
  expect(saveButton).toHaveAttribute("disabled");
});
