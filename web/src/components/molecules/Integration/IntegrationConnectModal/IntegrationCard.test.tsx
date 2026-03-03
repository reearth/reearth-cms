import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import IntegrationCard from "./IntegrationCard";

describe("Integration card", () => {
  const user = userEvent.setup();

  const name = "name";
  const isSelected = false;
  const onClick = () => {};

  test("Name is diplayed successfully", async () => {
    render(<IntegrationCard isSelected={isSelected} name={name} onClick={onClick} />);

    expect(screen.getByText(name)).toBeVisible();
  });

  test("Clicking integration event is fired successfully", async () => {
    const onClickMock = vi.fn();
    render(<IntegrationCard isSelected={isSelected} name={name} onClick={onClickMock} />);

    await user.click(screen.getByTestId("integration"));
    expect(onClickMock).toHaveBeenCalled();
  });
});
