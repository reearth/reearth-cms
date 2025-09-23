import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, describe, vi } from "vitest";

import IntegrationSettingsModal from ".";

describe("Integration settings modal", () => {
  const user = userEvent.setup();

  const name = "name";
  const description = "description";

  const selectedIntegration = {
    id: "id",
    name,
    description,
    role: "READER" as const,
  };
  const open = true;
  const loading = false;
  const onClose = () => {};
  const onSubmit = () => {
    return Promise.resolve();
  };

  test("Name, description, and roles are displayed successfully", async () => {
    render(
      <IntegrationSettingsModal
        selectedIntegration={selectedIntegration}
        open={open}
        loading={loading}
        onClose={onClose}
        onSubmit={onSubmit}
      />,
    );

    expect(screen.getByText(name)).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();
    expect(screen.getByText("Reader")).toBeInTheDocument();

    await user.click(screen.getByLabelText("Role"));
    expect(screen.getByText("Writer")).toBeInTheDocument();
    expect(screen.getByText("Maintainer")).toBeInTheDocument();
    expect(screen.getByText("Owner")).toBeInTheDocument();
  });

  test("Loading is displayed successfully", async () => {
    render(
      <IntegrationSettingsModal
        selectedIntegration={selectedIntegration}
        open={open}
        loading={true}
        onClose={onClose}
        onSubmit={onSubmit}
      />,
    );

    expect(screen.getByLabelText("loading")).toBeInTheDocument();
  });

  test("Save button is toggled successfully", async () => {
    const { rerender } = render(
      <IntegrationSettingsModal
        selectedIntegration={selectedIntegration}
        open={open}
        loading={loading}
        onClose={onClose}
        onSubmit={onSubmit}
      />,
    );

    const saveButton = screen.getByRole("button", { name: "Save" });

    expect(saveButton).toBeDisabled();

    await user.click(screen.getByLabelText("Role"));
    await user.click(screen.getByText("Writer"));

    expect(saveButton).toBeEnabled();

    rerender(
      <IntegrationSettingsModal
        selectedIntegration={selectedIntegration}
        open={false}
        loading={loading}
        onClose={onClose}
        onSubmit={onSubmit}
      />,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    rerender(
      <IntegrationSettingsModal
        selectedIntegration={selectedIntegration}
        open={open}
        loading={loading}
        onClose={onClose}
        onSubmit={onSubmit}
      />,
    );

    expect(screen.getAllByTitle("Reader")[0]).toBeInTheDocument();
    expect(saveButton).toBeDisabled();
  });

  test("Clicking save button event is fired successfully", async () => {
    const onSubmitMock = vi.fn();
    render(
      <IntegrationSettingsModal
        selectedIntegration={selectedIntegration}
        open={open}
        loading={loading}
        onClose={onClose}
        onSubmit={onSubmitMock}
      />,
    );

    await user.click(screen.getByLabelText("Role"));
    await user.click(screen.getByText("Writer"));
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onSubmitMock).toHaveBeenCalled();
  });
});
