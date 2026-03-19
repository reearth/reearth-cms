import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";

import { DATA_TEST_ID } from "@reearth-cms/test/utils";

import FileSelectionStep from "./FileSelectionStep";

const defaultProps = {
  fileList: [],
  alertList: undefined as undefined,
  onFileContentChange: vi.fn(),
  onFileRemove: vi.fn(),
  dataChecking: false,
};

describe("FileSelectionStep", () => {
  test("renders Dragger when dataChecking is false", () => {
    render(<FileSelectionStep {...defaultProps} dataChecking={false} />);
    expect(screen.getByTestId(DATA_TEST_ID.FileSelectionStep__FileSelect)).toBeInTheDocument();
    expect(
      screen.queryByTestId(DATA_TEST_ID.FileSelectionStep__FileSelectLoadingWrapper),
    ).not.toBeInTheDocument();
  });

  test("renders loading wrapper when dataChecking is true", () => {
    render(<FileSelectionStep {...defaultProps} dataChecking={true} />);
    expect(
      screen.getByTestId(DATA_TEST_ID.FileSelectionStep__FileSelectLoadingWrapper),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId(DATA_TEST_ID.FileSelectionStep__FileSelect),
    ).not.toBeInTheDocument();
  });

  test("shows checking message when dataChecking is true", () => {
    render(<FileSelectionStep {...defaultProps} dataChecking={true} />);
    expect(screen.getByText("Checking the data file...")).toBeVisible();
  });

  test("shows upload instructions when not checking", () => {
    render(<FileSelectionStep {...defaultProps} dataChecking={false} />);
    expect(screen.getByText("Only JSON format is supported")).toBeVisible();
  });

  test("renders alert list items", () => {
    const alertList = [
      { message: "Field 'name' has invalid type", type: "error" as const },
      { message: "Field 'age' was auto-corrected", type: "warning" as const },
    ];
    render(<FileSelectionStep {...defaultProps} alertList={alertList} />);
    expect(screen.getByText("Field 'name' has invalid type")).toBeVisible();
    expect(screen.getByText("Field 'age' was auto-corrected")).toBeVisible();
  });

  test("renders template download link", () => {
    render(<FileSelectionStep {...defaultProps} />);
    const downloadLinks = screen.getAllByRole("link");
    expect(downloadLinks.length).toBeGreaterThan(0);
  });
});
