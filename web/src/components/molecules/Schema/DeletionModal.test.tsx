import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";

import type { Model } from "@reearth-cms/components/molecules/Model/types";

import DeletionModal from "./DeletionModal";

const defaultProps = {
  open: true,
  data: { id: "model-1", name: "TestModel" } as Model,
  deleteLoading: false,
  onClose: vi.fn(),
  onDelete: vi.fn(),
  isModel: true,
};

describe("DeletionModal", () => {
  const user = userEvent.setup();

  test("renders modal when open is true", () => {
    render(<DeletionModal {...defaultProps} />);
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Delete model")).toBeInTheDocument();
  });

  test("does not render modal content when open is false", () => {
    render(<DeletionModal {...defaultProps} open={false} />);
    expect(screen.queryByText("Cancel")).not.toBeInTheDocument();
  });

  test("shows model-specific message and button when isModel is true", () => {
    render(<DeletionModal {...defaultProps} isModel={true} />);
    expect(screen.getByText(/permanently delete the selected model/)).toBeInTheDocument();
    expect(screen.getByText("Delete model")).toBeInTheDocument();
  });

  test("shows group-specific message and button when isModel is false", () => {
    render(<DeletionModal {...defaultProps} isModel={false} />);
    expect(screen.getByText(/permanently delete the selected group/)).toBeInTheDocument();
    expect(screen.getByText("Delete group")).toBeInTheDocument();
  });

  test("calls onClose when Cancel is clicked", async () => {
    const onClose = vi.fn();
    render(<DeletionModal {...defaultProps} onClose={onClose} />);
    await user.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  test("calls onDelete with data.id when Delete button is clicked", async () => {
    const onDelete = vi.fn();
    render(<DeletionModal {...defaultProps} onDelete={onDelete} />);
    await user.click(screen.getByText("Delete model"));
    expect(onDelete).toHaveBeenCalledWith("model-1");
  });

  test("disables Cancel button when deleteLoading is true", () => {
    render(<DeletionModal {...defaultProps} deleteLoading={true} />);
    expect(screen.getByText("Cancel").closest("button")).toBeDisabled();
  });

  test("renders without data gracefully", () => {
    render(<DeletionModal {...defaultProps} data={undefined} />);
    expect(screen.getByText("Delete model")).toBeInTheDocument();
  });
});
