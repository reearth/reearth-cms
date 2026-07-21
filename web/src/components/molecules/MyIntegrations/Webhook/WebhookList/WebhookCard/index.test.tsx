import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { expect, test, describe, vi } from "vitest";

import WebhookCard from ".";

describe("Webhook card", () => {
  const user = userEvent.setup();

  const id = "id";
  const name = "name";
  const url = "url";

  const webhook = {
    id,
    name,
    url,
    active: false,
    secret: "",
    trigger: {},
  };
  const onWebhookDelete = () => {
    return new Promise<void>(resolve => {
      setTimeout(() => {
        resolve();
      }, 100);
    });
  };
  const onWebhookUpdate = async () => {
    return new Promise<void>(resolve => {
      setTimeout(() => {
        resolve();
      }, 100);
    });
  };
  const onWebhookSelect = () => {};

  test("Name, url, status, setting button, and delete button are displayed successfully", async () => {
    render(
      <WebhookCard
        webhook={webhook}
        onWebhookDelete={onWebhookDelete}
        onWebhookUpdate={onWebhookUpdate}
        onWebhookSelect={onWebhookSelect}
      />,
    );

    expect(screen.getByText(name)).toBeVisible();
    expect(screen.getByText(url)).toBeVisible();
    expect(screen.getByText("OFF")).toBeVisible();
    expect(screen.getByRole("switch", { checked: false })).toBeVisible();
    expect(screen.getByRole("button", { name: "setting" })).toBeVisible();
    expect(screen.getByRole("button", { name: "delete" })).toBeVisible();
  });

  test("Update active status event is fired successfully", async () => {
    const onWebhookUpdateMock = vi.fn(onWebhookUpdate);
    const { rerender } = render(
      <WebhookCard
        webhook={webhook}
        onWebhookDelete={onWebhookDelete}
        onWebhookUpdate={onWebhookUpdateMock}
        onWebhookSelect={onWebhookSelect}
      />,
    );

    await user.click(screen.getByRole("switch"));
    expect(screen.getByLabelText("loading")).toBeVisible();
    webhook.active = true;
    expect(onWebhookUpdateMock).toHaveBeenCalledWith(webhook);

    rerender(
      <WebhookCard
        webhook={webhook}
        onWebhookDelete={onWebhookDelete}
        onWebhookUpdate={onWebhookUpdateMock}
        onWebhookSelect={onWebhookSelect}
      />,
    );
    await expect.poll(() => screen.queryByLabelText("loading")).not.toBeInTheDocument();
    expect(screen.getByText("ON")).toBeVisible();
    expect(screen.getByRole("switch", { checked: true })).toBeVisible();
  });

  test("Select webhook event is fired successfully", async () => {
    const onWebhookSettingsMock = vi.fn();
    render(
      <WebhookCard
        webhook={webhook}
        onWebhookDelete={onWebhookDelete}
        onWebhookUpdate={onWebhookUpdate}
        onWebhookSelect={onWebhookSettingsMock}
      />,
    );

    await user.click(screen.getByRole("button", { name: "setting" }));
    expect(onWebhookSettingsMock).toHaveBeenCalledWith(id);
  });

  test("Delete webhook event is fired successfully", async () => {
    const onWebhookDeleteMock = vi.fn(onWebhookDelete);
    render(
      <WebhookCard
        webhook={webhook}
        onWebhookDelete={onWebhookDeleteMock}
        onWebhookUpdate={onWebhookUpdate}
        onWebhookSelect={onWebhookSelect}
      />,
    );

    await user.click(screen.getByRole("button", { name: "delete" }));
    expect(screen.getByLabelText("loading")).toBeVisible();
    expect(onWebhookDeleteMock).toHaveBeenCalledWith(id);
    await expect.poll(() => screen.queryByLabelText("loading")).not.toBeInTheDocument();
  });
});
