import { render } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

let capturedProps: { onReady?: (tileset: unknown) => void; [key: string]: unknown } | undefined;
const mockZoomTo = vi.fn().mockResolvedValue(undefined);

vi.mock("resium", () => ({
  Cesium3DTileset: (props: { onReady?: (tileset: unknown) => void; [key: string]: unknown }) => {
    capturedProps = props;
    return <div data-testid="cesium-3d-tileset" />;
  },
  useCesium: () => ({
    viewer: { zoomTo: mockZoomTo },
  }),
}));

import Cesium3dTileSetComponent from "./Cesium3dTileSetComponent";

describe("Cesium3dTileSetComponent", () => {
  beforeEach(() => {
    capturedProps = undefined;
    vi.clearAllMocks();
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn((cb: FrameRequestCallback) => {
        cb(0);
        return 0;
      }),
    );
  });

  test("renders Resium3DTileset", () => {
    render(<Cesium3dTileSetComponent url="https://example.com/tileset.json" />);
    expect(capturedProps).toBeDefined();
  });

  test("onReady zooms to tileset and sets show to true when not destroyed", async () => {
    render(<Cesium3dTileSetComponent url="https://example.com/tileset.json" />);
    const mockTileset = { isDestroyed: () => false, show: false };
    await capturedProps?.onReady?.(mockTileset);

    expect(mockZoomTo).toHaveBeenCalledWith(mockTileset);
    expect(mockTileset.show).toBe(true);
  });

  test("onReady skips zoom when tileset is destroyed", async () => {
    render(<Cesium3dTileSetComponent url="https://example.com/tileset.json" />);
    const mockTileset = { isDestroyed: () => true, show: false };
    await capturedProps?.onReady?.(mockTileset);

    expect(mockZoomTo).not.toHaveBeenCalled();
    expect(mockTileset.show).toBe(false);
  });

  test("passes additional props through to Resium3DTileset", () => {
    render(
      <Cesium3dTileSetComponent
        url="https://example.com/tileset.json"
        maximumScreenSpaceError={16}
      />,
    );
    expect(capturedProps?.url).toBe("https://example.com/tileset.json");
    expect(capturedProps?.maximumScreenSpaceError).toBe(16);
  });
});
