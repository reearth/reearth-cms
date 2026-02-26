import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";

import ProjectHeader from "./ProjectHeader";

describe("ProjectHeader", () => {
  const user = userEvent.setup();

  test("renders search input and sort label", () => {
    render(<ProjectHeader onModelSearch={vi.fn()} onModelSort={vi.fn()} />);
    expect(screen.getByPlaceholderText("search models")).toBeVisible();
    expect(screen.getByText("Sort by")).toBeVisible();
  });

  test("calls onModelSearch when pressing enter", async () => {
    const onModelSearch = vi.fn();
    render(<ProjectHeader onModelSearch={onModelSearch} onModelSort={vi.fn()} />);

    const searchInput = screen.getByPlaceholderText("search models");
    await user.type(searchInput, "test{Enter}");
    expect(onModelSearch).toHaveBeenCalledWith("test", expect.anything(), expect.anything());
  });
});
