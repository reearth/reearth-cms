import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";

import type { UserMember } from "@reearth-cms/components/molecules/Workspace/types";

import RequestCreationModal from ".";

const mockMembers: UserMember[] = [
  { userId: "u1", role: "OWNER", user: { id: "u1", name: "Alice", email: "alice@test.com" } },
  { userId: "u2", role: "WRITER", user: { id: "u2", name: "Bob", email: "bob@test.com" } },
];

const defaultProps = {
  open: true,
  requestCreationLoading: false,
  item: { itemId: "item-1", version: "1" },
  unpublishedItems: [],
  workspaceUserMembers: mockMembers,
  onClose: vi.fn(),
  onSubmit: vi.fn(),
};

describe("RequestCreationModal", () => {
  test("renders modal when open", () => {
    render(<RequestCreationModal {...defaultProps} />);
    expect(screen.getByText("New Request")).toBeInTheDocument();
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
  });

  test("does not render modal content when closed", () => {
    render(<RequestCreationModal {...defaultProps} open={false} />);
    expect(screen.queryByText("New Request")).not.toBeInTheDocument();
  });

  test("renders unpublished items warning when present", () => {
    const unpublishedItems = [
      {
        id: "item-2",
        title: "Unpublished Item",
        schemaId: "s1",
        createdBy: "u1",
        status: "DRAFT" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    render(<RequestCreationModal {...defaultProps} unpublishedItems={unpublishedItems} />);
    expect(
      screen.getByText(
        "We found some referenced items that not published yet. Please select to add the items to the same request.",
      ),
    ).toBeInTheDocument();
  });

  test("does not render warning when no unpublished items", () => {
    render(<RequestCreationModal {...defaultProps} unpublishedItems={[]} />);
    expect(
      screen.queryByText(
        "We found some referenced items that not published yet. Please select to add the items to the same request.",
      ),
    ).not.toBeInTheDocument();
  });

  test("OK button is disabled by default", () => {
    render(<RequestCreationModal {...defaultProps} />);
    expect(screen.getByRole("button", { name: "OK" })).toBeDisabled();
  });

  test("calls onClose when cancel button is clicked", async () => {
    const onClose = vi.fn();
    render(<RequestCreationModal {...defaultProps} onClose={onClose} />);
    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    await cancelButton.click();
    expect(onClose).toHaveBeenCalled();
  });
});
