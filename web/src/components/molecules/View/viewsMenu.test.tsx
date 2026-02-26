import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { View } from "@reearth-cms/components/molecules/View/types";

import ViewsMenuMolecule from "./viewsMenu";

type Props = React.ComponentProps<typeof ViewsMenuMolecule>;

const MOCK_VIEWS: View[] = [
  { id: "v1", name: "View A", modelId: "m1", projectId: "p1", order: 0 },
  { id: "v2", name: "View B", modelId: "m1", projectId: "p1", order: 1 },
];

const DEFAULT_PROPS: Props = {
  views: MOCK_VIEWS,
  currentView: { id: "v1", name: "View A" },
  onViewRenameModalOpen: vi.fn(),
  onViewCreateModalOpen: vi.fn(),
  onViewSelect: vi.fn(),
  onUpdateViewsOrder: vi.fn(),
  onDelete: vi.fn(),
  onUpdate: vi.fn(),
  hasCreateRight: true,
  hasUpdateRight: true,
  hasDeleteRight: true,
};

function renderMenu(overrides: Partial<Props> = {}) {
  return render(<ViewsMenuMolecule {...DEFAULT_PROPS} {...overrides} />);
}

describe("ViewsMenu", () => {
  test("renders tab for each view", () => {
    renderMenu();
    expect(screen.getByText("View A")).toBeInTheDocument();
    expect(screen.getByText("View B")).toBeInTheDocument();
  });

  test("renders 'Save as new view' button", () => {
    renderMenu();
    expect(screen.getByText("Save as new view")).toBeInTheDocument();
  });

  test("'Save as new view' button is disabled when no create right", () => {
    renderMenu({ hasCreateRight: false });
    expect(screen.getByText("Save as new view").closest("button")).toBeDisabled();
  });

  test("'Save as new view' button is enabled when has create right", () => {
    renderMenu({ hasCreateRight: true });
    expect(screen.getByText("Save as new view").closest("button")).not.toBeDisabled();
  });
});
