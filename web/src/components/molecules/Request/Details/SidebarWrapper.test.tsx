import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";

import type { Request } from "@reearth-cms/components/molecules/Request/types";
import type { UserMember } from "@reearth-cms/components/molecules/Workspace/types";
import { dateTimeFormat } from "@reearth-cms/utils/format";

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

const mockMembersWithCarol: UserMember[] = [
  ...mockMembers,
  { userId: "u3", role: "READER", user: { id: "u3", name: "Carol", email: "carol@test.com" } },
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

  test("calls onRequestUpdate with correct payload when reviewers change on blur", async () => {
    const onRequestUpdate = vi.fn().mockResolvedValue(undefined);
    render(
      <RequestSidebarWrapper
        {...defaultProps}
        workspaceUserMembers={mockMembersWithCarol}
        onRequestUpdate={onRequestUpdate}
      />,
    );

    await user.click(screen.getByText("Assign to"));
    const combobox = screen.getByRole("combobox");

    // Open dropdown via mouseDown on the selector container
    // eslint-disable-next-line testing-library/no-node-access
    fireEvent.mouseDown(combobox.closest(".ant-select-selector")!);

    // Carol is not in reviewers so findByTitle is unambiguous (no Reviewer div conflict)
    await user.click(await screen.findByTitle("Carol"));

    fireEvent.blur(combobox);

    await waitFor(() => {
      expect(onRequestUpdate).toHaveBeenCalledWith({
        requestId: "req-1",
        title: "Test Request",
        description: "A description",
        state: "WAITING",
        reviewersId: ["u1", "u2", "u3"],
      });
    });
  });

  test("does not call onRequestUpdate when selection equals default", async () => {
    const onRequestUpdate = vi.fn().mockResolvedValue(undefined);
    // Use Carol as sole reviewer so defaultValue = ["u3"]
    const singleReviewerRequest: Request = {
      ...mockRequest,
      reviewers: [{ id: "u3", name: "Carol", email: "carol@test.com" }],
    };
    render(
      <RequestSidebarWrapper
        {...defaultProps}
        currentRequest={singleReviewerRequest}
        workspaceUserMembers={mockMembersWithCarol}
        onRequestUpdate={onRequestUpdate}
      />,
    );

    await user.click(screen.getByText("Assign to"));
    const combobox = screen.getByRole("combobox");

    // eslint-disable-next-line testing-library/no-node-access
    fireEvent.mouseDown(combobox.closest(".ant-select-selector")!);

    // Alice is not a reviewer so findByTitle is unambiguous
    // Select Alice → selectedReviewers = ["u3", "u1"]
    await user.click(await screen.findByTitle("Alice"));

    // Backspace removes last selected item (Alice), reverting to default ["u3"]
    await user.keyboard("{Backspace}");

    fireEvent.blur(combobox);

    await waitFor(() => {
      expect(screen.getByText("Assign to")).toBeVisible();
    });
    expect(onRequestUpdate).not.toHaveBeenCalled();
  });

  test("does not call onRequestUpdate when selection is empty", async () => {
    const onRequestUpdate = vi.fn().mockResolvedValue(undefined);
    render(<RequestSidebarWrapper {...defaultProps} onRequestUpdate={onRequestUpdate} />);

    await user.click(screen.getByText("Assign to"));
    const combobox = screen.getByRole("combobox");

    fireEvent.blur(combobox);

    await waitFor(() => {
      expect(screen.getByText("Assign to")).toBeVisible();
    });
    expect(onRequestUpdate).not.toHaveBeenCalled();
  });

  test("hides reviewer select after blur", async () => {
    render(<RequestSidebarWrapper {...defaultProps} />);

    await user.click(screen.getByText("Assign to"));
    expect(screen.getByRole("combobox")).toBeVisible();
    expect(screen.queryByText("Assign to")).not.toBeInTheDocument();

    fireEvent.blur(screen.getByRole("combobox"));

    await waitFor(() => {
      expect(screen.getByText("Assign to")).toBeVisible();
    });
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  test("logs error and still hides select when onRequestUpdate rejects", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const onRequestUpdate = vi.fn().mockRejectedValue(new Error("fail"));
    render(
      <RequestSidebarWrapper
        {...defaultProps}
        workspaceUserMembers={mockMembersWithCarol}
        onRequestUpdate={onRequestUpdate}
      />,
    );

    await user.click(screen.getByText("Assign to"));
    const combobox = screen.getByRole("combobox");

    // eslint-disable-next-line testing-library/no-node-access
    fireEvent.mouseDown(combobox.closest(".ant-select-selector")!);

    await user.click(await screen.findByTitle("Carol"));

    fireEvent.blur(combobox);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith("Validate Failed:", expect.any(Error));
    });
    expect(screen.getByText("Assign to")).toBeVisible();

    consoleErrorSpy.mockRestore();
  });

  test("renders DRAFT state badge", () => {
    render(
      <RequestSidebarWrapper
        {...defaultProps}
        currentRequest={{ ...mockRequest, state: "DRAFT" }}
      />,
    );
    expect(screen.getByText("DRAFT")).toBeVisible();
  });

  test("renders empty reviewer list", () => {
    render(
      <RequestSidebarWrapper
        {...defaultProps}
        currentRequest={{ ...mockRequest, reviewers: [] }}
      />,
    );
    expect(screen.getByText("Reviewer")).toBeVisible();
    expect(screen.queryByText("Alice")).not.toBeInTheDocument();
    expect(screen.queryByText("Bob")).not.toBeInTheDocument();
  });

  test("renders without createdBy", () => {
    render(
      <RequestSidebarWrapper
        {...defaultProps}
        currentRequest={{ ...mockRequest, createdBy: undefined }}
      />,
    );
    expect(screen.getByText("Created By")).toBeVisible();
    expect(screen.queryByText("Charlie")).not.toBeInTheDocument();
  });

  test("renders formatted created time value", () => {
    render(<RequestSidebarWrapper {...defaultProps} />);
    const expected = dateTimeFormat(mockRequest.createdAt);
    expect(screen.getByText(expected)).toBeVisible();
  });
});
