import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi, beforeEach } from "vitest";

import Form from "@reearth-cms/components/atoms/Form";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";

import type { Field, SchemaFieldType, SelectedSchemaType } from "../types";

const mockHandleMultipleChange = vi.fn();
const mockHandleTabChange = vi.fn();
const mockHandleValuesChange = vi.fn();
const mockHandleNameChange = vi.fn();
const mockHandleKeyChange = vi.fn();
const mockHandleSubmit = vi.fn();
const mockHandleModalReset = vi.fn();

const mockState = {
  buttonDisabled: false,
  activeTab: "settings" as string,
  isRequiredDisabled: false,
  isUniqueDisabled: false,
  isTitleDisabled: false,
};

vi.mock("./hooks", () => ({
  default: () => {
    const [form] = Form.useForm();
    return {
      form,
      buttonDisabled: mockState.buttonDisabled,
      activeTab: mockState.activeTab,
      selectedValues: undefined,
      selectedTags: undefined,
      selectedSupportedTypes: undefined,
      maxLength: undefined,
      min: undefined,
      max: undefined,
      multipleValue: false,
      handleMultipleChange: mockHandleMultipleChange,
      handleTabChange: mockHandleTabChange,
      handleValuesChange: mockHandleValuesChange,
      handleNameChange: mockHandleNameChange,
      handleKeyChange: mockHandleKeyChange,
      handleSubmit: mockHandleSubmit,
      handleModalReset: mockHandleModalReset,
      isRequiredDisabled: mockState.isRequiredDisabled,
      isUniqueDisabled: mockState.isUniqueDisabled,
      keyValidate: vi.fn().mockResolvedValue(undefined),
      isTitleDisabled: mockState.isTitleDisabled,
      ObjectSupportType: [
        { value: "POINT", label: "Point" },
        { value: "LINESTRING", label: "LineString" },
        { value: "POLYGON", label: "Polygon" },
        { value: "GEOMETRYCOLLECTION", label: "GeometryCollection" },
        { value: "MULTIPOINT", label: "MultiPoint" },
        { value: "MULTILINESTRING", label: "MultiLineString" },
        { value: "MULTIPOLYGON", label: "MultiPolygon" },
      ],
      EditorSupportType: [
        { value: "POINT", label: "Point" },
        { value: "LINESTRING", label: "LineString" },
        { value: "POLYGON", label: "Polygon" },
        { value: "ANY", label: "Any" },
      ],
      emptyValidator: vi.fn().mockResolvedValue(undefined),
      duplicatedValidator: vi.fn().mockResolvedValue(undefined),
      errorIndexes: new Set<number>(),
    };
  },
}));

vi.mock(
  "@reearth-cms/components/molecules/Schema/FieldModal/FieldDefaultInputs",
  () => ({
    default: () => <div data-testid="FieldDefaultInputs" />,
  }),
);

vi.mock(
  "@reearth-cms/components/molecules/Schema/FieldModal/FieldValidationInputs",
  () => ({
    default: () => <div data-testid="FieldValidationInputs" />,
  }),
);

// Must import after vi.mock declarations
const { default: FieldModal } = await import(".");

const defaultProps = {
  groups: undefined as import("../types").Group[] | undefined,
  selectedType: "Text" as SchemaFieldType,
  selectedSchemaType: "model" as SelectedSchemaType,
  isMeta: false,
  open: true,
  fieldLoading: false,
  selectedField: null as Field | null,
  handleFieldKeyUnique: vi.fn().mockReturnValue(true),
  onClose: vi.fn(),
  onSubmit: vi.fn().mockResolvedValue(undefined),
  assetList: [],
  fileList: [],
  loadingAssets: false,
  uploading: false,
  uploadModalVisibility: false,
  uploadUrl: { url: "", autoUnzip: false },
  uploadType: "local" as const,
  totalCount: 0,
  page: 1,
  pageSize: 10,
  onAssetTableChange: vi.fn(),
  onUploadModalCancel: vi.fn(),
  setUploadUrl: vi.fn(),
  setUploadType: vi.fn(),
  onAssetsCreate: vi.fn().mockResolvedValue([]),
  onAssetCreateFromUrl: vi.fn().mockResolvedValue(undefined),
  onAssetSearchTerm: vi.fn(),
  onAssetsGet: vi.fn(),
  onAssetsReload: vi.fn(),
  setFileList: vi.fn(),
  setUploadModalVisibility: vi.fn(),
  onGetAsset: vi.fn().mockResolvedValue(undefined),
};

const renderModal = (overrides: Partial<typeof defaultProps> = {}) => {
  return render(<FieldModal {...defaultProps} {...overrides} />);
};

