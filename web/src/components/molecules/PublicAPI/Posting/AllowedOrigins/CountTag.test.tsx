import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import CountTag from "./CountTag";

describe("CountTag", () => {
  test("renders the empty state when no origins are configured", () => {
    render(<CountTag count={0} />);
    expect(screen.getByText(/0 configured/)).toBeVisible();
  });

  test("renders the configured count", () => {
    render(<CountTag count={3} />);
    expect(screen.getByText(/3 configured/)).toBeVisible();
  });
});
