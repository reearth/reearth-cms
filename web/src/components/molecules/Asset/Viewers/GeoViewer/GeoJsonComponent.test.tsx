import { render, waitFor } from "@testing-library/react";
import { Resource } from "cesium";
import { beforeEach, describe, expect, test, vi } from "vitest";

let capturedProps:
  | { data: unknown; clampToGround?: boolean; onLoad?: (ds: unknown) => void }
  | undefined;
const mockZoomTo = vi.fn().mockResolvedValue(undefined);

vi.mock("resium", () => ({
  GeoJsonDataSource: (props: {
    data: unknown;
    clampToGround?: boolean;
    onLoad?: (ds: unknown) => void;
  }) => {
    capturedProps = props;
    return <div data-testid="geojson-data-source" />;
  },
  useCesium: () => ({
    viewer: { zoomTo: mockZoomTo },
  }),
}));

vi.mock("@reearth-cms/gql", () => ({
  useAuthHeader: () => ({
    getHeader: vi.fn().mockResolvedValue({ Authorization: "Bearer token" }),
  }),
}));

vi.mock("cesium", () => {
  const MockResource = vi.fn();
  return { Resource: MockResource };
});

import GeoJsonComponent from "./GeoJsonComponent";

const url = "https://example.com/data.geojson";

describe("GeoJsonComponent", () => {
  beforeEach(() => {
    capturedProps = undefined;
    vi.clearAllMocks();
  });

  test("renders GeoJsonDataSource", () => {
    render(<GeoJsonComponent isAssetPublic url={url} />);
    expect(capturedProps).toBeDefined();
  });

  test("public asset passes URL string directly as data prop", () => {
    render(<GeoJsonComponent isAssetPublic url={url} />);
    expect(capturedProps?.data).toBe(url);
  });

  test("private asset creates Resource with auth headers", async () => {
    render(<GeoJsonComponent isAssetPublic={false} url={url} />);
    await waitFor(() => expect(Resource).toHaveBeenCalled());
    expect(Resource).toHaveBeenCalledWith({
      url,
      headers: { Authorization: "Bearer token" },
    });
  });

  test("onLoad zooms to entities and sets show to true", async () => {
    render(<GeoJsonComponent isAssetPublic url={url} />);
    const mockDs = { entities: [{ id: "1" }], show: false };
    await capturedProps?.onLoad?.(mockDs);

    expect(mockZoomTo).toHaveBeenCalledWith(mockDs.entities);
    expect(mockDs.show).toBe(true);
  });

  test("passes clampToGround prop", () => {
    render(<GeoJsonComponent isAssetPublic url={url} />);
    expect(capturedProps?.clampToGround).toBe(true);
  });
});
