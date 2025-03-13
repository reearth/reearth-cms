import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { expect, test, describe, vi } from "vitest";

import IntegrationCreationModal from ".";

describe("Integration creation modal", () => {
  const user = userEvent.setup();

  const open = true;
  const createLoading = false;
  const onClose = () => {};
  const onIntegrationCreate = () => {
    return Promise.resolve();
  };

  test("Name and description input are displayed successfully", async () => {
    render(
      <IntegrationCreationModal
        open={open}
        loading={createLoading}
        onClose={onClose}
        onIntegrationCreate={onIntegrationCreate}
      />,
    );

    await expect.poll(() => screen.getByLabelText("Integration Name")).toBeVisible();
    expect(screen.getByLabelText("Description")).toBeVisible();
  });

  test("Create event is fired successfully", async () => {
    const onIntegrationCreateMock = vi.fn();

    render(
      <IntegrationCreationModal
        open={open}
        loading={createLoading}
        onClose={onClose}
        onIntegrationCreate={onIntegrationCreateMock}
      />,
    );

    const nameInput = screen.getByLabelText("Integration Name");

    await user.click(nameInput);
    await user.type(nameInput, "name");
    await user.click(screen.getByRole("button", { name: "Create" }));
    expect(onIntegrationCreateMock).toHaveBeenCalled();
  });

  test("Create button is toggled successfully", async () => {
    render(
      <IntegrationCreationModal
        open={open}
        loading={createLoading}
        onClose={onClose}
        onIntegrationCreate={onIntegrationCreate}
      />,
    );

    const nameInput = screen.getByLabelText("Integration Name");
    const createButton = screen.getByRole("button", { name: "Create" });
    expect(createButton).toBeDisabled();

    await user.click(nameInput);
    await user.type(nameInput, "name");
    expect(createButton).toBeEnabled();

    await user.clear(nameInput);
    expect(createButton).toBeDisabled();
  });

  test("Loading is displayed and cancel button is disabled successfully", async () => {
    render(
      <IntegrationCreationModal
        open={open}
        loading={true}
        onClose={onClose}
        onIntegrationCreate={onIntegrationCreate}
      />,
    );

    await expect.poll(() => screen.getByRole("button", { name: "loading Create" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  });
});
