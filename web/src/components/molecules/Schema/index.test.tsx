import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";

import type { Model } from "@reearth-cms/components/molecules/Model/types";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";


import type { Group } from "./types";

import SchemaComponent from ".";

vi.mock("@reearth-cms/components/atoms/InnerContents/complex", () => ({
  default: (props: { left: React.ReactNode; center: React.ReactNode; right: React.ReactNode }) => (
    <div>
      <div data-testid="left">{props.left}</div>
      <div data-testid="center">{props.center}</div>
      <div data-testid="right">{props.right}</div>
    </div>
  ),
}));

vi.mock("@reearth-cms/components/molecules/Common/Sidebar", () => ({
  default: (props: { children: React.ReactNode }) => (
    <div data-testid="Sidebar">{props.children}</div>
  ),
}));

vi.mock("@reearth-cms/components/molecules/Schema/FieldList", () => ({
  default: () => <div data-testid="FieldList" />,
}));

vi.mock("@reearth-cms/components/molecules/Schema/ModelFieldList", () => ({
  default: (props: { isMeta?: boolean }) => (
    <div data-testid="ModelFieldList" data-is-meta={String(props.isMeta ?? false)} />
  ),
}));

vi.mock("./ImportSchemaModal", () => ({
  default: () => <div data-testid="ImportSchemaModal" />,
}));

const makeModelData = (overrides?: Partial<Model>): Model => ({
  id: "model-1",
  name: "TestModel",
  description: "A test model",
  key: "test-model",
  schemaId: "schema-1",
  schema: { id: "schema-1", fields: [] },
  metadataSchema: { id: "meta-1", fields: [] },
  ...overrides,
});

const makeGroupData = (): Group => ({
  id: "group-1",
  name: "TestGroup",
  description: "A test group",
  key: "test-group",
  schemaId: "schema-1",
  projectId: "project-1",
  schema: { id: "schema-1", fields: [] },
  order: 0,
});

const defaultProps = {
  data: undefined as Model | Group | undefined,
  collapsed: false,
  page: 1,
  pageSize: 10,
  assetList: [],
  loading: false,
  fieldsCreationLoading: false,
  selectedAsset: undefined,
  selectedSchemaType: "model" as const,
  hasCreateRight: true,
  hasUpdateRight: true,
  hasDeleteRight: true,
  fileList: [],
  alertList: undefined,
  uploadType: "local" as const,
  uploadUrl: { url: "", autoUnzip: false },
  uploading: false,
  importFields: [],
  fieldsCreationError: undefined,
  setImportFields: vi.fn(),
  setUploadUrl: vi.fn(),
  setUploadType: vi.fn(),
  totalCount: 0,
  onSearchTerm: vi.fn(),
  onAssetsReload: vi.fn(),
  onAssetsCreate: vi.fn(),
  onAssetCreateFromUrl: vi.fn(),
  onAssetTableChange: vi.fn(),
  onAssetSelect: vi.fn(),
  onModalOpen: vi.fn(),
  onDeletionModalOpen: vi.fn(),
  modelsMenu: <div data-testid="ModelsMenu" />,
  setIsMeta: vi.fn(),
  onCollapse: vi.fn(),
  onFieldReorder: vi.fn(),
  onFieldUpdateModalOpen: vi.fn(),
  onFieldCreationModalOpen: vi.fn(),
  onFieldDelete: vi.fn(),
  onAllFieldsDelete: vi.fn(),
  importSchemaModalVisibility: false,
  selectFileModalVisibility: false,
  uploadModalVisibility: false,
  onSchemaImportModalOpen: vi.fn(),
  onSchemaImportModalCancel: vi.fn(),
  onSelectFileModalOpen: vi.fn(),
  onSelectFileModalCancel: vi.fn(),
  onUploadModalOpen: vi.fn(),
  onUploadModalCancel: vi.fn(),
  currentImportSchemaModalPage: 0,
  toSchemaPreviewStep: vi.fn(),
  toImportingStep: vi.fn(),
  toFileSelectionStep: vi.fn(),
  dataChecking: false,
  onFileContentChange: vi.fn(),
  onFileRemove: vi.fn(),
};

