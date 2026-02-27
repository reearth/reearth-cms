import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, test } from "vitest";

import Webhook from ".";

describe("Webhook", () => {
  const user = userEvent.setup();

  const integration = {
    config: {
      webhooks: [
        {
          active: true,
          id: "",
          name: "",
          secret: "",
          trigger: {},
          url: "",
        },
      ],
    },
    developer: {
      email: "",
      id: "",
      name: "",
    },
    developerId: "",
    id: "",
    iType: "Private" as const,
    logoUrl: "",
    name: "",
  };
  const createWebhookLoading = false;
  const updateWebhookLoading = false;

  const onWebhookCreate = () => {
    return Promise.resolve();
  };
  const onWebhookDelete = () => {
    return Promise.resolve();
  };
  const onWebhookUpdate = () => {
    return Promise.resolve();
  };

  test("Toggle webhook form successfully", async () => {
    render(
      <Webhook
        createWebhookLoading={createWebhookLoading}
        integration={integration}
        onWebhookCreate={onWebhookCreate}
        onWebhookDelete={onWebhookDelete}
        onWebhookUpdate={onWebhookUpdate}
        updateWebhookLoading={updateWebhookLoading}
      />,
    );

    const settingButton = screen.getByRole("button", { name: "setting" });
    await expect.poll(() => settingButton).toBeVisible();
    expect(screen.queryByRole("button", { name: "arrow-left" })).not.toBeInTheDocument();

    await user.click(settingButton);
    expect(settingButton).not.toBeInTheDocument();

    const backButton = screen.getByRole("button", { name: "arrow-left" });
    await user.click(backButton);
    expect(backButton).not.toBeInTheDocument();
    await expect.poll(() => screen.getByRole("button", { name: "setting" })).toBeVisible();
  });
});
