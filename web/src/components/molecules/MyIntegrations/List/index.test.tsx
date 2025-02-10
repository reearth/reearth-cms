import { render, screen } from "@testing-library/react";
import { expect, test, describe } from "vitest";

import { Integration } from "@reearth-cms/components/molecules/MyIntegrations/types";

import MyIntegrationList from ".";

describe("My integrations list", () => {
  const name1 = "name1";
  const name2 = "name2";

  const integrations: Integration[] = [
    {
      id: "",
      name: name1,
      description: "",
      logoUrl: "",
      developerId: "",
      developer: {
        id: "",
        name: "",
        email: "",
      },
      iType: "Private",
      config: {},
    },
    {
      id: "",
      name: name2,
      description: "",
      logoUrl: "",
      developerId: "",
      developer: {
        id: "",
        name: "",
        email: "",
      },
      iType: "Private",
      config: {},
    },
  ];
  const handleIntegrationModalOpen = () => {
    return Promise.resolve();
  };
  const onIntegrationNavigate = () => {
    return Promise.resolve();
  };

  test("Integrations are displayed successfully", () => {
    render(
      <MyIntegrationList
        integrations={integrations}
        onIntegrationModalOpen={handleIntegrationModalOpen}
        onIntegrationNavigate={onIntegrationNavigate}
      />,
    );

    expect(screen.getByText(name1)).toBeVisible();
    expect(screen.getByText(name2)).toBeVisible();
  });
});
