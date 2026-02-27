import { render, screen } from "@testing-library/react";
import { Viewer as CesiumViewer } from "cesium";
import { createRef } from "react";
import { CesiumComponentRef } from "resium";
import { describe, expect, test, vi } from "vitest";

vi.mock("@reearth-cms/components/atoms/ResiumViewer", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="resium-viewer">{children}</div>
  ),
}));

vi.mock("./Cesium3dTileSetComponent", () => ({
  default: () => <div data-testid="cesium-3d-tileset" />,
}));

vi.mock("@reearth-cms/gql", () => ({
  useAuthHeader: () => ({
    getHeader: vi.fn().mockResolvedValue({}),
  }),
}));

vi.mock("cesium", () => ({
  Resource: vi.fn(),
}));

import Geo3dViewer from ".";

const defaultProps = {
  url: "https://example.com/tileset.json",
  viewerRef: createRef<CesiumComponentRef<CesiumViewer>>(),
  workspaceSettings: {},
} as const;

describe("Geo3dViewer", () => {
  test(".zip URL triggers setAssetUrl with tileset.json", () => {
    const setAssetUrl = vi.fn();
    render(
      <Geo3dViewer {...defaultProps} url="https://example.com/model.zip" setAssetUrl={setAssetUrl} />,
    );
    expect(setAssetUrl).toHaveBeenCalledWith("https://example.com/model/tileset.json");
  });

  test(".7z URL triggers setAssetUrl with tileset.json", () => {
    const setAssetUrl = vi.fn();
    render(
      <Geo3dViewer {...defaultProps} url="https://example.com/model.7z" setAssetUrl={setAssetUrl} />,
    );
    expect(setAssetUrl).toHaveBeenCalledWith("https://example.com/model/tileset.json");
  });

  test(".json URL does not call setAssetUrl", () => {
    const setAssetUrl = vi.fn();
    render(<Geo3dViewer {...defaultProps} setAssetUrl={setAssetUrl} />);
    expect(setAssetUrl).not.toHaveBeenCalled();
  });

  test("renders ResiumViewer wrapping Cesium3dTileSetComponent", () => {
    const setAssetUrl = vi.fn();
    render(<Geo3dViewer {...defaultProps} setAssetUrl={setAssetUrl} />);
    expect(screen.getByTestId("resium-viewer")).toBeInTheDocument();
    expect(screen.getByTestId("cesium-3d-tileset")).toBeInTheDocument();
  });
});
