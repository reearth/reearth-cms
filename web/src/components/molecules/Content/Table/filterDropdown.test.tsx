import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, expect, describe, test } from "vitest";

import { render } from "@reearth-cms/test/utils";

import FilterDropdown from "./filterDropdown";
import { type DefaultFilterValueType, type DropdownFilterType } from "./types";

let capturedDropdownRenderProps: Record<string, unknown> = {};

vi.mock("./DropdownRender", () => ({
  default: (props: Record<string, unknown>) => {
    capturedDropdownRenderProps = props;
    return <div data-testid="dropdown-render" />;
  },
}));

vi.mock("@reearth-cms/components/atoms/Icon", () => ({
  default: ({ icon }: { icon: string }) => <span data-testid={`icon-${icon}`} />,
}));

function makeFilter(overrides: Partial<DropdownFilterType> = {}): DropdownFilterType {
  return {
    dataIndex: ["fields", "field-1"],
    title: "Test Field",
    type: "Text",
    typeProperty: {},
    members: [],
    id: "field-1",
    multiple: false,
    required: false,
    ...overrides,
  };
}

const defaultValue: DefaultFilterValueType = {
  operatorType: "string",
  operator: "contains" as DefaultFilterValueType["operator"],
};

function renderFilterDropdown(
  overrides: Partial<{
    filter: DropdownFilterType;
    index: number;
    defaultValue: DefaultFilterValueType;
    filterRemove: (index: number) => void;
    isFilterOpen: boolean;
    currentView: Record<string, unknown>;
    setCurrentView: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
    onFilterChange: () => void;
  }> = {},
) {
  const props = {
    filter: overrides.filter ?? makeFilter(),
    index: overrides.index ?? 0,
    defaultValue: overrides.defaultValue ?? defaultValue,
    filterRemove: overrides.filterRemove ?? vi.fn(),
    isFilterOpen: overrides.isFilterOpen ?? false,
    currentView: overrides.currentView ?? {},
    setCurrentView: overrides.setCurrentView ?? vi.fn(),
    onFilterChange: overrides.onFilterChange ?? vi.fn(),
  };
  capturedDropdownRenderProps = {};
  const user = userEvent.setup();
  return { ...render(<FilterDropdown {...props} />), props, user };
}

describe("FilterDropdown", () => {
  describe("Rendering", () => {
    test("renders filter title text", () => {
      renderFilterDropdown({ filter: makeFilter({ title: "Status" }) });
      expect(screen.getByText("Status")).toBeInTheDocument();
    });

    test("renders close icon", () => {
      renderFilterDropdown();
      expect(screen.getByTestId("icon-close")).toBeInTheDocument();
    });

    test("renders different titles when filter prop changes", () => {
      const { unmount } = renderFilterDropdown({ filter: makeFilter({ title: "Created By" }) });
      expect(screen.getByText("Created By")).toBeInTheDocument();
      unmount();

      renderFilterDropdown({ filter: makeFilter({ title: "Updated At" }) });
      expect(screen.getByText("Updated At")).toBeInTheDocument();
    });
  });

  describe("Remove button", () => {
    test("calls filterRemove with correct index on close icon click", async () => {
      const filterRemove = vi.fn();
      const { user } = renderFilterDropdown({ filterRemove, index: 3 });

      await user.click(screen.getByTestId("icon-close"));
      expect(filterRemove).toHaveBeenCalledWith(3);
    });

    test("works with index 0", async () => {
      const filterRemove = vi.fn();
      const { user } = renderFilterDropdown({ filterRemove, index: 0 });

      await user.click(screen.getByTestId("icon-close"));
      expect(filterRemove).toHaveBeenCalledWith(0);
    });

    test("clicking close icon does not open the dropdown", async () => {
      const filterRemove = vi.fn();
      const { user } = renderFilterDropdown({ filterRemove, isFilterOpen: false });

      await user.click(screen.getByTestId("icon-close"));
      expect(filterRemove).toHaveBeenCalled();
      // stopPropagation prevents the Dropdown trigger from toggling
      expect(screen.queryByTestId("dropdown-render")).not.toBeInTheDocument();
    });
  });

  describe("Open state", () => {
    test("renders dropdown content when isFilterOpen is true", () => {
      renderFilterDropdown({ isFilterOpen: true });
      expect(screen.getByTestId("dropdown-render")).toBeInTheDocument();
    });

    test("does not render dropdown content when isFilterOpen is false", () => {
      renderFilterDropdown({ isFilterOpen: false });
      expect(screen.queryByTestId("dropdown-render")).not.toBeInTheDocument();
    });
  });

  describe("Props threading to DropdownRender", () => {
    test("passes all props correctly", () => {
      const filter = makeFilter({ title: "My Filter" });
      const currentView = { id: "view-1" };
      const setCurrentView = vi.fn();
      const onFilterChange = vi.fn();

      renderFilterDropdown({
        filter,
        index: 5,
        defaultValue,
        isFilterOpen: true,
        currentView,
        setCurrentView,
        onFilterChange,
      });

      expect(capturedDropdownRenderProps.filter).toBe(filter);
      expect(capturedDropdownRenderProps.index).toBe(5);
      expect(capturedDropdownRenderProps.defaultValue).toBe(defaultValue);
      expect(capturedDropdownRenderProps.currentView).toBe(currentView);
      expect(capturedDropdownRenderProps.setCurrentView).toBe(setCurrentView);
      expect(capturedDropdownRenderProps.onFilterChange).toBe(onFilterChange);
      expect(capturedDropdownRenderProps.open).toBe(true);
      expect(typeof capturedDropdownRenderProps.close).toBe("function");
    });

    test("always passes isFilter as true", () => {
      renderFilterDropdown({ isFilterOpen: true });
      expect(capturedDropdownRenderProps.isFilter).toBe(true);
    });
  });
});
