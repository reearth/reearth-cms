import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";

import Form from "@reearth-cms/components/atoms/Form";

import { SchemaFieldType } from "../../types";

import FieldDefaultInputs from ".";

vi.mock("./TextField", () => ({
  default: (props: Record<string, unknown>) => (
    <div data-testid="TextField" data-multiple={String(props.multiple)} />
  ),
}));
vi.mock("./TextArea", () => ({
  default: (props: Record<string, unknown>) => (
    <div data-testid="TextAreaField" data-multiple={String(props.multiple)} />
  ),
}));
vi.mock("./Markdown", () => ({
  default: (props: Record<string, unknown>) => (
    <div data-testid="MarkdownField" data-multiple={String(props.multiple)} />
  ),
}));
vi.mock("./NumberField", () => ({
  default: (props: Record<string, unknown>) => (
    <div data-testid="NumberField" data-min={String(props.min)} data-max={String(props.max)} />
  ),
}));
vi.mock("./BooleanField", () => ({
  default: () => <div data-testid="BooleanField" />,
}));
vi.mock("./DateField", () => ({
  default: () => <div data-testid="DateField" />,
}));
vi.mock("./TagField", () => ({
  default: (props: Record<string, unknown>) => (
    <div data-testid="TagField" data-has-tags={String(!!props.selectedTags)} />
  ),
}));
vi.mock("./CheckboxField", () => ({
  default: () => <div data-testid="CheckboxField" />,
}));
vi.mock("./AssetField", () => ({
  default: () => <div data-testid="AssetField" />,
}));
vi.mock("./SelectField", () => ({
  default: (props: Record<string, unknown>) => (
    <div data-testid="SelectField" data-has-values={String(!!props.selectedValues)} />
  ),
}));
vi.mock("./URLField", () => ({
  default: () => <div data-testid="URLField" />,
}));
vi.mock("./GroupField", () => ({
  default: () => <div data-testid="GroupField" />,
}));
vi.mock("./GeometryField", () => ({
  default: (props: Record<string, unknown>) => (
    <div data-testid="GeometryField" data-is-editor={String(props.isEditor)} />
  ),
}));

const defaultProps = {
  selectedType: "Text" as SchemaFieldType,
  selectedValues: undefined as string[] | undefined,
  selectedTags: undefined as { id: string; name: string; color: string }[] | undefined,
  selectedSupportedTypes: undefined,
  maxLength: undefined as number | undefined,
  min: undefined as number | undefined,
  max: undefined as number | undefined,
  multiple: false,
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

const renderWithForm = (overrides: Partial<typeof defaultProps> = {}) => {
  return render(
    <Form>
      <FieldDefaultInputs {...defaultProps} {...overrides} />
    </Form>,
  );
};

describe("FieldDefaultInputs dispatcher", () => {
  test("routes Text to TextField", () => {
    renderWithForm({ selectedType: "Text" });
    expect(screen.getByTestId("TextField")).toBeInTheDocument();
  });

  test("routes default (unknown) to TextField", () => {
    renderWithForm({ selectedType: "Text" });
    expect(screen.getByTestId("TextField")).toBeInTheDocument();
  });

  test("routes TextArea to TextAreaField", () => {
    renderWithForm({ selectedType: "TextArea" });
    expect(screen.getByTestId("TextAreaField")).toBeInTheDocument();
  });

  test("routes MarkdownText to MarkdownField", () => {
    renderWithForm({ selectedType: "MarkdownText" });
    expect(screen.getByTestId("MarkdownField")).toBeInTheDocument();
  });

  test("routes Integer to NumberField", () => {
    renderWithForm({ selectedType: "Integer" });
    expect(screen.getByTestId("NumberField")).toBeInTheDocument();
  });

  test("routes Number to NumberField", () => {
    renderWithForm({ selectedType: "Number" });
    expect(screen.getByTestId("NumberField")).toBeInTheDocument();
  });

  test("routes Bool to BooleanField", () => {
    renderWithForm({ selectedType: "Bool" });
    expect(screen.getByTestId("BooleanField")).toBeInTheDocument();
  });

  test("routes Date to DateField", () => {
    renderWithForm({ selectedType: "Date" });
    expect(screen.getByTestId("DateField")).toBeInTheDocument();
  });

  test("routes Tag to TagField", () => {
    renderWithForm({ selectedType: "Tag" });
    expect(screen.getByTestId("TagField")).toBeInTheDocument();
  });

  test("routes Checkbox to CheckboxField", () => {
    renderWithForm({ selectedType: "Checkbox" });
    expect(screen.getByTestId("CheckboxField")).toBeInTheDocument();
  });

  test("routes Asset to AssetField", () => {
    renderWithForm({ selectedType: "Asset" });
    expect(screen.getByTestId("AssetField")).toBeInTheDocument();
  });

  test("routes Select to SelectField", () => {
    renderWithForm({ selectedType: "Select" });
    expect(screen.getByTestId("SelectField")).toBeInTheDocument();
  });

  test("routes URL to URLField", () => {
    renderWithForm({ selectedType: "URL" });
    expect(screen.getByTestId("URLField")).toBeInTheDocument();
  });

  test("routes Group to GroupField", () => {
    renderWithForm({ selectedType: "Group" });
    expect(screen.getByTestId("GroupField")).toBeInTheDocument();
  });

  test("routes GeometryObject to GeometryField with isEditor=false", () => {
    renderWithForm({ selectedType: "GeometryObject" });
    const el = screen.getByTestId("GeometryField");
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute("data-is-editor", "false");
  });

  test("routes GeometryEditor to GeometryField with isEditor=true", () => {
    renderWithForm({ selectedType: "GeometryEditor" });
    const el = screen.getByTestId("GeometryField");
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute("data-is-editor", "true");
  });

  test("passes multiple prop to TextField", () => {
    renderWithForm({ selectedType: "Text", multiple: true });
    expect(screen.getByTestId("TextField")).toHaveAttribute("data-multiple", "true");
  });

  test("passes min and max to NumberField", () => {
    renderWithForm({ selectedType: "Integer", min: 5, max: 50 });
    const el = screen.getByTestId("NumberField");
    expect(el).toHaveAttribute("data-min", "5");
    expect(el).toHaveAttribute("data-max", "50");
  });

  test("passes selectedTags to TagField", () => {
    const tags = [{ id: "1", name: "Tag1", color: "#ff0000" }];
    renderWithForm({ selectedType: "Tag", selectedTags: tags });
    expect(screen.getByTestId("TagField")).toHaveAttribute("data-has-tags", "true");
  });

  test("passes selectedValues to SelectField", () => {
    renderWithForm({ selectedType: "Select", selectedValues: ["a", "b"] });
    expect(screen.getByTestId("SelectField")).toHaveAttribute("data-has-values", "true");
  });
});
