import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, test, expect, vi } from "vitest";

import type { Group } from "@reearth-cms/components/molecules/Schema/types";

import GroupsList from "./GroupsList";

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

const makeGroup = (id: string, name: string, order = 0): Group => ({
  id,
  schemaId: `schema-${id}`,
  projectId: "project-1",
  name,
  description: "",
  key: name.toLowerCase(),
  schema: { id: `schema-${id}`, fields: [] },
  order,
});

const defaultProps = {
  groups: [makeGroup("g1", "Details"), makeGroup("g2", "Metadata")],
  collapsed: false,
  hasCreateRight: true,
  hasUpdateRight: true,
  onModalOpen: vi.fn(),
  onGroupSelect: vi.fn(),
  onUpdateGroupsOrder: vi.fn(),
};

describe("GroupsList", () => {
  const user = userEvent.setup();

  test("renders group names", () => {
    render(<GroupsList {...defaultProps} />);
    expect(screen.getByText("Details")).toBeVisible();
    expect(screen.getByText("Metadata")).toBeVisible();
  });

  test("renders GROUPS header", () => {
    render(<GroupsList {...defaultProps} />);
    expect(screen.getByText("GROUPS")).toBeVisible();
  });

  test("renders Add button", () => {
    render(<GroupsList {...defaultProps} />);
    expect(screen.getByText("Add")).toBeVisible();
  });

  test("disables Add button when hasCreateRight is false", () => {
    render(<GroupsList {...defaultProps} hasCreateRight={false} />);
    expect(screen.getByText("Add").closest("button")).toBeDisabled();
  });

  test("calls onModalOpen when Add button is clicked", async () => {
    const onModalOpen = vi.fn();
    render(<GroupsList {...defaultProps} onModalOpen={onModalOpen} />);
    await user.click(screen.getByText("Add"));
    expect(onModalOpen).toHaveBeenCalled();
  });

  test("calls onGroupSelect when group item is clicked", async () => {
    const onGroupSelect = vi.fn();
    render(<GroupsList {...defaultProps} onGroupSelect={onGroupSelect} />);
    await user.click(screen.getByText("Details"));
    expect(onGroupSelect).toHaveBeenCalledWith("g1");
  });

  test("highlights selected group", () => {
    render(<GroupsList {...defaultProps} selectedKey="g1" />);
    const menuItems = screen.getAllByRole("menuitem");
    const selectedItem = menuItems.find(item => item.classList.contains("ant-menu-item-selected"));
    expect(selectedItem).toBeDefined();
  });

  test("shows dot icons when collapsed", () => {
    render(<GroupsList {...defaultProps} collapsed />);
    expect(screen.queryByText("GROUPS")).not.toBeInTheDocument();
    expect(screen.queryByText("Details")).not.toBeInTheDocument();
  });

  test("renders empty state with no groups", () => {
    render(<GroupsList {...defaultProps} groups={[]} />);
    expect(screen.getByText("GROUPS")).toBeVisible();
  });
});
