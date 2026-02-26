import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, describe, vi } from "vitest";

import { ProjectListItem as Project } from "@reearth-cms/components/molecules/Workspace/types";

import ProjectList from "./ProjectList";

type Props = React.ComponentProps<typeof ProjectList>;

const DEFAULT_PROPS: Props = {
  hasCreateRight: true,
  projects: [],
  loading: false,
  page: 1,
  pageSize: 10,
  totalCount: 0,
  onProjectNavigation: vi.fn(),
  onProjectCreate: vi.fn().mockResolvedValue(undefined),
  onProjectAliasCheck: vi.fn().mockResolvedValue(true),
  onPageChange: vi.fn(),
};

function renderList(overrides: Partial<Props> = {}) {
  return render(<ProjectList {...DEFAULT_PROPS} {...overrides} />);
}

describe("Project list", () => {
  test("Loading displays successfully", () => {
    renderList({ loading: true });
    expect(screen.getByTestId("loading")).toBeVisible();
  });

  test("Creating button and document link displays successfully", () => {
    renderList();
    expect(screen.getByRole("button")).not.toHaveAttribute("disabled");
    expect(screen.getByRole("link")).toBeVisible();
  });

  test("Creating button is disabled due to user right", () => {
    renderList({ hasCreateRight: false });
    expect(screen.getByRole("button")).toHaveAttribute("disabled");
  });

  test("Project cards display successfully", () => {
    const testProjects: Project[] = [
      { id: "id1", name: "name", description: "description" },
      { id: "id2", name: "name", description: "description" },
    ];
    renderList({ projects: testProjects });
    expect(screen.getAllByText("name").length).toBe(2);
  });
});

describe("Pagination", () => {
  const manyProjects: Project[] = Array.from({ length: 10 }, (_, i) => ({
    id: `id-${i}`,
    name: `Project ${i}`,
    description: `Desc ${i}`,
  }));

  test("pagination controls render when projects exist", () => {
    renderList({ projects: manyProjects, totalCount: 25 });
    expect(screen.getByRole("listitem", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("listitem", { name: "2" })).toBeInTheDocument();
  });

  test("page change callback fires with correct page number", async () => {
    const onPageChange = vi.fn();
    renderList({ projects: manyProjects, totalCount: 25, onPageChange });

    const listItem = screen.getByRole("listitem", { name: "2" });
    const anchor = listItem.querySelector("a");
    if (!anchor) throw new Error("Expected anchor in pagination item");
    await userEvent.click(anchor);
    expect(onPageChange).toHaveBeenCalledWith(2, 10);
  });

  test("pagination hidden when no projects exist", () => {
    renderList({ projects: [], totalCount: 0 });
    expect(screen.queryByRole("listitem", { name: "1" })).not.toBeInTheDocument();
  });
});
