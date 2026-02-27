import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import GeneralForm from "./GeneralForm";

describe("GeneralForm", () => {
  const user = userEvent.setup();

  const name = "name";
  const email = "email";
  const me = { name, email };

  test("General form works successfully", async () => {
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

  test("Save calls onUserUpdate with correct arguments", async () => {
    const onUserUpdateMock = vi.fn(() => Promise.resolve());

    render(<GeneralForm initialValues={me} onUserUpdate={onUserUpdateMock} />);

    const nameInput = screen.getByLabelText("Account Name");
    const emailInput = screen.getByLabelText("Your Email");
    const saveButton = screen.getByRole("button");

    await user.clear(nameInput);
    await user.type(nameInput, "newName");
    await user.clear(emailInput);
    await user.type(emailInput, "new@test.com");
    await user.click(saveButton);

    expect(onUserUpdateMock).toHaveBeenCalledWith("newName", "new@test.com");
    expect(saveButton).toHaveAttribute("disabled");
  });

  test("Save button re-enables when onUserUpdate rejects", async () => {
    const onUserUpdateMock = vi.fn(() => Promise.reject());

    render(<GeneralForm initialValues={me} onUserUpdate={onUserUpdateMock} />);

    const nameInput = screen.getByLabelText("Account Name");
    const saveButton = screen.getByRole("button");

    await user.type(nameInput, "changed");
    await user.click(saveButton);

    await expect.poll(() => saveButton).not.toHaveAttribute("disabled");
  });

  test("Save button re-disables when values revert to initial", async () => {
    const onUserUpdate = () => Promise.resolve();

    render(<GeneralForm initialValues={me} onUserUpdate={onUserUpdate} />);

    const nameInput = screen.getByLabelText("Account Name");
    const saveButton = screen.getByRole("button");

    await user.type(nameInput, "x");
    expect(saveButton).not.toHaveAttribute("disabled");

    await user.clear(nameInput);
    await user.type(nameInput, name);
    expect(saveButton).toHaveAttribute("disabled");
  });
});
