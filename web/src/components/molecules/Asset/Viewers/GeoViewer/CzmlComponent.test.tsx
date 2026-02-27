import { render, waitFor } from "@testing-library/react";
import { Resource } from "cesium";
import { beforeEach, describe, expect, test, vi } from "vitest";

import CzmlComponent from "./CzmlComponent";

let capturedProps: { data: unknown; onLoad?: (ds: unknown) => void } | undefined;
const mockZoomTo = vi.fn().mockResolvedValue(undefined);

vi.mock("resium", () => ({
  CzmlDataSource: (props: { data: unknown; onLoad?: (ds: unknown) => void }) => {
    capturedProps = props;
    return <div data-testid="czml-data-source" />;
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

const url = "https://example.com/data.czml";

describe("CzmlComponent", () => {
  beforeEach(() => {
    capturedProps = undefined;
    vi.clearAllMocks();
  });

  test("renders CzmlDataSource", () => {
    render(<CzmlComponent isAssetPublic url={url} />);
    expect(capturedProps).toBeDefined();
  });

  test("public asset passes URL string directly as data prop", () => {
    render(<CzmlComponent isAssetPublic url={url} />);
    expect(capturedProps?.data).toBe(url);
  });

  test("private asset creates Resource with auth headers and uses it as data", async () => {
    render(<CzmlComponent isAssetPublic={false} url={url} />);
    await waitFor(() => expect(Resource).toHaveBeenCalled());
    expect(Resource).toHaveBeenCalledWith({
      url,
      headers: { Authorization: "Bearer token" },
    });
  });

  test("onLoad zooms to entities and sets show to true", async () => {
    render(<CzmlComponent isAssetPublic url={url} />);
    const mockDs = { entities: [{ id: "1" }], show: false };
    await capturedProps?.onLoad?.(mockDs);

    expect(mockZoomTo).toHaveBeenCalledWith(mockDs.entities);
    expect(mockDs.show).toBe(true);
  });

  test("does not re-create Resource on re-render when resource already exists", async () => {
    const { rerender } = render(<CzmlComponent isAssetPublic={false} url={url} />);
    await waitFor(() => expect(Resource).toHaveBeenCalledTimes(1));

    rerender(<CzmlComponent isAssetPublic={false} url={url} />);
    expect(Resource).toHaveBeenCalledTimes(1);
  });
});
