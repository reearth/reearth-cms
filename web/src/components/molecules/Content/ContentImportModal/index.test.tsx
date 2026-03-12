import { useState } from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { type AlertProps } from "@reearth-cms/components/atoms/Alert";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { SchemaFieldType } from "@reearth-cms/components/molecules/Schema/types";
import { ValidateImportResult } from "@reearth-cms/components/organisms/Project/Content/ContentList/hooks";
import {
  DATA_TEST_ID,
  fireEvent,
  render,
  screen,
  Test,
  userEvent,
  waitFor,
} from "@reearth-cms/test/utils";

import ContentImportModal from ".";

const mockParseTextFile = vi.fn();
const mockGetExtension = vi.fn();
const mockSafeJSONParse = vi.fn();
const mockValidateContent = vi.fn();
const mockConvertCSVToJSON = vi.fn();

vi.mock("@reearth-cms/utils/file", () => ({
  FileUtils: {
    parseTextFile: (...args: unknown[]) => mockParseTextFile(...args),
    getExtension: (...args: unknown[]) => mockGetExtension(...args),
    MBtoBytes: (mb: number) => mb * 1024 * 1024,
  },
}));

vi.mock("@reearth-cms/utils/object", () => ({
  ObjectUtils: {
    safeJSONParse: (...args: unknown[]) => mockSafeJSONParse(...args),
  },
}));

vi.mock("@reearth-cms/utils/importContent", () => ({
  ImportContentUtils: {
    validateContent: (...args: unknown[]) => mockValidateContent(...args),
    convertCSVToJSON: (...args: unknown[]) => mockConvertCSVToJSON(...args),
  },
}));

const mockModelFields: Model["schema"]["fields"] = [
  {
    id: "field-1",
    type: SchemaFieldType.Text,
    title: "Name",
    key: "name",
    description: "",
    required: false,
    unique: false,
    multiple: false,
    isTitle: true,
  },
  {
    id: "field-2",
    type: SchemaFieldType.Integer,
    title: "Age",
    key: "age",
    description: "",
    required: false,
    unique: false,
    multiple: false,
    isTitle: false,
  },
];

const mockOnClose = vi.fn();
const mockOnEnqueueJob = vi.fn();
const mockOnSetDataChecking = vi.fn();

type WrapperProps = {
  modelFields?: Model["schema"]["fields"];
};

const StatefulWrapper: React.FC<WrapperProps> = ({ modelFields = mockModelFields }) => {
  const [alertList, setAlertList] = useState<AlertProps[]>([]);
  const [validateImportResult, setValidateImportResult] = useState<ValidateImportResult | null>(
    null,
  );
  return (
    <MemoryRouter>
      <ContentImportModal
        isOpen={true}
        dataChecking={false}
        modelFields={modelFields}
        workspaceId="ws-1"
        projectId="proj-1"
        modelId="model-1"
        onSetDataChecking={mockOnSetDataChecking}
        onClose={mockOnClose}
        onEnqueueJob={mockOnEnqueueJob}
        alertList={alertList}
        setAlertList={setAlertList}
        validateImportResult={validateImportResult}
        setValidateImportResult={setValidateImportResult}
      />
    </MemoryRouter>
  );
};

const getFileInput = () => {
  const dragger = screen.getByTestId(DATA_TEST_ID.ContentImportModal__FileSelect);
  const input = dragger.querySelector("input[type='file']");
  if (!input) {
    // Ant Design Upload may render input as sibling — fallback to document query
    const container = dragger.closest(".ant-modal-body") ?? document;
    return container.querySelector("input[type='file']") as HTMLInputElement;
  }
  return input as HTMLInputElement;
};

const uploadJsonFile = async (fileName = "test.json") => {
  const file = Test.createMockRcFile({ name: fileName, type: "application/json" });
  mockGetExtension.mockReturnValue("json");
  mockParseTextFile.mockResolvedValue('[{"name":"test"}]');
  mockSafeJSONParse.mockResolvedValue({ isValid: true, data: [{ name: "test" }] });

  const input = getFileInput();
  fireEvent.change(input, { target: { files: [file] } });

  await waitFor(() => expect(mockParseTextFile).toHaveBeenCalled());

  return file;
};

