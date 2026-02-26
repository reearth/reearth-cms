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
});
