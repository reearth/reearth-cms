import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";

import MultiValueColoredTag from ".";

describe("MultiValueColoredTag", () => {
  const user = userEvent.setup();

  const tags = [
    { id: "1", name: "Red Tag", color: "RED" as const },
    { id: "2", name: "Blue Tag", color: "BLUE" as const },
  ];

  // The component's Props type intersects TextAreaProps & InputProps, creating
  // a conflicting `value` type. The component works correctly at runtime.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderTag = (overrides: Record<string, any> = {}) =>
    render(
      <MultiValueColoredTag
        // @ts-expect-error -- Props `value` type conflicts with TextAreaProps intersection
        value={tags}
        onChange={vi.fn()}
        errorIndexes={new Set<number>()}
        {...overrides}
      />,
    );

  test("renders existing tags", () => {
    renderTag();
    expect(screen.getByText("Red Tag")).toBeVisible();
    expect(screen.getByText("Blue Tag")).toBeVisible();
  });

  test("renders add button when not disabled", () => {
    renderTag();
    expect(screen.getByText("New")).toBeVisible();
  });

  test("hides add button when disabled", () => {
    renderTag({ disabled: true });
    expect(screen.queryByText("New")).not.toBeInTheDocument();
  });

  test("calls onChange with new tag when add is clicked", async () => {
    const onChange = vi.fn();
    renderTag({ onChange });
    await user.click(screen.getByText("New"));
    expect(onChange).toHaveBeenCalledWith([...tags, { color: "MAGENTA", name: "Tag" }]);
  });

  test("calls onChange without removed tag on delete click", async () => {
    const onChange = vi.fn();
    renderTag({ onChange });
    const deleteButtons = screen.getAllByRole("button", { name: "delete" });
    await user.click(deleteButtons[0]);
    expect(onChange).toHaveBeenCalledWith([tags[1]]);
  });

  test("hides delete buttons when disabled", () => {
    renderTag({ disabled: true });
    expect(screen.queryByRole("button", { name: "delete" })).not.toBeInTheDocument();
  });

  test("hides reorder buttons when disabled", () => {
    renderTag({ disabled: true });
    expect(screen.queryByRole("button", { name: "arrow-up" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "arrow-down" })).not.toBeInTheDocument();
  });

  test("disables up arrow for first tag", () => {
    renderTag();
    const upButtons = screen.getAllByRole("button", { name: "arrow-up" });
    expect(upButtons[0]).toBeDisabled();
  });

  test("disables down arrow for last tag", () => {
    renderTag();
    const downButtons = screen.getAllByRole("button", { name: "arrow-down" });
    expect(downButtons[downButtons.length - 1]).toBeDisabled();
  });

  test("calls onChange with reordered array when down arrow is clicked", async () => {
    const onChange = vi.fn();
    renderTag({ onChange });
    const downButtons = screen.getAllByRole("button", { name: "arrow-down" });
    await user.click(downButtons[0]);
    expect(onChange).toHaveBeenCalledWith([tags[1], tags[0]]);
  });

  test("renders empty state with add button", () => {
    renderTag({ value: [] });
    expect(screen.getByText("New")).toBeVisible();
  });
});
