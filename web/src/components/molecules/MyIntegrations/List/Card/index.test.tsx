import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { Integration } from "@reearth-cms/components/molecules/MyIntegrations/types";

import MyIntegrationCard from ".";

describe("My integrations list", () => {
  const user = userEvent.setup();

  const id = "id";
  const name = "name";
  const description = "description";

  const integration: Integration = {
    config: {},
    description,
    developer: {
      email: "",
      id: "",
      name: "",
    },
    developerId: "",
    id,
    iType: "Private",
    logoUrl: "",
    name,
  };
  const onIntegrationNavigate = () => {};

  test("Name and description are displayed successfully", () => {
    render(
      <MyIntegrationCard integration={integration} onIntegrationNavigate={onIntegrationNavigate} />,
    );

    expect(screen.getByText(name)).toBeVisible();
    expect(screen.getByText(description)).toBeVisible();
  });

  test("Navigation event is fired successfully", async () => {
    const onIntegrationNavigateMock = vi.fn();
    render(
      <MyIntegrationCard
        integration={integration}
        onIntegrationNavigate={onIntegrationNavigateMock}
      />,
    );

    await user.click(screen.getByRole("link"));
    expect(onIntegrationNavigateMock).toHaveBeenCalledWith(id);
  });
});
