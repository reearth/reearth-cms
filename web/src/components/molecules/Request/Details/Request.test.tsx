import { render, screen } from "@testing-library/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";

import type { Request } from "@reearth-cms/components/molecules/Request/types";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";

vi.mock("./ItemForm", () => ({ default: () => <div data-testid="ItemForm" /> }));

import RequestMolecule from "./Request";

dayjs.extend(relativeTime);
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

const defaultProps = {
  me: { id: "u3", name: "Charlie", email: "charlie@test.com", lang: "en", auths: [] },
  hasCommentCreateRight: true,
  hasCommentUpdateRight: true,
  hasCommentDeleteRight: true,
  isCloseActionEnabled: true,
  isReopenActionEnabled: true,
  isApproveActionEnabled: true,
  isAssignActionEnabled: true,
  currentRequest: mockRequest,
  workspaceUserMembers: [],
  deleteLoading: false,
  approveLoading: false,
  updateLoading: false,
  onRequestApprove: vi.fn(),
  onRequestUpdate: vi.fn(),
  onRequestDelete: vi.fn(),
  onCommentCreate: vi.fn(),
  onCommentUpdate: vi.fn(),
  onCommentDelete: vi.fn(),
  onBack: vi.fn(),
  onNavigateToItemEdit: vi.fn(),
  onGetAsset: vi.fn(),
  onGroupGet: vi.fn(),
};

describe("RequestMolecule", () => {
  const user = userEvent.setup();

  test("renders page header with request title", () => {
    render(<RequestMolecule {...defaultProps} />);
    expect(screen.getByText("Request / Test Request")).toBeVisible();
  });

  test("Close button calls onRequestDelete with request id array", async () => {
    const onRequestDelete = vi.fn();
    render(<RequestMolecule {...defaultProps} onRequestDelete={onRequestDelete} />);
    await user.click(screen.getByTestId(DATA_TEST_ID.RequestDetail__CloseButton));
    expect(onRequestDelete).toHaveBeenCalledWith(["req-1"]);
  });

  test("Reopen button is hidden when state is not CLOSED", () => {
    render(<RequestMolecule {...defaultProps} />);
    expect(screen.getByTestId(DATA_TEST_ID.RequestDetail__ReopenButton)).not.toBeVisible();
  });

  test("Reopen button is visible when state is CLOSED and calls onRequestUpdate", async () => {
    const onRequestUpdate = vi.fn();
    const closedRequest = { ...mockRequest, state: "CLOSED" as const };
    render(
      <RequestMolecule
        {...defaultProps}
        currentRequest={closedRequest}
        onRequestUpdate={onRequestUpdate}
      />,
    );

    const reopenBtn = screen.getByTestId(DATA_TEST_ID.RequestDetail__ReopenButton);
    expect(reopenBtn).toBeVisible();
    await user.click(reopenBtn);
    expect(onRequestUpdate).toHaveBeenCalledWith({
      requestId: "req-1",
      title: "Test Request",
      description: "A description",
      reviewersId: ["u1", "u2"],
      state: "WAITING",
    });
  });

  test("Approve button calls onRequestApprove with request id", async () => {
    const onRequestApprove = vi.fn();
    render(<RequestMolecule {...defaultProps} onRequestApprove={onRequestApprove} />);
    await user.click(screen.getByTestId(DATA_TEST_ID.RequestDetail__ApproveButton));
    expect(onRequestApprove).toHaveBeenCalledWith("req-1");
  });
});
