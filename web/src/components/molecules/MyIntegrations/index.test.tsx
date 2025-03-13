import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { expect, test, describe } from "vitest";

import { Integration } from "@reearth-cms/components/molecules/MyIntegrations/types";

import MyIntegrationsWrapper from ".";

describe("My integrations", () => {
  const user = userEvent.setup();

  const integrations: Integration[] = [];
  const onIntegrationNavigate = () => {};
  const createLoading = false;
  const onIntegrationCreate = () => {
    return Promise.resolve();
  };

  test("Create modal is displayed successfully", async () => {
    render(
      <MyIntegrationsWrapper
        integrations={integrations}
        onIntegrationNavigate={onIntegrationNavigate}
        createLoading={createLoading}
        onIntegrationCreate={onIntegrationCreate}
      />,
    );

    await user.click(screen.getByRole("button", { name: "plus Create new integration" }));
    await expect.poll(() => screen.getByRole("dialog")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
