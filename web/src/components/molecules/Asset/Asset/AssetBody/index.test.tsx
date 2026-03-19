import { screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, test, vi } from "vitest";

import { Asset } from "@reearth-cms/components/molecules/Asset/types";
import { render } from "@reearth-cms/test/utils";

import AssetWrapper from ".";

vi.mock("@reearth-cms/i18n", () => ({ useT: () => (key: string) => key }));
vi.mock("@reearth-cms/components/molecules/Asset/Asset/AssetBody/Asset", () => ({
  default: () => <div data-testid="asset-molecule" />,
}));
vi.mock("@reearth-cms/components/atoms/InnerContents/complex", () => ({
  default: ({ center, right }: { center?: React.ReactNode; right?: React.ReactNode }) => (
    <div>
      <div data-testid="center">{center}</div>
      <div data-testid="right">{right}</div>
    </div>
  ),
}));
vi.mock("@reearth-cms/components/atoms/PageHeader", () => ({
  default: ({
    title,
    extra,
    onBack,
  }: {
    title: string;
    extra: React.ReactNode;
    onBack: () => void;
  }) => (
    <div data-testid="page-header">
      <span>{title}</span>
      <button data-testid="back-button" onClick={onBack}>
        Back
      </button>
      {extra}
    </div>
  ),
}));

const createAsset = (overrides?: Partial<Asset>): Asset => ({
  id: "asset-1",
  createdAt: "2024-01-01T00:00:00Z",
  createdBy: { id: "user-1", name: "Test User" },
  createdByType: "User",
  fileName: "test-file.png",
  projectId: "project-1",
  size: 1024,
  url: "https://example.com/assets/test-file.png",
  comments: [],
  items: [],
  public: true,
  ...overrides,
});

const defaultProps = {
  commentsPanel: <div data-testid="comments-panel" />,
  asset: createAsset(),
  isModalVisible: false,
  viewerRef: createRef<never>(),
  displayUnzipFileList: false,
  decompressing: false,
  isSaveDisabled: false,
  updateLoading: false,
  hasUpdateRight: true,
  onAssetItemSelect: vi.fn(),
  onAssetDecompress: vi.fn(),
  onAssetDownload: vi.fn().mockResolvedValue(undefined),
  onTypeChange: vi.fn(),
  onModalCancel: vi.fn(),
  onChangeToFullScreen: vi.fn(),
  onBack: vi.fn(),
  onSave: vi.fn(),
  workspaceSettings: { tiles: { resources: [] }, terrainCesiumIonAssetId: "" },
};

describe("AssetWrapper", () => {
  test("renders page title with 'Asset / {fileName}'", () => {
    render(<AssetWrapper {...defaultProps} />);
    expect(screen.getByText("Asset / test-file.png")).toBeInTheDocument();
  });

  test("renders Save button enabled when isSaveDisabled is false", () => {
    render(<AssetWrapper {...defaultProps} isSaveDisabled={false} />);
    const saveButton = screen.getByText("Save");
    expect(saveButton.closest("button")).not.toBeDisabled();
  });

  test("renders Save button disabled when isSaveDisabled is true", () => {
    render(<AssetWrapper {...defaultProps} isSaveDisabled={true} />);
    const saveButton = screen.getByText("Save");
    expect(saveButton.closest("button")).toBeDisabled();
  });

  test("calls onSave on Save button click", () => {
    const onSave = vi.fn();
    render(<AssetWrapper {...defaultProps} onSave={onSave} />);
    screen.getByText("Save").click();
    expect(onSave).toHaveBeenCalledOnce();
  });

  test("calls onBack on back button click", () => {
    const onBack = vi.fn();
    render(<AssetWrapper {...defaultProps} onBack={onBack} />);
    screen.getByTestId("back-button").click();
    expect(onBack).toHaveBeenCalledOnce();
  });
});