describe("Schema", () => {
  const user = userEvent.setup();

  test("does not render PageHeader when data is undefined", () => {
    render(<SchemaComponent {...defaultProps} data={undefined} />);
    expect(screen.queryByText("TestModel")).not.toBeInTheDocument();
  });

  test("renders PageHeader with model name when data is provided", () => {
    render(<SchemaComponent {...defaultProps} data={makeModelData()} />);
    expect(screen.getByText("TestModel")).toBeVisible();
    expect(screen.getByText("#test-model")).toBeVisible();
  });

  test("renders tabs for model schema type", () => {
    render(
      <SchemaComponent
        {...defaultProps}
        data={makeModelData()}
        selectedSchemaType="model"
      />,
    );
    expect(screen.getByText("Fields")).toBeVisible();
    expect(screen.getByTestId(DATA_TEST_ID.Schema__MetaDataTab)).toBeVisible();
  });

  test("does not render tabs for group schema type", () => {
    render(
      <SchemaComponent
        {...defaultProps}
        data={makeGroupData()}
        selectedSchemaType="group"
      />,
    );
    expect(screen.queryByTestId(DATA_TEST_ID.Schema__FieldsTabs)).not.toBeInTheDocument();
  });

  test("renders ModelFieldList in group mode without tabs", () => {
    render(
      <SchemaComponent
        {...defaultProps}
        data={makeGroupData()}
        selectedSchemaType="group"
      />,
    );
    const fieldLists = screen.getAllByTestId("ModelFieldList");
    expect(fieldLists.length).toBeGreaterThan(0);
  });

  test("calls setIsMeta with true when Meta Data tab is clicked", async () => {
    const setIsMeta = vi.fn();
    render(
      <SchemaComponent
        {...defaultProps}
        data={makeModelData()}
        selectedSchemaType="model"
        setIsMeta={setIsMeta}
      />,
    );
    await user.click(screen.getByTestId(DATA_TEST_ID.Schema__MetaDataTab));
    expect(setIsMeta).toHaveBeenCalledWith(true);
  });

  test("renders Sidebar with modelsMenu", () => {
    render(<SchemaComponent {...defaultProps} data={makeModelData()} />);
    expect(screen.getByTestId("Sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("ModelsMenu")).toBeInTheDocument();
  });

  test("renders FieldList in right panel", () => {
    render(<SchemaComponent {...defaultProps} data={makeModelData()} />);
    expect(screen.getByTestId("FieldList")).toBeInTheDocument();
  });

  test("renders ImportSchemaModal", () => {
    render(<SchemaComponent {...defaultProps} data={makeModelData()} />);
    expect(screen.getByTestId("ImportSchemaModal")).toBeInTheDocument();
  });

  test("renders PageHeader with group name for group data", () => {
    render(
      <SchemaComponent
        {...defaultProps}
        data={makeGroupData()}
        selectedSchemaType="group"
      />,
    );
    expect(screen.getByText("TestGroup")).toBeVisible();
    expect(screen.getByText("#test-group")).toBeVisible();
  });

  test("calls setIsMeta with false when Fields tab is clicked", async () => {
    const setIsMeta = vi.fn();
    render(
      <SchemaComponent
        {...defaultProps}
        data={makeModelData()}
        selectedSchemaType="model"
        setIsMeta={setIsMeta}
      />,
    );
    // First click Meta Data to switch tabs
    await user.click(screen.getByTestId(DATA_TEST_ID.Schema__MetaDataTab));
    // Then click Fields
    await user.click(screen.getByText("Fields"));
    expect(setIsMeta).toHaveBeenCalledWith(false);
  });

  test("renders dropdown more button when data exists", () => {
    render(<SchemaComponent {...defaultProps} data={makeModelData()} />);
    expect(screen.getByRole("button", { name: "more" })).toBeInTheDocument();
  });

  test("calls onModalOpen when Edit dropdown item is clicked", async () => {
    const onModalOpen = vi.fn();
    render(
      <SchemaComponent {...defaultProps} data={makeModelData()} onModalOpen={onModalOpen} />,
    );
    const moreButton = screen.getByRole("button", { name: "more" });
    await user.hover(moreButton);
    // Wait for dropdown menu to appear
    const editItem = await screen.findByText("Edit");
    await user.click(editItem);
    expect(onModalOpen).toHaveBeenCalledOnce();
  });
});
