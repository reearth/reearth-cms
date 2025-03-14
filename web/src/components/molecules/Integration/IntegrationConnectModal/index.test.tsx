import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, describe, vi } from "vitest";

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
        open={open}
        loading={loading}
        onClose={onClose}
        onSubmit={onSubmit}
      />,
    );

    await expect.poll(() => screen.getByText("name1")).toBeVisible();
    expect(screen.getByText("name2")).toBeVisible();
  });

  test("Loading is displayed successfully", async () => {
    render(
      <IntegrationConnectModal
        integrations={integrations}
        open={open}
        loading={true}
        onClose={onClose}
        onSubmit={onSubmit}
      />,
    );
    await expect.poll(() => screen.getByLabelText("loading")).toBeVisible();
  });

  test("Connect button is toggled successfully", async () => {
    const { rerender } = render(
      <IntegrationConnectModal
        integrations={integrations}
        open={open}
        loading={loading}
        onClose={onClose}
        onSubmit={onSubmit}
      />,
    );

    const connectButton = screen.getByRole("button", { name: "Connect" });

    expect(connectButton).toBeDisabled();

    await user.click(screen.getByTestId("integration"));
    expect(connectButton).toBeEnabled();

    rerender(
      <IntegrationConnectModal
        integrations={integrations}
        open={false}
        loading={loading}
        onClose={onClose}
        onSubmit={onSubmit}
      />,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    rerender(
      <IntegrationConnectModal
        integrations={integrations}
        open={open}
        loading={loading}
        onClose={onClose}
        onSubmit={onSubmit}
      />,
    );

    expect(connectButton).toBeDisabled();
  });

  test("Clicking connect button event is fired successfully", async () => {
    const onSubmitMock = vi.fn();
    render(
      <IntegrationConnectModal
        integrations={integrations}
        open={open}
        loading={false}
        onClose={onClose}
        onSubmit={onSubmitMock}
      />,
    );

    await user.click(screen.getByTestId("integration"));
    await user.click(screen.getByRole("button", { name: "Connect" }));
    expect(onSubmitMock).toHaveBeenCalled();
  });
});
