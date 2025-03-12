import { render, screen } from "@testing-library/react";
import { expect, test, describe } from "vitest";

import MyIntegrationSettings from ".";

describe("My integration general settings", () => {
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
        updateIntegrationLoading={updateIntegrationLoading}
        regenerateLoading={regenerateLoading}
        onIntegrationUpdate={onIntegrationUpdate}
        onIntegrationDelete={onIntegrationDelete}
        onRegenerateToken={onRegenerateToken}
      />,
    );

    expect(screen.getByText("Integration Name")).toBeVisible();
    expect(screen.getByText("Danger Zone")).toBeVisible();
  });
});
