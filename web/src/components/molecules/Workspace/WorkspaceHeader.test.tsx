import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import WorkspaceHeader from "./WorkspaceHeader";

describe("WorkspaceHeader", () => {
  test("WorkspaceHeader renders with search input and sort select", () => {
    render(
      <WorkspaceHeader onProjectSearch={vi.fn()} onProjectSort={vi.fn()} projectSort="updatedat" />,
    );

    expect(screen.getByPlaceholderText("search projects")).toBeVisible();
    expect(screen.getByText("Sort by")).toBeVisible();
    expect(screen.getByText("Last Modified")).toBeVisible();
  });

  test("calls onProjectSearch when user types and submits search", async () => {
    const user = userEvent.setup();
    const onProjectSearch = vi.fn();
    render(
      <WorkspaceHeader
        onProjectSearch={onProjectSearch}
        onProjectSort={vi.fn()}
        projectSort="updatedat"
      />,
    );

    const searchBox = screen.getByPlaceholderText("search projects");
    await user.type(searchBox, "my project{Enter}");
    expect(onProjectSearch).toHaveBeenCalledWith(
      "my project",
      expect.anything(),
      expect.anything(),
    );
  });

  test("renders all three sort options when dropdown is opened", async () => {
    const user = userEvent.setup();
    render(
      <WorkspaceHeader onProjectSearch={vi.fn()} onProjectSort={vi.fn()} projectSort="updatedat" />,
    );

    await user.click(screen.getByText("Last Modified"));
    expect(screen.getAllByText("Last Modified").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Created At")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
  });

  test("calls onProjectSort when user changes sort dropdown", async () => {
    const user = userEvent.setup();
    const onProjectSort = vi.fn();
    render(
      <WorkspaceHeader
        onProjectSearch={vi.fn()}
        onProjectSort={onProjectSort}
        projectSort="updatedat"
      />,
    );

    await user.click(screen.getByText("Last Modified"));
    await user.click(screen.getByText("Name"));
    expect(onProjectSort).toHaveBeenCalledWith("name");
  });
});
