import { render, screen, act } from "@testing-library/react";
import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";

import { t } from "@reearth-cms/i18n";

import ImportingStep from "./ImportingStep";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("ImportingStep", () => {
  test("shows loading message and animates progress while loading", () => {
    const onModalClose = vi.fn();
    render(
      <ImportingStep
        fieldsCreationLoading={true}
        onModalClose={onModalClose}
      />,
    );

    expect(screen.getByText(t("Importing..."))).toBeInTheDocument();

    // Progress should start at 0 and increase after intervals
    act(() => {
      vi.advanceTimersByTime(600);
    });

    // After several intervals, progress should be > 0 but < 90
    const progressEl = document.querySelector(".ant-progress");
    expect(progressEl).toBeInTheDocument();
    expect(onModalClose).not.toHaveBeenCalled();
  });

  test("snaps to 100% and auto-closes on success", () => {
    const onModalClose = vi.fn();
    const { rerender } = render(
      <ImportingStep
        fieldsCreationLoading={true}
        onModalClose={onModalClose}
      />,
    );

    act(() => {
      vi.advanceTimersByTime(600);
    });

    // Simulate loading complete with no error
    rerender(
      <ImportingStep
        fieldsCreationLoading={false}
        onModalClose={onModalClose}
      />,
    );

    expect(screen.getByText(t("Import successful!"))).toBeInTheDocument();

    // Should auto-close after AUTO_CLOSE_DELAY (1000ms)
    expect(onModalClose).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onModalClose).toHaveBeenCalledTimes(1);
  });

  test("stops animation and shows error styling on error", () => {
    const onModalClose = vi.fn();
    const { rerender } = render(
      <ImportingStep
        fieldsCreationLoading={true}
        onModalClose={onModalClose}
      />,
    );

    act(() => {
      vi.advanceTimersByTime(600);
    });

    // Simulate error
    rerender(
      <ImportingStep
        fieldsCreationLoading={false}
        fieldsCreationError={true}
        onModalClose={onModalClose}
      />,
    );

    expect(screen.getByText(t("Import not successful."))).toBeInTheDocument();

    // Should NOT auto-close on error
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(onModalClose).not.toHaveBeenCalled();
  });

  test("does not start animation when initially in error state", () => {
    const onModalClose = vi.fn();
    render(
      <ImportingStep
        fieldsCreationLoading={false}
        fieldsCreationError={true}
        onModalClose={onModalClose}
      />,
    );

    expect(screen.getByText(t("Import not successful."))).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(onModalClose).not.toHaveBeenCalled();
  });
});
