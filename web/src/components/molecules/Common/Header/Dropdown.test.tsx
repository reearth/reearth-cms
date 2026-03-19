import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import Dropdown from "./Dropdown";

type Props = React.ComponentProps<typeof Dropdown>;

const user = userEvent.setup();

const buildProps = (overrides: Partial<Props> = {}): Props => ({
  items: [
    { key: "a", label: "Item A" },
    { key: "b", label: "Item B" },
  ],
  name: "Alice",
  profilePictureUrl: "https://example.com/avatar.png",
  personal: true,
  showName: true,
  showArrow: true,
  ...overrides,
});

const openDropdown = async () => {
  await user.click(screen.getByText("Alice"));
};

describe("Header Dropdown", () => {
  test("Renders avatar, name, and arrow when all options enabled", () => {
    render(<Dropdown {...buildProps()} />);

    expect(screen.getByText("Alice")).toBeVisible();
    expect(screen.getByRole("img", { name: "caret-down" })).toBeInTheDocument();
    expect(screen.getByAltText("User avatar")).toBeInTheDocument();
  });

  test("Hides name text when showName is false", () => {
    render(<Dropdown {...buildProps({ showName: false })} />);

    expect(screen.queryByText("Alice")).not.toBeInTheDocument();
  });

  test("Hides caret-down icon when showArrow is false", () => {
    render(<Dropdown {...buildProps({ showArrow: false })} />);

    expect(screen.queryByRole("img", { name: "caret-down" })).not.toBeInTheDocument();
  });

  test("personal: true renders circle shape and forwards profilePictureUrl", () => {
    render(<Dropdown {...buildProps({ personal: true })} />);

    const img = screen.getByAltText("User avatar");
    expect(img).toHaveAttribute("src", "https://example.com/avatar.png");
    expect(img.closest(".ant-avatar")).toHaveClass("ant-avatar-circle");
  });

  test("personal: false renders square shape with initial letter", () => {
    render(<Dropdown {...buildProps({ personal: false })} />);

    expect(screen.queryByAltText("User avatar")).not.toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("A").closest(".ant-avatar")).toHaveClass("ant-avatar-square");
  });

  test("Menu items render on trigger click", async () => {
    render(<Dropdown {...buildProps()} />);

    await openDropdown();

    expect(await screen.findByText("Item A")).toBeInTheDocument();
    expect(await screen.findByText("Item B")).toBeInTheDocument();
  });

  test("Menu item click fires onClick callback", async () => {
    const onClick = vi.fn();
    render(
      <Dropdown
        {...buildProps({
          items: [{ key: "a", label: "Item A", onClick }],
        })}
      />,
    );

    await openDropdown();
    await user.click(await screen.findByText("Item A"));

    expect(onClick).toHaveBeenCalled();
  });
});
