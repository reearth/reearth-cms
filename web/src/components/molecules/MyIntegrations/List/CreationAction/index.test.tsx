import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, describe, vi } from "vitest";

import IntegrationCreationAction from ".";

describe("Integration creation action", () => {
  const user = userEvent.setup();

  const onIntegrationModalOpen = () => {};

  test("Create button is displayed successfully", () => {
    render(<IntegrationCreationAction onIntegrationModalOpen={onIntegrationModalOpen} />);

    expect(screen.getByRole("button", { name: "plus Create new integration" })).toBeVisible();
  });

  test("Modal open event is fired successfully", async () => {
    const onIntegrationModalOpenMock = vi.fn();

    render(<IntegrationCreationAction onIntegrationModalOpen={onIntegrationModalOpenMock} />);

    await user.click(screen.getByRole("button"));
    expect(onIntegrationModalOpenMock).toHaveBeenCalled();
  });
});
