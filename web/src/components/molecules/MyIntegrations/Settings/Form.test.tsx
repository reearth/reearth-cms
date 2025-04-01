import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { expect, test, describe, vi } from "vitest";

import MyIntegrationForm from "./Form";

describe("Integration creation modal", () => {
  const user = userEvent.setup();

  const integration = {
    name: "name",
    description: "description",
    logoUrl: "logoUrl",
    config: {
      token: "token",
    },
  };
  const updateIntegrationLoading = false;
  const regenerateLoading = false;
  const onIntegrationUpdate = () => {
    return Promise.resolve();
  };
  const onRegenerateToken = () => {
    return Promise.resolve();
  };

  test("Name, description, token, and code example are displayed successfully", async () => {
    const api = "http://localhost:8080/api";
    vi.stubGlobal("REEARTH_CONFIG", { api });
    render(
      <MyIntegrationForm
        integration={integration}
        updateIntegrationLoading={updateIntegrationLoading}
        regenerateLoading={regenerateLoading}
        onIntegrationUpdate={onIntegrationUpdate}
        onRegenerateToken={onRegenerateToken}
      />,
    );

    expect(screen.getByLabelText("Integration Name")).toHaveDisplayValue(integration.name);
    expect(screen.getByLabelText("Description")).toHaveDisplayValue(integration.description);
    expect(screen.getByDisplayValue(integration.config.token)).toBeVisible();
    expect(screen.getByText(new RegExp("curl --location --request POST"))).toBeVisible();
    expect(screen.getByText(new RegExp(api))).toBeVisible();
    expect(screen.getByText(new RegExp("--header 'Authorization: Bearer '"))).toBeVisible();
  });

  test("Update and regenerate loading is displayed successfully", async () => {
    render(
      <MyIntegrationForm
        integration={integration}
        updateIntegrationLoading={true}
        regenerateLoading={true}
        onIntegrationUpdate={onIntegrationUpdate}
        onRegenerateToken={onRegenerateToken}
      />,
    );

    expect(screen.getByRole("button", { name: "loading Re-generate" })).toBeVisible();
    expect(screen.getByRole("button", { name: "loading Save" })).toBeVisible();
  });

  test("Visibility of token is toggled successfully", async () => {
    render(
      <MyIntegrationForm
        integration={integration}
        updateIntegrationLoading={updateIntegrationLoading}
        regenerateLoading={regenerateLoading}
        onIntegrationUpdate={onIntegrationUpdate}
        onRegenerateToken={onRegenerateToken}
      />,
    );

    expect(screen.getByDisplayValue(integration.config.token)).toHaveAttribute("type", "password");

    await user.click(screen.getByLabelText("eye-invisible"));
    expect(screen.getByDisplayValue(integration.config.token)).toHaveAttribute("type", "text");

    await user.click(screen.getByLabelText("eye"));
    expect(screen.getByDisplayValue(integration.config.token)).toHaveAttribute("type", "password");
  });

  test("Regenerate token event is fired successfully", async () => {
    const onRegenerateTokenMock = vi.fn();

    render(
      <MyIntegrationForm
        integration={integration}
        updateIntegrationLoading={updateIntegrationLoading}
        regenerateLoading={regenerateLoading}
        onIntegrationUpdate={onIntegrationUpdate}
        onRegenerateToken={onRegenerateTokenMock}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Re-generate" }));
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(onRegenerateTokenMock).toHaveBeenCalled();
  });

  test("Save button is toggled successfully", async () => {
    render(
      <MyIntegrationForm
        integration={integration}
        updateIntegrationLoading={updateIntegrationLoading}
        regenerateLoading={regenerateLoading}
        onIntegrationUpdate={onIntegrationUpdate}
        onRegenerateToken={onRegenerateToken}
      />,
    );

    const saveButton = screen.getByRole("button", { name: "Save" });
    const nameInput = screen.getByLabelText("Integration Name");
    const descriptionInput = screen.getByLabelText("Description");
    expect(saveButton).toBeDisabled();

    await user.click(nameInput);
    await user.type(nameInput, "update");
    expect(saveButton).toBeEnabled();

    await user.clear(nameInput);
    expect(nameInput).toBeInvalid();
    expect(saveButton).toBeDisabled();

    await user.type(nameInput, integration.name);
    expect(saveButton).toBeDisabled();

    await user.click(descriptionInput);
    await user.type(descriptionInput, "update");
    expect(saveButton).toBeEnabled();

    await user.clear(descriptionInput);
    expect(saveButton).toBeEnabled();

    await user.type(descriptionInput, integration.description);
    expect(saveButton).toBeDisabled();
  });

  test("Update event is fired successfully", async () => {
    const onIntegrationUpdateMock = vi.fn();

    render(
      <MyIntegrationForm
        integration={integration}
        updateIntegrationLoading={updateIntegrationLoading}
        regenerateLoading={regenerateLoading}
        onIntegrationUpdate={onIntegrationUpdateMock}
        onRegenerateToken={onRegenerateToken}
      />,
    );

    const nameInput = screen.getByLabelText("Integration Name");

    await user.type(nameInput, "update");
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onIntegrationUpdateMock).toHaveBeenCalled();
  });
});
