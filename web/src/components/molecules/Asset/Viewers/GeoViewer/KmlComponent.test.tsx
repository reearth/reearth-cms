import { render, waitFor } from "@testing-library/react";
import { ConstantProperty, Resource } from "cesium";
import { beforeEach, describe, expect, test, vi } from "vitest";

import KmlComponent from "./KmlComponent";

let capturedProps: { data: unknown; clampToGround?: boolean; onLoad?: (ds: unknown) => void } | undefined;
const mockZoomTo = vi.fn().mockResolvedValue(undefined);

vi.mock("resium", () => ({
  KmlDataSource: (props: {
    data: unknown;
    clampToGround?: boolean;
    onLoad?: (ds: unknown) => void;
  }) => {
    capturedProps = props;
    return <div data-testid="kml-data-source" />;
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
  const MockConstantProperty = vi.fn();
  return { Resource: MockResource, ConstantProperty: MockConstantProperty };
});

const url = "https://example.com/data.kml";

describe("KmlComponent", () => {
  beforeEach(() => {
    capturedProps = undefined;
    vi.clearAllMocks();
  });

  test("renders KmlDataSource", () => {
    render(<KmlComponent isAssetPublic url={url} />);
    expect(capturedProps).toBeDefined();
  });

  test("public asset passes URL string directly as data prop", () => {
    render(<KmlComponent isAssetPublic url={url} />);
    expect(capturedProps?.data).toBe(url);
  });

  test("private asset creates Resource with auth headers", async () => {
    render(<KmlComponent isAssetPublic={false} url={url} />);
    await waitFor(() => expect(Resource).toHaveBeenCalled());
    expect(Resource).toHaveBeenCalledWith({
      url,
      headers: { Authorization: "Bearer token" },
    });
  });

  test("onLoad sets disableDepthTestDistance on billboard entities", async () => {
    render(<KmlComponent isAssetPublic url={url} />);
    const billboard = { disableDepthTestDistance: null };
    const mockDs = {
      entities: { values: [{ billboard, label: null }] },
      show: false,
    };
    await capturedProps?.onLoad?.(mockDs);

    expect(ConstantProperty).toHaveBeenCalledWith(Number.POSITIVE_INFINITY);
    expect(billboard.disableDepthTestDistance).toBeInstanceOf(ConstantProperty);
  });

  test("onLoad sets disableDepthTestDistance on label entities", async () => {
    render(<KmlComponent isAssetPublic url={url} />);
    const label = { disableDepthTestDistance: null };
    const mockDs = {
      entities: { values: [{ billboard: null, label }] },
      show: false,
    };
    await capturedProps?.onLoad?.(mockDs);

    expect(ConstantProperty).toHaveBeenCalledWith(Number.POSITIVE_INFINITY);
    expect(label.disableDepthTestDistance).toBeInstanceOf(ConstantProperty);
  });

  test("onLoad zooms to entities and sets show to true", async () => {
    render(<KmlComponent isAssetPublic url={url} />);
    const mockDs = {
      entities: { values: [] },
      show: false,
    };
    await capturedProps?.onLoad?.(mockDs);

    expect(mockZoomTo).toHaveBeenCalledWith(mockDs.entities);
    expect(mockDs.show).toBe(true);
  });
});
