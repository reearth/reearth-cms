import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";

import { DATA_TEST_ID } from "@reearth-cms/test/utils";

import type { ImportFieldInput } from "../types";

import ImportSchemaModal from ".";

vi.mock("./FileSelectionStep", () => ({
  default: () => <div data-testid="FileSelectionStep" />,
}));

vi.mock("./SchemaPreviewStep", () => ({
  default: () => <div data-testid="SchemaPreviewStep" />,
}));

vi.mock("./ImportingStep", () => ({
  default: () => <div data-testid="ImportingStep" />,
}));

const makeField = (overrides?: Partial<ImportFieldInput>): ImportFieldInput => ({
  type: "Text",
  title: "Test Field",
  key: "test-field",
  description: "",
  multiple: false,
  unique: false,
  required: false,
  isTitle: false,
  typeProperty: {},
  ...overrides,
});

const defaultProps = {
  visible: true,
  selectFileModalVisibility: false,
  currentPage: 0,
  assetList: [],
  loading: false,
  fieldsCreationLoading: false,
  totalCount: 0,
  selectedAsset: undefined,
  fileList: [],
  alertList: undefined,
  uploadType: "local" as const,
  uploadUrl: { url: "", autoUnzip: false },
  uploading: false,
  uploadModalVisibility: false,
  page: 1,
  pageSize: 10,
  hasCreateRight: true,
  hasUpdateRight: true,
  hasDeleteRight: true,
  onUploadModalOpen: vi.fn(),
  onUploadModalCancel: vi.fn(),
  toSchemaPreviewStep: vi.fn(),
  toImportingStep: vi.fn(),
  toFileSelectionStep: vi.fn(),
  fields: [makeField()],
  fieldsCreationError: undefined,
  setFields: vi.fn(),
  setUploadUrl: vi.fn(),
  setUploadType: vi.fn(),
  onSearchTerm: vi.fn(),
  onAssetsReload: vi.fn(),
  onAssetTableChange: vi.fn(),
  onAssetSelect: vi.fn(),
  onAssetsCreate: vi.fn(),
  onAssetCreateFromUrl: vi.fn(),
  onSelectFile: vi.fn(),
  onSelectFileModalCancel: vi.fn(),
  onModalClose: vi.fn(),
  dataChecking: false,
  onFileContentChange: vi.fn(),
  onFileRemove: vi.fn(),
};

describe("ImportSchemaModal", () => {
  const user = userEvent.setup();

  test("renders modal with title", () => {
    render(<ImportSchemaModal {...defaultProps} />);
    expect(screen.getByText("Import Schema")).toBeInTheDocument();
  });

  test("renders FileSelectionStep on page 0", () => {
    render(<ImportSchemaModal {...defaultProps} currentPage={0} />);
    expect(screen.getByTestId("FileSelectionStep")).toBeInTheDocument();
    expect(screen.queryByTestId("SchemaPreviewStep")).not.toBeInTheDocument();
    expect(screen.queryByTestId("ImportingStep")).not.toBeInTheDocument();
  });

  test("renders SchemaPreviewStep on page 1", () => {
    render(<ImportSchemaModal {...defaultProps} currentPage={1} />);
    expect(screen.getByTestId("SchemaPreviewStep")).toBeInTheDocument();
    expect(screen.queryByTestId("FileSelectionStep")).not.toBeInTheDocument();
  });

  test("renders ImportingStep on page 2", () => {
    render(<ImportSchemaModal {...defaultProps} currentPage={2} />);
    expect(screen.getByTestId("ImportingStep")).toBeInTheDocument();
    expect(screen.queryByTestId("FileSelectionStep")).not.toBeInTheDocument();
  });

  test("shows Back and Import buttons on page 1", () => {
    render(<ImportSchemaModal {...defaultProps} currentPage={1} />);
    expect(screen.getByText("Back")).toBeInTheDocument();
    expect(screen.getByText("Import")).toBeInTheDocument();
  });

  test("does not show Back/Import buttons on page 0", () => {
    render(<ImportSchemaModal {...defaultProps} currentPage={0} />);
    expect(screen.queryByText("Back")).not.toBeInTheDocument();
    expect(screen.queryByText("Import")).not.toBeInTheDocument();
  });

  test("does not show Back/Import buttons on page 2", () => {
    render(<ImportSchemaModal {...defaultProps} currentPage={2} />);
    expect(screen.queryByText("Back")).not.toBeInTheDocument();
    expect(screen.queryByText("Import")).not.toBeInTheDocument();
  });

  test("calls toFileSelectionStep when Back is clicked", async () => {
    const toFileSelectionStep = vi.fn();
    render(
      <ImportSchemaModal
        {...defaultProps}
        currentPage={1}
        toFileSelectionStep={toFileSelectionStep}
      />,
    );
    await user.click(screen.getByText("Back"));
    expect(toFileSelectionStep).toHaveBeenCalledOnce();
  });

  test("Import button is disabled when all fields are hidden", () => {
    const fields = [makeField({ hidden: true }), makeField({ key: "f2", hidden: true })];
    render(<ImportSchemaModal {...defaultProps} currentPage={1} fields={fields} />);
    expect(screen.getByTestId(DATA_TEST_ID.ImportSchemaModal__ImportButton)).toBeDisabled();
  });

  test("Import button is enabled when some fields are visible", () => {
    const fields = [makeField({ hidden: false }), makeField({ key: "f2", hidden: true })];
    render(<ImportSchemaModal {...defaultProps} currentPage={1} fields={fields} />);
    expect(screen.getByTestId(DATA_TEST_ID.ImportSchemaModal__ImportButton)).not.toBeDisabled();
  });
});
