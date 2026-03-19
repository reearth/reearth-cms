import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";

import RequestStatus from "./RequestStatus";

describe("RequestStatus", () => {
  test("renders Approved text for APPROVED state", () => {
    render(<RequestStatus requestState="APPROVED" />);
    expect(screen.getByText("Approved")).toBeVisible();
  });

  test("renders Closed text for CLOSED state", () => {
    render(<RequestStatus requestState="CLOSED" />);
    expect(screen.getByText("Closed")).toBeVisible();
  });

  test("renders nothing for WAITING state", () => {
    render(<RequestStatus requestState="WAITING" />);
    expect(screen.queryByText("Approved")).not.toBeInTheDocument();
    expect(screen.queryByText("Closed")).not.toBeInTheDocument();
  });

  test("renders nothing for DRAFT state", () => {
    render(<RequestStatus requestState="DRAFT" />);
    expect(screen.queryByText("Approved")).not.toBeInTheDocument();
    expect(screen.queryByText("Closed")).not.toBeInTheDocument();
  });
});
