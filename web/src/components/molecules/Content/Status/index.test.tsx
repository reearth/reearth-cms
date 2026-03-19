import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";

import Status from ".";

describe("Status", () => {
  test("renders DRAFT status", () => {
    render(<Status status="DRAFT" />);
    expect(screen.getByText("Draft")).toBeVisible();
  });

  test("renders PUBLIC status", () => {
    render(<Status status="PUBLIC" />);
    expect(screen.getByText("Published")).toBeVisible();
  });

  test("renders REVIEW status", () => {
    render(<Status status="REVIEW" />);
    expect(screen.getByText("Review")).toBeVisible();
  });

  test("renders combined PUBLIC_REVIEW status", () => {
    render(<Status status="PUBLIC_REVIEW" />);
    expect(screen.getByText("Published & Review")).toBeVisible();
  });

  test("renders combined PUBLIC_DRAFT status", () => {
    render(<Status status="PUBLIC_DRAFT" />);
    expect(screen.getByText("Published & Draft")).toBeVisible();
  });
});
