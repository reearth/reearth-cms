import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";

import RequestDetailsMolecule from "./index";

vi.mock("./ItemForm", () => ({ default: () => <div data-testid="ItemForm" /> }));

const defaultProps = {
  me: undefined,
  hasCommentCreateRight: true,
  hasCommentUpdateRight: true,
  hasCommentDeleteRight: true,
  isCloseActionEnabled: true,
  isReopenActionEnabled: true,
  isApproveActionEnabled: true,
  isAssignActionEnabled: true,
  currentRequest: undefined,
  workspaceUserMembers: [],
  loading: false,
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

describe("RequestDetailsMolecule", () => {
  test("renders loading spinner when loading is true", () => {
    render(<RequestDetailsMolecule {...defaultProps} loading={true} />);
    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });

  test("renders NotFound when loading is false and currentRequest is undefined", () => {
    render(<RequestDetailsMolecule {...defaultProps} />);
    expect(screen.getByText("404")).toBeVisible();
  });
});
