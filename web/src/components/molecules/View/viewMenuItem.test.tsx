import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { View } from "@reearth-cms/components/molecules/View/types";

import ViewsMenuItem from "./viewMenuItem";

type Props = React.ComponentProps<typeof ViewsMenuItem>;

const MOCK_VIEW: View = {
  id: "view-1",
  name: "Test View",
  modelId: "model-1",
  projectId: "proj-1",
  order: 0,
};

const DEFAULT_PROPS: Props = {
  view: MOCK_VIEW,
  hasUpdateRight: true,
  hasDeleteRight: true,
  onViewRenameModalOpen: vi.fn(),
  onUpdate: vi.fn(),
  onDelete: vi.fn(),
};

function renderMenuItem(overrides: Partial<Props> = {}) {
  return render(<ViewsMenuItem {...DEFAULT_PROPS} {...overrides} />);
}

describe("ViewsMenuItem", () => {
  test("renders view name", () => {
    renderMenuItem();
    expect(screen.getByText("Test View")).toBeInTheDocument();
  });

  test("shows rename and remove options in dropdown menu", async () => {
    renderMenuItem();
    const moreIcon = screen.getByRole("img", { name: "more" });
    await userEvent.click(moreIcon);

    expect(screen.getByText("Rename")).toBeInTheDocument();
    expect(screen.getByText("Remove View")).toBeInTheDocument();
    expect(screen.getByText("Update View")).toBeInTheDocument();
  });

  test("calls onViewRenameModalOpen when rename is clicked", async () => {
    const onViewRenameModalOpen = vi.fn();
    renderMenuItem({ onViewRenameModalOpen });

    const moreIcon = screen.getByRole("img", { name: "more" });
    await userEvent.click(moreIcon);
    await userEvent.click(screen.getByText("Rename"));

    expect(onViewRenameModalOpen).toHaveBeenCalledWith(MOCK_VIEW);
  });

  test("shows confirmation dialog on remove click", async () => {
    renderMenuItem();
    const moreIcon = screen.getByRole("img", { name: "more" });
    await userEvent.click(moreIcon);
    await userEvent.click(screen.getByText("Remove View"));

    expect(
      screen.getByText("Are you sure you want to delete this view?"),
    ).toBeInTheDocument();
  });

  test("calls onUpdate when Update View is clicked", async () => {
    const onUpdate = vi.fn();
    renderMenuItem({ onUpdate });

    const moreIcon = screen.getByRole("img", { name: "more" });
    await userEvent.click(moreIcon);
    await userEvent.click(screen.getByText("Update View"));

    expect(onUpdate).toHaveBeenCalledWith(MOCK_VIEW.id, MOCK_VIEW.name);
  });

  test("disables menu items based on permissions", async () => {
    renderMenuItem({ hasUpdateRight: false, hasDeleteRight: false });

    const moreIcon = screen.getByRole("img", { name: "more" });
    await userEvent.click(moreIcon);

    const renameItem = screen.getByText("Rename").closest("li");
    expect(renameItem).toHaveClass("ant-dropdown-menu-item-disabled");
  });

  test("calls onDelete with view id when confirming removal", async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    renderMenuItem({ onDelete });

    const moreIcon = screen.getByRole("img", { name: "more" });
    await userEvent.click(moreIcon);
    await userEvent.click(screen.getByText("Remove View"));

    const removeButtons = screen.getAllByRole("button", { name: "Remove" });
    await userEvent.click(removeButtons[removeButtons.length - 1]);

    expect(onDelete).toHaveBeenCalledWith("view-1");
  });

  test("disables all three menu items when both rights are false", async () => {
    renderMenuItem({ hasUpdateRight: false, hasDeleteRight: false });

    const moreIcon = screen.getByRole("img", { name: "more" });
    await userEvent.click(moreIcon);

    const updateItem = screen.getByText("Update View").closest("li");
    const renameItem = screen.getByText("Rename").closest("li");
    const removeItem = screen.getByText("Remove View").closest("li");
    expect(updateItem).toHaveClass("ant-dropdown-menu-item-disabled");
    expect(renameItem).toHaveClass("ant-dropdown-menu-item-disabled");
    expect(removeItem).toHaveClass("ant-dropdown-menu-item-disabled");
  });

  test("Update View disabled but Rename and Remove enabled when hasDeleteRight is false", async () => {
    renderMenuItem({ hasUpdateRight: true, hasDeleteRight: false });

    const moreIcon = screen.getByRole("img", { name: "more" });
    await userEvent.click(moreIcon);

    const updateItem = screen.getByText("Update View").closest("li");
    const renameItem = screen.getByText("Rename").closest("li");
    const removeItem = screen.getByText("Remove View").closest("li");
    expect(updateItem).toHaveClass("ant-dropdown-menu-item-disabled");
    expect(renameItem).not.toHaveClass("ant-dropdown-menu-item-disabled");
    expect(removeItem).not.toHaveClass("ant-dropdown-menu-item-disabled");
  });
});
