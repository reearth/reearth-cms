import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";

import ImportingStep from "./ImportingStep";

const defaultProps = {
  fieldsCreationLoading: false,
  fieldsCreationError: undefined as boolean | undefined,
  onModalClose: vi.fn(),
};

describe("ImportingStep", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("shows loading message when fieldsCreationLoading is true", () => {
    render(<ImportingStep {...defaultProps} fieldsCreationLoading={true} />);
    expect(screen.getByText("Importing...")).toBeVisible();
  });

  test("shows success message when not loading and no error", () => {
    render(
      <ImportingStep
        {...defaultProps}
        fieldsCreationLoading={false}
        fieldsCreationError={undefined}
      />,
    );
    expect(screen.getByText("Import successful!")).toBeVisible();
  });

  test("shows error message when fieldsCreationError is true", () => {
    render(
      <ImportingStep {...defaultProps} fieldsCreationLoading={false} fieldsCreationError={true} />,
    );
    expect(screen.getByText("Import not successful.")).toBeVisible();
  });

  test("calls onModalClose after 1000ms when not loading", () => {
    const onModalClose = vi.fn();
    render(
      <ImportingStep {...defaultProps} fieldsCreationLoading={false} onModalClose={onModalClose} />,
    );
    expect(onModalClose).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1000);
    expect(onModalClose).toHaveBeenCalledOnce();
  });

  test("does not call onModalClose while still loading", () => {
    const onModalClose = vi.fn();
    render(
      <ImportingStep {...defaultProps} fieldsCreationLoading={true} onModalClose={onModalClose} />,
    );
    vi.advanceTimersByTime(2000);
    expect(onModalClose).not.toHaveBeenCalled();
  });

  test("calls onModalClose after error (not loading)", () => {
    const onModalClose = vi.fn();
    render(
      <ImportingStep
        {...defaultProps}
        fieldsCreationLoading={false}
        fieldsCreationError={true}
        onModalClose={onModalClose}
      />,
    );
    vi.advanceTimersByTime(1000);
    expect(onModalClose).toHaveBeenCalledOnce();
  });

  test("renders Progress component", () => {
    render(<ImportingStep {...defaultProps} fieldsCreationLoading={true} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  test("cleans up timeout on unmount", () => {
    const onModalClose = vi.fn();
    const { unmount } = render(
      <ImportingStep {...defaultProps} fieldsCreationLoading={false} onModalClose={onModalClose} />,
    );
    unmount();
    vi.advanceTimersByTime(1000);
    expect(onModalClose).not.toHaveBeenCalled();
  });
});
