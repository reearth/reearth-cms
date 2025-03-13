import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { expect, test, describe } from "vitest";

import Webhook from ".";

describe("Webhook", () => {
  const user = userEvent.setup();

  const integration = {
    id: "",
    name: "",
    logoUrl: "",
    developerId: "",
    developer: {
      id: "",
      name: "",
      email: "",
    },
    iType: "Private" as const,
    config: {
      webhooks: [
        {
          id: "",
          name: "",
          url: "",
          active: true,
          secret: "",
          trigger: {},
        },
      ],
    },
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
        integration={integration}
        createWebhookLoading={createWebhookLoading}
        updateWebhookLoading={updateWebhookLoading}
        onWebhookCreate={onWebhookCreate}
        onWebhookDelete={onWebhookDelete}
        onWebhookUpdate={onWebhookUpdate}
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
