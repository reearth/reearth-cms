import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";

import WarningText from ".";

describe("WarningText", () => {
  test("renders warning icon and text", () => {
    render(<WarningText text="Something went wrong" />);
    expect(screen.getByText("Something went wrong")).toBeVisible();
  });

  test("renders different text content", () => {
    render(<WarningText text="Referenced items are not published" />);
    expect(screen.getByText("Referenced items are not published")).toBeVisible();
  });
});
