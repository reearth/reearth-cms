import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { expect, test, describe, vi } from "vitest";

import { Integration } from "@reearth-cms/components/molecules/MyIntegrations/types";

import MyIntegrationCard from ".";

describe("My integrations list", () => {
  const user = userEvent.setup();

  const id = "id";
  const name = "name";
  const description = "description";

  const integration: Integration = {
    id,
    name,
    description,
    logoUrl: "",
    developerId: "",
    developer: {
      id: "",
      name: "",
      email: "",
    },
    iType: "Private",
    config: {},
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
