import { render, screen } from "@testing-library/react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";

import type { Request } from "@reearth-cms/components/molecules/Request/types";
import type { UserMember } from "@reearth-cms/components/molecules/Workspace/types";

import RequestSidebarWrapper from "./SidebarWrapper";

dayjs.extend(utc);

const mockRequest: Request = {
  id: "req-1",
  title: "Test Request",
  description: "A description",
  comments: [],
  createdAt: new Date("2024-01-15T10:30:00Z"),
  reviewers: [
    { id: "u1", name: "Alice", email: "alice@test.com" },
    { id: "u2", name: "Bob", email: "bob@test.com" },
  ],
  state: "WAITING",
  createdBy: { id: "u3", name: "Charlie", email: "charlie@test.com" },
  updatedAt: new Date("2024-01-16T10:30:00Z"),
  items: [],
};

const mockMembers: UserMember[] = [
  { userId: "u1", role: "OWNER", user: { id: "u1", name: "Alice", email: "alice@test.com" } },
  { userId: "u2", role: "WRITER", user: { id: "u2", name: "Bob", email: "bob@test.com" } },
];

const defaultProps = {
  currentRequest: mockRequest,
  workspaceUserMembers: mockMembers,
  isAssignActionEnabled: true,
  onRequestUpdate: vi.fn(),
};

describe("RequestSidebarWrapper", () => {
  const user = userEvent.setup();

  test("renders state badge", () => {
    render(<RequestSidebarWrapper {...defaultProps} />);
    expect(screen.getByText("State")).toBeVisible();
    expect(screen.getByText("WAITING")).toBeVisible();
  });

  test("renders APPROVED state", () => {
    render(
      <RequestSidebarWrapper
        {...defaultProps}
        currentRequest={{ ...mockRequest, state: "APPROVED" }}
      />,
    );
    expect(screen.getByText("APPROVED")).toBeVisible();
  });

  test("renders CLOSED state", () => {
    render(
      <RequestSidebarWrapper
        {...defaultProps}
        currentRequest={{ ...mockRequest, state: "CLOSED" }}
      />,
    );
    expect(screen.getByText("CLOSED")).toBeVisible();
  });

  test("renders created by name", () => {
    render(<RequestSidebarWrapper {...defaultProps} />);
    expect(screen.getByText("Created By")).toBeVisible();
    expect(screen.getByText("Charlie")).toBeVisible();
  });

  test("renders reviewer names", () => {
    render(<RequestSidebarWrapper {...defaultProps} />);
    expect(screen.getAllByText("Alice")).toHaveLength(1);
    expect(screen.getAllByText("Bob")).toHaveLength(1);
  });

  test("renders Assign to button", () => {
    render(<RequestSidebarWrapper {...defaultProps} />);
    expect(screen.getByText("Assign to")).toBeVisible();
  });

  test("disables Assign to button when isAssignActionEnabled is false", () => {
    render(<RequestSidebarWrapper {...defaultProps} isAssignActionEnabled={false} />);
    expect(screen.getByText("Assign to").closest("button")).toBeDisabled();
  });

  test("shows reviewer select when Assign to is clicked", async () => {
    render(<RequestSidebarWrapper {...defaultProps} />);
    await user.click(screen.getByText("Assign to"));
    expect(screen.getByRole("combobox")).toBeVisible();
  });

  test("renders created time", () => {
    render(<RequestSidebarWrapper {...defaultProps} />);
    expect(screen.getByText("Created Time")).toBeVisible();
  });
});