const uploadCsvFile = async (fileName = "test.csv") => {
  const file = Test.createMockRcFile({ name: fileName, type: "text/csv" });
  mockGetExtension.mockReturnValue("csv");
  mockParseTextFile.mockResolvedValue("name,age\ntest,1");
  mockConvertCSVToJSON.mockResolvedValue({ isValid: true, data: [{ name: "test", age: 1 }] });

  const input = getFileInput();
  fireEvent.change(input, { target: { files: [file] } });

  await waitFor(() => expect(mockParseTextFile).toHaveBeenCalled());

  return file;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ContentImportModal", () => {
  test("shows 'import anyway' button when canForwardToImport is true (partial mismatch)", async () => {
    mockValidateContent.mockResolvedValue({
      isValid: false,
      error: {
        exceedLimit: false,
        typeMismatchFieldKeys: new Set(["age"]),
        outOfRangeFieldKeys: new Set(),
        zodIssues: [],
      },
    });

    render(<StatefulWrapper />);
    await uploadJsonFile();

    expect(
      await screen.findByTestId(DATA_TEST_ID.ContentImportModal__ErrorWrapper),
    ).toBeInTheDocument();
    expect(screen.getByText("import anyway")).toBeInTheDocument();
    expect(screen.getByText("go back")).toBeInTheDocument();
  });

  test("does NOT show 'import anyway' button for error results (all fields mismatched)", async () => {
    mockValidateContent.mockResolvedValue({
      isValid: false,
      error: {
        exceedLimit: false,
        typeMismatchFieldKeys: new Set(["name", "age"]),
        outOfRangeFieldKeys: new Set(),
        zodIssues: [],
      },
    });

    render(<StatefulWrapper />);
    await uploadJsonFile();

    expect(
      await screen.findByTestId(DATA_TEST_ID.ContentImportModal__ErrorWrapper),
    ).toBeInTheDocument();
    expect(screen.queryByText("import anyway")).not.toBeInTheDocument();
    expect(screen.getByText("go back")).toBeInTheDocument();
  });

  test("clicking 'import anyway' calls onEnqueueJob and onClose", async () => {
    mockValidateContent.mockResolvedValue({
      isValid: false,
      error: {
        exceedLimit: false,
        typeMismatchFieldKeys: new Set(["age"]),
        outOfRangeFieldKeys: new Set(),
        zodIssues: [],
      },
    });

    render(<StatefulWrapper />);
    const file = await uploadJsonFile("data.json");

    await screen.findByTestId(DATA_TEST_ID.ContentImportModal__ErrorWrapper);

    await userEvent.click(screen.getByText("import anyway"));

    expect(mockOnEnqueueJob).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: "ws-1",
        projectId: "proj-1",
        modelId: "model-1",
        extension: "json",
        fileName: "data.json",
        file,
      }),
    );
    expect(mockOnClose).toHaveBeenCalled();
  });

  test("clicking 'go back' returns to upload screen", async () => {
    mockValidateContent.mockResolvedValue({
      isValid: false,
      error: {
        exceedLimit: false,
        typeMismatchFieldKeys: new Set(["age"]),
        outOfRangeFieldKeys: new Set(),
        zodIssues: [],
      },
    });

    render(<StatefulWrapper />);
    await uploadJsonFile();

    await screen.findByTestId(DATA_TEST_ID.ContentImportModal__ErrorWrapper);

    await userEvent.click(screen.getByText("go back"));

    expect(
      screen.queryByTestId(DATA_TEST_ID.ContentImportModal__ErrorWrapper),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId(DATA_TEST_ID.ContentImportModal__FileSelect)).toBeInTheDocument();
  });

  test("'import anyway' works for CSV files", async () => {
    mockValidateContent.mockResolvedValue({
      isValid: false,
      error: {
        exceedLimit: false,
        typeMismatchFieldKeys: new Set(["age"]),
        outOfRangeFieldKeys: new Set(),
        zodIssues: [],
      },
    });

    render(<StatefulWrapper />);
    const file = await uploadCsvFile("data.csv");

    await screen.findByTestId(DATA_TEST_ID.ContentImportModal__ErrorWrapper);

    await userEvent.click(screen.getByText("import anyway"));

    expect(mockOnEnqueueJob).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: "ws-1",
        projectId: "proj-1",
        modelId: "model-1",
        extension: "csv",
        fileName: "data.csv",
        file,
      }),
    );
    expect(mockOnClose).toHaveBeenCalled();
  });
});
