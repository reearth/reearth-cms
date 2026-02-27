import { screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, test, vi } from "vitest";

vi.mock("@reearth-cms/i18n", () => ({ useT: () => (key: string) => key }));
vi.mock("@reearth-cms/utils/format", () => ({
  dateTimeFormat: (date?: string) => date ?? "",
  bytesFormat: (bytes: number) => `${bytes} Bytes`,
}));
vi.mock("@reearth-cms/components/atoms/Icon", () => ({
  default: ({ icon }: { icon: string }) => <span data-testid={`icon-${icon}`} />,
}));
vi.mock("@reearth-cms/components/atoms/CopyButton", () => ({
  default: () => <span data-testid="copy-button" />,
}));
vi.mock("@reearth-cms/components/atoms/DownloadButton", () => ({
  default: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => (
    <button data-testid={props["data-testid"] ?? "download-button"}>{children}</button>
  ),
}));
vi.mock("@reearth-cms/components/molecules/Asset/Viewers", () => ({
  GeoViewer: () => <div data-testid="geo-viewer" />,
  Geo3dViewer: () => <div data-testid="geo-3d-viewer" />,
  MvtViewer: () => <div data-testid="mvt-viewer" />,
  ImageViewer: () => <div data-testid="image-viewer" />,
  SvgViewer: () => <div data-testid="svg-viewer" />,
  GltfViewer: () => <div data-testid="gltf-viewer" />,
  CsvViewer: () => <div data-testid="csv-viewer" />,
}));
vi.mock("@reearth-cms/components/molecules/Asset/AssetListTable/ArchiveExtractionStatus", () => ({
  default: () => <span data-testid="archive-status" />,
}));
vi.mock("@reearth-cms/components/molecules/Asset/Asset/AssetBody/UnzipFileList", () => ({
  default: () => <div data-testid="unzip-file-list" />,
}));

import { Asset, ViewerType } from "@reearth-cms/components/molecules/Asset/types";
import { render } from "@reearth-cms/test/utils";

import AssetMolecule from "./Asset";

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
  asset: createAsset(),
  isModalVisible: false,
  viewerRef: createRef<never>(),
  displayUnzipFileList: false,
  decompressing: false,
  hasUpdateRight: true,
  onAssetItemSelect: vi.fn(),
  onAssetDecompress: vi.fn(),
  onAssetDownload: vi.fn().mockResolvedValue(undefined),
  onModalCancel: vi.fn(),
  onTypeChange: vi.fn(),
  onChangeToFullScreen: vi.fn(),
  workspaceSettings: { tiles: { resources: [] }, terrainCesiumIonAssetId: "" },
};

describe("AssetMolecule", () => {
  describe("viewer dispatch", () => {
    const viewerCases: [ViewerType, string][] = [
      ["image", "image-viewer"],
      ["geo", "geo-viewer"],
      ["geo_3d_tiles", "geo-3d-viewer"],
      ["geo_mvt", "mvt-viewer"],
      ["image_svg", "svg-viewer"],
      ["model_3d", "gltf-viewer"],
      ["csv", "csv-viewer"],
    ];

    test.each(viewerCases)(
      "renders correct viewer for viewerType '%s'",
      (viewerType, expectedTestId) => {
        render(<AssetMolecule {...defaultProps} viewerType={viewerType} />);
        expect(screen.getByTestId(expectedTestId)).toBeInTheDocument();
      },
    );

    test("renders ViewerNotSupported for viewerType 'unknown'", () => {
      render(<AssetMolecule {...defaultProps} viewerType="unknown" />);
      expect(screen.getByText("Not supported")).toBeInTheDocument();
    });
  });

  describe("conditional rendering", () => {
    test("shows UnzipFileList card when displayUnzipFileList and asset.file exist", () => {
      render(
        <AssetMolecule
          {...defaultProps}
          displayUnzipFileList={true}
          asset={createAsset({ file: { name: "archive.zip", path: "/archive.zip" } })}
        />,
      );
      expect(screen.getByTestId("unzip-file-list")).toBeInTheDocument();
    });

    test("hides UnzipFileList card when displayUnzipFileList is false", () => {
      render(
        <AssetMolecule
          {...defaultProps}
          displayUnzipFileList={false}
          asset={createAsset({ file: { name: "archive.zip", path: "/archive.zip" } })}
        />,
      );
      expect(screen.queryByTestId("unzip-file-list")).not.toBeInTheDocument();
    });

    test("shows Unzip button when archiveExtractionStatus is SKIPPED", () => {
      render(
        <AssetMolecule
          {...defaultProps}
          displayUnzipFileList={true}
          asset={createAsset({
            file: { name: "archive.zip", path: "/archive.zip" },
            archiveExtractionStatus: "SKIPPED",
          })}
        />,
      );
      expect(screen.getByText("Unzip")).toBeInTheDocument();
    });

    test("hides Unzip button when archiveExtractionStatus is not SKIPPED", () => {
      render(
        <AssetMolecule
          {...defaultProps}
          displayUnzipFileList={true}
          asset={createAsset({
            file: { name: "archive.zip", path: "/archive.zip" },
            archiveExtractionStatus: "DONE",
          })}
        />,
      );
      expect(screen.queryByText("Unzip")).not.toBeInTheDocument();
    });
  });

  describe("callbacks and sidebar", () => {
    test("calls onAssetDecompress on Unzip button click", () => {
      const onAssetDecompress = vi.fn();
      render(
        <AssetMolecule
          {...defaultProps}
          onAssetDecompress={onAssetDecompress}
          displayUnzipFileList={true}
          asset={createAsset({
            file: { name: "archive.zip", path: "/archive.zip" },
            archiveExtractionStatus: "SKIPPED",
          })}
        />,
      );
      screen.getByText("Unzip").click();
      expect(onAssetDecompress).toHaveBeenCalledWith("asset-1");
    });

    test("renders linked items and calls onAssetItemSelect on click", () => {
      const onAssetItemSelect = vi.fn();
      const items = [
        { itemId: "item-1", modelId: "model-1" },
        { itemId: "item-2", modelId: "model-2" },
      ];
      render(
        <AssetMolecule
          {...defaultProps}
          onAssetItemSelect={onAssetItemSelect}
          asset={createAsset({ items })}
        />,
      );
      expect(screen.getByText("item-1")).toBeInTheDocument();
      expect(screen.getByText("item-2")).toBeInTheDocument();

      screen.getByText("item-1").click();
      expect(onAssetItemSelect).toHaveBeenCalledWith(items[0]);
    });

    test("displays asset info (ID, filename)", () => {
      render(<AssetMolecule {...defaultProps} asset={createAsset()} />);
      expect(screen.getByText("asset-1")).toBeInTheDocument();
      expect(screen.getByText("test-file.png")).toBeInTheDocument();
    });
  });
});
