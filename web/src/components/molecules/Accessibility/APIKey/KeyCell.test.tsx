import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

vi.mock("@reearth-cms/components/atoms/Icon", () => ({
  default: ({ icon, onClick }: { icon: string; onClick?: () => void }) => (
    <span data-testid={`icon-${icon}`} onClick={onClick} />
  ),
}));

vi.mock("@reearth-cms/components/atoms/CopyButton", () => ({
  default: ({ copyable }: { copyable: { text: string } }) => (
    <span data-testid="copy-button" data-copy-text={copyable.text} />
  ),
}));

import KeyCell from "./KeyCell";

describe("KeyCell", () => {
  const user = userEvent.setup();

  test("renders password input as disabled", () => {
    render(<KeyCell apiKey="abc123" />);

    expect(screen.getByTestId("key")).toBeInTheDocument();
    expect(screen.getByDisplayValue("abc123")).toBeDisabled();
  });

  test("renders CopyButton with correct apiKey text", () => {
    render(<KeyCell apiKey="secret-key-xyz" />);

    expect(screen.getByTestId("copy-button")).toHaveAttribute("data-copy-text", "secret-key-xyz");
  });

  test("initially shows eyeInvisible icon", () => {
    render(<KeyCell apiKey="abc123" />);

    expect(screen.getByTestId("icon-eyeInvisible")).toBeInTheDocument();
    expect(screen.queryByTestId("icon-eye")).not.toBeInTheDocument();
  });

  test("toggles visibility icon on click", async () => {
    render(<KeyCell apiKey="abc123" />);

    await user.click(screen.getByTestId("icon-eyeInvisible"));
    expect(screen.getByTestId("icon-eye")).toBeInTheDocument();
    expect(screen.queryByTestId("icon-eyeInvisible")).not.toBeInTheDocument();

    await user.click(screen.getByTestId("icon-eye"));
    expect(screen.getByTestId("icon-eyeInvisible")).toBeInTheDocument();
    expect(screen.queryByTestId("icon-eye")).not.toBeInTheDocument();
  });
});
