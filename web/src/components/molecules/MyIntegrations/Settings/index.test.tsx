import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import MyIntegrationSettings from ".";

describe("My integration general settings", () => {
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
  const updateIntegrationLoading = false;
  const regenerateLoading = false;
  const onIntegrationUpdate = () => {
    return Promise.resolve();
  };
  const onIntegrationDelete = () => {
    return Promise.resolve();
  };
  const onRegenerateToken = () => {
    return Promise.resolve();
  };

  test("Settings form and danger zone are displayed successfully", async () => {
    render(
      <MyIntegrationSettings
        integration={integration}
        onIntegrationDelete={onIntegrationDelete}
        onIntegrationUpdate={onIntegrationUpdate}
        onRegenerateToken={onRegenerateToken}
        regenerateLoading={regenerateLoading}
        updateIntegrationLoading={updateIntegrationLoading}
      />,
    );

    expect(screen.getByText("Integration Name")).toBeVisible();
    expect(screen.getByText("Danger Zone")).toBeVisible();
  });
});
