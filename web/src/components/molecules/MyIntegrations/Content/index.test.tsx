import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { expect, test, describe, vi } from "vitest";

import MyIntegrationContent from ".";

describe("Integration creation modal", () => {
  const user = userEvent.setup();

  const loading = false;
  const name = "name";
  const integration = {
    id: "",
    name,
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
  const updateIntegrationLoading = false;
  const regenerateLoading = false;
  const createWebhookLoading = false;
  const updateWebhookLoading = false;
  const onIntegrationUpdate = () => {
    return Promise.resolve();
  };
  const onIntegrationDelete = () => {
    return Promise.resolve();
  };
  const onRegenerateToken = () => {
    return Promise.resolve();
  };
  const onWebhookCreate = () => {
    return Promise.resolve();
  };
  const onWebhookDelete = () => {
    return Promise.resolve();
  };
  const onWebhookUpdate = () => {
    return Promise.resolve();
  };
  const onIntegrationHeaderBack = () => {};

  test("Title and tabs are displayed successfully", async () => {
    render(
      <MyIntegrationContent
        loading={loading}
        integration={integration}
        updateIntegrationLoading={updateIntegrationLoading}
        regenerateLoading={regenerateLoading}
        createWebhookLoading={createWebhookLoading}
        updateWebhookLoading={updateWebhookLoading}
        onIntegrationUpdate={onIntegrationUpdate}
        onIntegrationDelete={onIntegrationDelete}
        onRegenerateToken={onRegenerateToken}
        onWebhookCreate={onWebhookCreate}
        onWebhookDelete={onWebhookDelete}
        onWebhookUpdate={onWebhookUpdate}
        onIntegrationHeaderBack={onIntegrationHeaderBack}
      />,
    );

    expect(screen.getByText(`My Integration / ${name}`)).toBeVisible();
    expect(screen.getByRole("tab", { name: "General", selected: true })).toBeVisible();
    expect(screen.getByRole("tab", { name: "Webhook", selected: false })).toBeVisible();
    expect(screen.getByText("Integration Name")).toBeVisible();

    await user.click(screen.getByRole("tab", { name: "Webhook" }));
    expect(screen.getByRole("button", { name: "plus New Webhook" })).toBeVisible();
  });

  test("Loading is displayed successfully", async () => {
    render(
      <MyIntegrationContent
        loading={true}
        integration={integration}
        updateIntegrationLoading={updateIntegrationLoading}
        regenerateLoading={regenerateLoading}
        createWebhookLoading={createWebhookLoading}
        updateWebhookLoading={updateWebhookLoading}
        onIntegrationUpdate={onIntegrationUpdate}
        onIntegrationDelete={onIntegrationDelete}
        onRegenerateToken={onRegenerateToken}
        onWebhookCreate={onWebhookCreate}
        onWebhookDelete={onWebhookDelete}
        onWebhookUpdate={onWebhookUpdate}
        onIntegrationHeaderBack={onIntegrationHeaderBack}
      />,
    );

    expect(screen.getByTestId("loading")).toBeVisible();
  });

  test("Not found is displayed successfully", async () => {
    render(
      <MyIntegrationContent
        loading={loading}
        integration={undefined}
        updateIntegrationLoading={updateIntegrationLoading}
        regenerateLoading={regenerateLoading}
        createWebhookLoading={createWebhookLoading}
        updateWebhookLoading={updateWebhookLoading}
        onIntegrationUpdate={onIntegrationUpdate}
        onIntegrationDelete={onIntegrationDelete}
        onRegenerateToken={onRegenerateToken}
        onWebhookCreate={onWebhookCreate}
        onWebhookDelete={onWebhookDelete}
        onWebhookUpdate={onWebhookUpdate}
        onIntegrationHeaderBack={onIntegrationHeaderBack}
      />,
    );

    expect(screen.getByText("404")).toBeVisible();
  });

  test("Back event is displayed successfully", async () => {
    const onBackMock = vi.fn();

    render(
      <MyIntegrationContent
        loading={loading}
        integration={integration}
        updateIntegrationLoading={updateIntegrationLoading}
        regenerateLoading={regenerateLoading}
        createWebhookLoading={createWebhookLoading}
        updateWebhookLoading={updateWebhookLoading}
        onIntegrationUpdate={onIntegrationUpdate}
        onIntegrationDelete={onIntegrationDelete}
        onRegenerateToken={onRegenerateToken}
        onWebhookCreate={onWebhookCreate}
        onWebhookDelete={onWebhookDelete}
        onWebhookUpdate={onWebhookUpdate}
        onIntegrationHeaderBack={onBackMock}
      />,
    );

    await user.click(screen.getByLabelText("arrow-left"));
    expect(onBackMock).toHaveBeenCalled();
  });
});