describe("FieldModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState.activeTab = "settings";
    mockState.isTitleDisabled = false;
    mockState.isRequiredDisabled = false;
    mockState.isUniqueDisabled = false;
    mockState.buttonDisabled = false;
  });

  describe("Modal structure", () => {
    test("renders Create title when no selectedField", () => {
      renderModal();
      expect(screen.getByText(/Create .+ Field/)).toBeInTheDocument();
    });

    test("renders Update title when selectedField is provided", () => {
      const field: Field = {
        id: "f1",
        type: "Text",
        title: "My Field",
        key: "my-field",
        description: "",
        required: false,
        unique: false,
        multiple: false,
        isTitle: false,
      };
      renderModal({ selectedField: field });
      expect(screen.getByText(/Update .+ Field/)).toBeInTheDocument();
    });

    test("does not render modal content when open is false", () => {
      renderModal({ open: false });
      expect(
        screen.queryByTestId(DATA_TEST_ID.FieldModal__DisplayNameInput),
      ).not.toBeInTheDocument();
    });
  });

  describe("Footer buttons", () => {
    test("renders Cancel and OK buttons", () => {
      renderModal();
      expect(screen.getByText("Cancel")).toBeInTheDocument();
      expect(screen.getByText("OK")).toBeInTheDocument();
    });

    test("Cancel button calls handleModalReset", async () => {
      const user = userEvent.setup();
      renderModal();
      await user.click(screen.getByText("Cancel"));
      expect(mockHandleModalReset).toHaveBeenCalled();
    });

    test("OK button calls handleSubmit", async () => {
      const user = userEvent.setup();
      renderModal();
      await user.click(screen.getByText("OK"));
      expect(mockHandleSubmit).toHaveBeenCalled();
    });

    test("OK button is disabled when buttonDisabled is true", () => {
      mockState.buttonDisabled = true;
      renderModal();
      expect(screen.getByText("OK").closest("button")).toBeDisabled();
    });
  });

  describe("Settings tab", () => {
    test("renders Display name, Field Key, Description inputs", () => {
      renderModal();
      expect(
        screen.getByTestId(DATA_TEST_ID.FieldModal__DisplayNameInput),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(DATA_TEST_ID.FieldModal__FieldKeyInput),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(DATA_TEST_ID.FieldModal__DescriptionInput),
      ).toBeInTheDocument();
    });

    test("renders Multiple checkbox", () => {
      renderModal();
      expect(
        screen.getByTestId(DATA_TEST_ID.FieldModal__MultipleCheckbox),
      ).toBeInTheDocument();
    });

    test("renders isTitle checkbox when not disabled", () => {
      mockState.isTitleDisabled = false;
      renderModal();
      expect(
        screen.getByTestId(DATA_TEST_ID.FieldModal__IsTitleCheckbox),
      ).toBeInTheDocument();
    });
  });

  describe("Type-specific Settings sections", () => {
    test("renders Select options section for Select type", () => {
      renderModal({ selectedType: "Select" });
      expect(screen.getByText("Set Options")).toBeInTheDocument();
    });

    test("does not render Select options for Text type", () => {
      renderModal({ selectedType: "Text" });
      expect(
        screen.queryByTestId(DATA_TEST_ID.FieldModal__ValuesInput),
      ).not.toBeInTheDocument();
    });

    test("renders Group select for Group type", () => {
      renderModal({
        selectedType: "Group",
        groups: [
          {
            id: "g1",
            name: "Group 1",
            key: "group-1",
            schemaId: "s1",
            description: "",
            projectId: "p1",
            schema: { id: "s1", fields: [] },
            order: 0,
          },
        ],
      });
      expect(screen.getByTestId(DATA_TEST_ID.Schema__GroupSelect)).toBeInTheDocument();
    });

    test("renders GeometryObject checkboxes for GeometryObject type", () => {
      renderModal({ selectedType: "GeometryObject" });
      expect(
        screen.getByTestId(DATA_TEST_ID.FieldModal__PointCheckbox),
      ).toBeInTheDocument();
    });

    test("renders GeometryEditor radios for GeometryEditor type", () => {
      renderModal({ selectedType: "GeometryEditor" });
      const radios = screen.getAllByRole("radio");
      expect(radios.length).toBe(4);
    });
  });

  describe("Validation tab", () => {
    test("renders Required and Unique checkboxes (forceRender)", () => {
      renderModal();
      expect(
        screen.getByTestId(DATA_TEST_ID.FieldModal__RequiredCheckbox),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(DATA_TEST_ID.FieldModal__UniqueCheckbox),
      ).toBeInTheDocument();
    });

    test("Required checkbox is disabled when isRequiredDisabled", () => {
      mockState.isRequiredDisabled = true;
      renderModal();
      expect(
        screen.getByTestId(DATA_TEST_ID.FieldModal__RequiredCheckbox),
      ).toBeDisabled();
    });

    test("Unique checkbox is disabled when isUniqueDisabled", () => {
      mockState.isUniqueDisabled = true;
      renderModal();
      expect(
        screen.getByTestId(DATA_TEST_ID.FieldModal__UniqueCheckbox),
      ).toBeDisabled();
    });

    test("renders FieldValidationInputs marker", () => {
      renderModal();
      expect(screen.getByTestId("FieldValidationInputs")).toBeInTheDocument();
    });
  });

  describe("Default Value tab", () => {
    test("renders FieldDefaultInputs marker (forceRender)", () => {
      renderModal();
      expect(screen.getByTestId("FieldDefaultInputs")).toBeInTheDocument();
    });
  });
});
