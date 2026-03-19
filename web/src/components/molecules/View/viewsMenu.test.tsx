import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { View } from "@reearth-cms/components/molecules/View/types";

import ViewsMenuMolecule from "./viewsMenu";

let capturedOnDragEnd: (fromIndex: number, toIndex: number) => void;
let capturedNodeSelector: string | undefined;

vi.mock("react-drag-listview", () => ({
  default: {
    DragColumn: ({
      children,
      onDragEnd,
      nodeSelector,
    }: {
      children: React.ReactNode;
      onDragEnd: (f: number, t: number) => void;
      nodeSelector?: string;
    }) => {
      capturedOnDragEnd = onDragEnd;
      capturedNodeSelector = nodeSelector;
      return <div>{children}</div>;
    },
  },
}));

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
  const user = userEvent.setup();

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

  test("calls onViewCreateModalOpen when 'Save as new view' is clicked", async () => {
    const onViewCreateModalOpen = vi.fn();
    renderMenu({ onViewCreateModalOpen });

    await user.click(screen.getByText("Save as new view"));
    expect(onViewCreateModalOpen).toHaveBeenCalledOnce();
  });

  test("renders views sorted by order property", () => {
    const reversedViews: View[] = [
      { id: "v3", name: "Third", modelId: "m1", projectId: "p1", order: 2 },
      { id: "v1", name: "First", modelId: "m1", projectId: "p1", order: 0 },
      { id: "v2", name: "Second", modelId: "m1", projectId: "p1", order: 1 },
    ];
    renderMenu({ views: reversedViews, currentView: { id: "v1", name: "First" } });

    const tabs = screen.getAllByRole("tab");
    expect(tabs[0]).toHaveTextContent("First");
    expect(tabs[1]).toHaveTextContent("Second");
    expect(tabs[2]).toHaveTextContent("Third");
  });

  test("renders no tabs when views array is empty", () => {
    renderMenu({ views: [] });

    expect(screen.queryAllByRole("tab")).toHaveLength(0);
    expect(screen.getByText("Save as new view")).toBeInTheDocument();
  });

  test("calls onViewSelect when a tab is clicked", async () => {
    const onViewSelect = vi.fn();
    renderMenu({ onViewSelect });

    await user.click(screen.getByRole("tab", { name: /View B/ }));
    expect(onViewSelect).toHaveBeenCalledWith("v2");
  });

  test("sets active tab based on currentView.id", () => {
    renderMenu({ currentView: { id: "v2", name: "View B" } });

    expect(screen.getByRole("tab", { name: /View B/, selected: true })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /View A/, selected: false })).toBeInTheDocument();
  });

  test("onDragEnd reorders views and calls onUpdateViewsOrder", () => {
    const onUpdateViewsOrder = vi.fn();
    const views: View[] = [
      { id: "v1", name: "View A", modelId: "m1", projectId: "p1", order: 0 },
      { id: "v2", name: "View B", modelId: "m1", projectId: "p1", order: 1 },
      { id: "v3", name: "View C", modelId: "m1", projectId: "p1", order: 2 },
    ];
    renderMenu({ views, onUpdateViewsOrder });

    capturedOnDragEnd(0, 2);
    expect(onUpdateViewsOrder).toHaveBeenCalledWith(["v2", "v3", "v1"]);
  });

  test("onDragEnd does not call onUpdateViewsOrder when toIndex < 0", () => {
    const onUpdateViewsOrder = vi.fn();
    const views: View[] = [
      { id: "v1", name: "View A", modelId: "m1", projectId: "p1", order: 0 },
      { id: "v2", name: "View B", modelId: "m1", projectId: "p1", order: 1 },
    ];
    renderMenu({ views, onUpdateViewsOrder });

    capturedOnDragEnd(0, -1);
    expect(onUpdateViewsOrder).not.toHaveBeenCalled();
  });

  test("onDragEnd moves item to the beginning", () => {
    const onUpdateViewsOrder = vi.fn();
    const views: View[] = [
      { id: "v1", name: "View A", modelId: "m1", projectId: "p1", order: 0 },
      { id: "v2", name: "View B", modelId: "m1", projectId: "p1", order: 1 },
      { id: "v3", name: "View C", modelId: "m1", projectId: "p1", order: 2 },
    ];
    renderMenu({ views, onUpdateViewsOrder });

    capturedOnDragEnd(2, 0);
    expect(onUpdateViewsOrder).toHaveBeenCalledWith(["v3", "v1", "v2"]);
  });

  test("disables drag when hasUpdateRight is false", () => {
    renderMenu({ hasUpdateRight: false });
    expect(capturedNodeSelector).toBeUndefined();
  });

  test("enables drag when hasUpdateRight is true", () => {
    renderMenu({ hasUpdateRight: true });
    expect(capturedNodeSelector).toBe(".ant-tabs-tab");
  });

  test("renders a single view as one tab", () => {
    const singleView: View[] = [
      { id: "v1", name: "Only View", modelId: "m1", projectId: "p1", order: 0 },
    ];
    renderMenu({ views: singleView, currentView: { id: "v1", name: "Only View" } });

    expect(screen.getAllByRole("tab")).toHaveLength(1);
    expect(screen.getByRole("tab", { name: /Only View/ })).toBeInTheDocument();
  });

  test("handles currentView with undefined id", () => {
    renderMenu({ currentView: {} });

    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(2);
    // Ant Design defaults to the first tab when activeKey is undefined
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
  });
});
