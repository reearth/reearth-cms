import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import WorkspaceHeader from "./WorkspaceHeader";

test("WorkspaceHeader renders with search input and sort select", () => {
  const onProjectSearch = vi.fn();

  render(<WorkspaceHeader onProjectSearch={onProjectSearch} />);

  expect(screen.getByPlaceholderText("search projects")).toBeVisible();
  expect(screen.getByText("Sort by")).toBeVisible();
  expect(screen.getByText("Last Modified")).toBeVisible();
});
