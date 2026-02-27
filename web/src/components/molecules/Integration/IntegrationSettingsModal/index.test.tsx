import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import IntegrationSettingsModal from ".";

describe("Integration settings modal", () => {
  const user = userEvent.setup();

  const name = "name";
  const description = "description";

  const selectedIntegration = {
    description,
    id: "id",
    name,
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
        loading={loading}
        onClose={onClose}
        onSubmit={onSubmit}
        open={open}
        selectedIntegration={selectedIntegration}
      />,
    );

    await expect.poll(() => screen.getByText(name)).toBeVisible();
    expect(screen.getByText(description)).toBeVisible();
    expect(screen.getByText("Reader")).toBeVisible();

    await user.click(screen.getByLabelText("Role"));
    await expect.poll(() => screen.getByText("Writer")).toBeVisible();
    expect(screen.getByText("Maintainer")).toBeVisible();
    expect(screen.getByText("Owner")).toBeVisible();
  });

  test("Loading is displayed successfully", async () => {
    render(
      <IntegrationSettingsModal
        loading={true}
        onClose={onClose}
        onSubmit={onSubmit}
        open={open}
        selectedIntegration={selectedIntegration}
      />,
    );

    await expect.poll(() => screen.getByLabelText("loading")).toBeVisible();
  });

  test("Save button is toggled successfully", async () => {
    const { rerender } = render(
      <IntegrationSettingsModal
        loading={loading}
        onClose={onClose}
        onSubmit={onSubmit}
        open={open}
        selectedIntegration={selectedIntegration}
      />,
    );

    const saveButton = screen.getByRole("button", { name: "Save" });

    expect(saveButton).toBeDisabled();

    await user.click(screen.getByLabelText("Role"));
    await user.click(screen.getByText("Writer"));

    expect(saveButton).toBeEnabled();

    rerender(
      <IntegrationSettingsModal
        loading={loading}
        onClose={onClose}
        onSubmit={onSubmit}
        open={false}
        selectedIntegration={selectedIntegration}
      />,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    rerender(
      <IntegrationSettingsModal
        loading={loading}
        onClose={onClose}
        onSubmit={onSubmit}
        open={open}
        selectedIntegration={selectedIntegration}
      />,
    );

    await expect.poll(() => screen.getAllByTitle("Reader")[0]).toBeVisible();
    expect(saveButton).toBeDisabled();
  });

  test("Clicking save button event is fired successfully", async () => {
    const onSubmitMock = vi.fn();
    render(
      <IntegrationSettingsModal
        loading={loading}
        onClose={onClose}
        onSubmit={onSubmitMock}
        open={open}
        selectedIntegration={selectedIntegration}
      />,
    );

    await user.click(screen.getByLabelText("Role"));
    await user.click(screen.getByText("Writer"));
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onSubmitMock).toHaveBeenCalled();
  });
});
