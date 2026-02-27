import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { Integration } from "@reearth-cms/components/molecules/MyIntegrations/types";

import MyIntegrationList from ".";

describe("My integrations list", () => {
  const name1 = "name1";
  const name2 = "name2";

  const integrations: Integration[] = [
    {
      config: {},
      description: "",
      developer: {
        email: "",
        id: "",
        name: "",
      },
      developerId: "",
      id: "",
      iType: "Private",
      logoUrl: "",
      name: name1,
    },
    {
      config: {},
      description: "",
      developer: {
        email: "",
        id: "",
        name: "",
      },
      developerId: "",
      id: "",
      iType: "Private",
      logoUrl: "",
      name: name2,
    },
  ];
  const onIntegrationModalOpen = () => {};
  const onIntegrationNavigate = () => {};

  test("Integrations are displayed successfully", () => {
    render(
      <MyIntegrationList
        integrations={integrations}
        onIntegrationModalOpen={onIntegrationModalOpen}
        onIntegrationNavigate={onIntegrationNavigate}
      />,
    );

    expect(screen.getByText(name1)).toBeVisible();
    expect(screen.getByText(name2)).toBeVisible();
    expect(screen.getByRole("button")).toBeVisible();
  });
});
