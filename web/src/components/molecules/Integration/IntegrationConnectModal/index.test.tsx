import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import IntegrationConnectModal from ".";

describe("Integration connect modal", () => {
  const user = userEvent.setup();

  const integrations = [
    {
      id: "id",
      name: "name",
    },
  ];
  const open = true;
  const loading = false;
  const onClose = () => {};
  const onSubmit = () => {
    return Promise.resolve();
  };

  test("Integrations are displayed successfully", async () => {
    render(
      <IntegrationConnectModal
        integrations={[
          {
            id: "id1",
            name: "name1",
          },
          {
            id: "id2",
            name: "name2",
          },
        ]}
        loading={loading}
        onClose={onClose}
        onSubmit={onSubmit}
        open={open}
      />,
    );

    await expect.poll(() => screen.getByText("name1")).toBeVisible();
    expect(screen.getByText("name2")).toBeVisible();
  });

  test("Loading is displayed successfully", async () => {
    render(
      <IntegrationConnectModal
        integrations={integrations}
        loading={true}
        onClose={onClose}
        onSubmit={onSubmit}
        open={open}
      />,
    );
    await expect.poll(() => screen.getByLabelText("loading")).toBeVisible();
  });

  test("Connect button is toggled successfully", async () => {
    const { rerender } = render(
      <IntegrationConnectModal
        integrations={integrations}
        loading={loading}
        onClose={onClose}
        onSubmit={onSubmit}
        open={open}
      />,
    );

    const connectButton = screen.getByRole("button", { name: "Connect" });

    expect(connectButton).toBeDisabled();

    await user.click(screen.getByTestId("integration"));
    expect(connectButton).toBeEnabled();

    rerender(
      <IntegrationConnectModal
        integrations={integrations}
        loading={loading}
        onClose={onClose}
        onSubmit={onSubmit}
        open={false}
      />,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    rerender(
      <IntegrationConnectModal
        integrations={integrations}
        loading={loading}
        onClose={onClose}
        onSubmit={onSubmit}
        open={open}
      />,
    );

    expect(connectButton).toBeDisabled();
  });

  test("Clicking connect button event is fired successfully", async () => {
    const onSubmitMock = vi.fn();
    render(
      <IntegrationConnectModal
        integrations={integrations}
        loading={false}
        onClose={onClose}
        onSubmit={onSubmitMock}
        open={open}
      />,
    );

    await user.click(screen.getByTestId("integration"));
    await user.click(screen.getByRole("button", { name: "Connect" }));
    expect(onSubmitMock).toHaveBeenCalled();
  });
});
