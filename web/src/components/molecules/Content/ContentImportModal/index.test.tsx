import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";

import { ValidateImportResult } from "@reearth-cms/components/organisms/Project/Content/ContentList/hooks";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";

import ContentImportModal from ".";

type Props = React.ComponentProps<typeof ContentImportModal>;

const DEFAULT_PROPS: Props = {
  isOpen: true,
  dataChecking: false,
  modelFields: [],
  workspaceId: "ws-1",
  projectId: "proj-1",
  modelId: "model-1",
  onSetDataChecking: vi.fn(),
  onClose: vi.fn(),
  onEnqueueJob: vi.fn(),
  alertList: [],
  setAlertList: vi.fn(),
  validateImportResult: null,
  setValidateImportResult: vi.fn(),
};

function renderModal(overrides: Partial<Props> = {}) {
  return render(
    <MemoryRouter>
      <ContentImportModal {...DEFAULT_PROPS} {...overrides} />
    </MemoryRouter>,
  );
}

describe("ContentImportModal", () => {
  test("renders dragger when no validation result and not loading", () => {
    renderModal();
    expect(screen.getByTestId(DATA_TEST_ID.ContentImportModal__Dragger)).toBeInTheDocument();
    expect(
      screen.queryByTestId(DATA_TEST_ID.ContentImportModal__ErrorWrapper),
    ).not.toBeInTheDocument();
  });

  test("renders loading wrapper when dataChecking is true", () => {
    renderModal({ dataChecking: true });
    expect(screen.getByTestId(DATA_TEST_ID.ContentImportModal__LoadingWrapper)).toBeInTheDocument();
    expect(screen.queryByTestId(DATA_TEST_ID.ContentImportModal__Dragger)).not.toBeInTheDocument();
  });

  test("renders error wrapper when validateImportResult has partial mismatch warning", () => {
    const result: ValidateImportResult = {
      type: "warning",
      title: "Some fields don't match the schema",
      description: "2 fields do not match the schema.",
      hint: "Unmatched fields: field1, field2",
      canForwardToImport: true,
    };
    renderModal({ validateImportResult: result });

    expect(screen.getByTestId(DATA_TEST_ID.ContentImportModal__ErrorWrapper)).toBeInTheDocument();
    expect(screen.getByTestId(DATA_TEST_ID.ContentImportModal__ErrorTitle)).toHaveTextContent(
      "Some fields don't match the schema",
    );
    expect(screen.getByTestId(DATA_TEST_ID.ContentImportModal__ErrorDescription)).toHaveTextContent(
      "2 fields do not match the schema.",
    );
    expect(screen.getByTestId(DATA_TEST_ID.ContentImportModal__ErrorHint)).toHaveTextContent(
      "Unmatched fields: field1, field2",
    );
  });

  test("renders error wrapper for complete mismatch without hint", () => {
    const result: ValidateImportResult = {
      type: "error",
      title: "No matching fields found",
      description: "The data file does not match the schema.",
    };
    renderModal({ validateImportResult: result });

    expect(screen.getByTestId(DATA_TEST_ID.ContentImportModal__ErrorTitle)).toHaveTextContent(
      "No matching fields found",
    );
    expect(
      screen.queryByTestId(DATA_TEST_ID.ContentImportModal__ErrorHint),
    ).not.toBeInTheDocument();
  });

  test("shows 'import anyway' button only for forwardable warnings", () => {
    const forwardable: ValidateImportResult = {
      type: "warning",
      title: "Some fields don't match",
      description: "Partial match",
      canForwardToImport: true,
    };
    const { unmount } = renderModal({ validateImportResult: forwardable });

    expect(screen.getByRole("button", { name: /import anyway/i })).toBeInTheDocument();
    unmount();

    const nonForwardable: ValidateImportResult = {
      type: "error",
      title: "No matching fields found",
      description: "Complete mismatch",
    };
    renderModal({ validateImportResult: nonForwardable });
    expect(screen.queryByRole("button", { name: /import anyway/i })).not.toBeInTheDocument();
  });

  test("'go back' button resets validation result and alert list", async () => {
    const setValidateImportResult = vi.fn();
    const setAlertList = vi.fn();
    const result: ValidateImportResult = {
      type: "error",
      title: "No matching fields found",
      description: "Complete mismatch",
    };
    renderModal({ validateImportResult: result, setValidateImportResult, setAlertList });

    const goBackButton = screen.getByRole("button", { name: /go back/i });
    await userEvent.click(goBackButton);

    expect(setValidateImportResult).toHaveBeenCalledWith(null);
    expect(setAlertList).toHaveBeenCalledWith([]);
  });

  test("hides error wrapper when validateImportResult is null", () => {
    renderModal({ validateImportResult: null });
    expect(
      screen.queryByTestId(DATA_TEST_ID.ContentImportModal__ErrorWrapper),
    ).not.toBeInTheDocument();
  });
});
