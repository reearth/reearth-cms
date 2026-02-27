import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import MyIntegrationContent from ".";

describe("Integration creation modal", () => {
  const user = userEvent.setup();

  const loading = false;
  const name = "name";
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
    name,
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
        createWebhookLoading={createWebhookLoading}
        integration={integration}
        loading={loading}
        onIntegrationDelete={onIntegrationDelete}
        onIntegrationHeaderBack={onIntegrationHeaderBack}
        onIntegrationUpdate={onIntegrationUpdate}
        onRegenerateToken={onRegenerateToken}
        onWebhookCreate={onWebhookCreate}
        onWebhookDelete={onWebhookDelete}
        onWebhookUpdate={onWebhookUpdate}
        regenerateLoading={regenerateLoading}
        updateIntegrationLoading={updateIntegrationLoading}
        updateWebhookLoading={updateWebhookLoading}
      />,
    );

    expect(screen.getByText(`My Integration / ${name}`)).toBeVisible();
    expect(screen.getByRole("tab", { name: "General", selected: true })).toBeVisible();
    expect(screen.getByRole("tab", { name: "Webhook", selected: false })).toBeVisible();
    expect(screen.getByText("Integration Name")).toBeVisible();

    await user.click(screen.getByRole("tab", { name: "Webhook" }));
    expect(screen.getByRole("button", { name: "plusNew Webhook" })).toBeVisible();
  });

  test("Loading is displayed successfully", async () => {
    render(
      <MyIntegrationContent
        createWebhookLoading={createWebhookLoading}
        integration={integration}
        loading={true}
        onIntegrationDelete={onIntegrationDelete}
        onIntegrationHeaderBack={onIntegrationHeaderBack}
        onIntegrationUpdate={onIntegrationUpdate}
        onRegenerateToken={onRegenerateToken}
        onWebhookCreate={onWebhookCreate}
        onWebhookDelete={onWebhookDelete}
        onWebhookUpdate={onWebhookUpdate}
        regenerateLoading={regenerateLoading}
        updateIntegrationLoading={updateIntegrationLoading}
        updateWebhookLoading={updateWebhookLoading}
      />,
    );

    expect(screen.getByTestId("loading")).toBeVisible();
  });

  test("Not found is displayed successfully", async () => {
    render(
      <MyIntegrationContent
        createWebhookLoading={createWebhookLoading}
        integration={undefined}
        loading={loading}
        onIntegrationDelete={onIntegrationDelete}
        onIntegrationHeaderBack={onIntegrationHeaderBack}
        onIntegrationUpdate={onIntegrationUpdate}
        onRegenerateToken={onRegenerateToken}
        onWebhookCreate={onWebhookCreate}
        onWebhookDelete={onWebhookDelete}
        onWebhookUpdate={onWebhookUpdate}
        regenerateLoading={regenerateLoading}
        updateIntegrationLoading={updateIntegrationLoading}
        updateWebhookLoading={updateWebhookLoading}
      />,
    );

    expect(screen.getByText("404")).toBeVisible();
  });

  test("Back event is displayed successfully", async () => {
    const onBackMock = vi.fn();

    render(
      <MyIntegrationContent
        createWebhookLoading={createWebhookLoading}
        integration={integration}
        loading={loading}
        onIntegrationDelete={onIntegrationDelete}
        onIntegrationHeaderBack={onBackMock}
        onIntegrationUpdate={onIntegrationUpdate}
        onRegenerateToken={onRegenerateToken}
        onWebhookCreate={onWebhookCreate}
        onWebhookDelete={onWebhookDelete}
        onWebhookUpdate={onWebhookUpdate}
        regenerateLoading={regenerateLoading}
        updateIntegrationLoading={updateIntegrationLoading}
        updateWebhookLoading={updateWebhookLoading}
      />,
    );

    await user.click(screen.getByLabelText("arrow-left"));
    expect(onBackMock).toHaveBeenCalled();
  });
});
