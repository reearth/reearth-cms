import { render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// ── Capture variable ──
let capturedAutoCompleteProps: Record<string, unknown> | undefined;

// ── Mock functions (names start with "mock" for vi.mock hoisting) ──
const mockFlyToBoundingSphere = vi.fn();
const mockAddImageryProvider = vi.fn().mockReturnValue({ alpha: 0 });
const mockRemove = vi.fn();
const mockGetHeader = vi.fn().mockResolvedValue({ Authorization: "Bearer token" });
const mockUseCesium = vi.fn();

const mockViewer = {
  camera: { flyToBoundingSphere: mockFlyToBoundingSphere },
  scene: {
    imageryLayers: {
      addImageryProvider: mockAddImageryProvider,
      remove: mockRemove,
    },
  },
};

// ── Module mocks (hoisted before imports) ──
vi.mock("cesium", () => ({
  HeadingPitchRange: vi.fn(function (
    this: Record<string, unknown>,
    ...args: unknown[]
  ) {
    this.heading = args[0];
    this.pitch = args[1];
    this.range = args[2];
  }),
  Math: { toRadians: vi.fn((x: number) => x) },
  Cartesian3: { fromDegrees: vi.fn((...args: number[]) => args) },
  BoundingSphere: vi.fn(function (this: Record<string, unknown>, center: unknown) {
    this.center = center;
  }),
}));

vi.mock("resium", () => ({
  useCesium: (...args: unknown[]) => mockUseCesium(...args),
}));

vi.mock("cesium-mvt-imagery-provider", () => ({
  CesiumMVTImageryProvider: vi.fn(),
}));

vi.mock("@mapbox/vector-tile", () => ({
  VectorTileFeature: {
    types: ["Unknown", "Point", "LineString", "Polygon"],
  },
}));

vi.mock("@reearth-cms/gql", () => ({
  useAuthHeader: () => ({ getHeader: mockGetHeader }),
}));

vi.mock("@reearth-cms/components/atoms/AutoComplete", () => ({
  default: (props: Record<string, unknown>) => {
    capturedAutoCompleteProps = props;
    return <input data-testid="autocomplete" value={(props.value as string) ?? ""} readOnly />;
  },
}));

// ── Imports after mocks ──
import { CesiumMVTImageryProvider } from "cesium-mvt-imagery-provider";

import { Imagery } from "./Imagery";

// ── Test data ──
const testUrl = "https://example.com/tiles/12/345/678.mvt";

const tilejsonData = {
  vector_layers: [{ id: "buildings" }, { id: "roads" }],
  center: [139.7, 35.68, 14],
  maxzoom: 16,
};

const metadataData = {
  json: '{"vector_layers":[{"id":"layer1"}]}',
  center: "139.7,35.68,0",
  maxzoom: 14,
};

describe("Imagery", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    capturedAutoCompleteProps = undefined;
    vi.clearAllMocks();
    mockUseCesium.mockReturnValue({ viewer: mockViewer });
    mockGetHeader.mockResolvedValue({ Authorization: "Bearer token" });
    mockAddImageryProvider.mockReturnValue({ alpha: 0 });
  });

  test("renders AutoComplete with empty initial state", () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: false } as Response);
    render(<Imagery url={testUrl} handleProperties={vi.fn()} />);

    expect(capturedAutoCompleteProps).toBeDefined();
    expect(capturedAutoCompleteProps?.value).toBe("");
    expect(capturedAutoCompleteProps?.options).toEqual([]);
  });

  // ── fetchLayers ──

  test("fetches tilejson.json and sets layers and currentLayer", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(tilejsonData),
    } as Response);

    render(<Imagery url={testUrl} handleProperties={vi.fn()} />);

    await waitFor(() => {
      expect(capturedAutoCompleteProps?.value).toBe("buildings");
    });
    expect(capturedAutoCompleteProps?.options).toEqual([
      { label: "buildings", value: "buildings" },
      { label: "roads", value: "roads" },
    ]);
  });

  test("zooms with normalOffset when tilejson center exists", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(tilejsonData),
    } as Response);

    render(<Imagery url={testUrl} handleProperties={vi.fn()} />);

    await waitFor(() => {
      expect(mockFlyToBoundingSphere).toHaveBeenCalled();
    });
    // normalOffset = HeadingPitchRange(0, toRadians(-90), 200000)
    expect(mockFlyToBoundingSphere.mock.calls[0][1].offset).toEqual(
      expect.objectContaining({ heading: 0, pitch: -90, range: 200000 }),
    );
  });

  test("zooms with defaultOffset when center is missing", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ vector_layers: [{ id: "layer1" }] }),
    } as Response);

    render(<Imagery url={testUrl} handleProperties={vi.fn()} />);

    await waitFor(() => {
      expect(mockFlyToBoundingSphere).toHaveBeenCalled();
    });
    // defaultOffset = HeadingPitchRange(0, toRadians(-90), 3000000)
    expect(mockFlyToBoundingSphere.mock.calls[0][1].offset).toEqual(
      expect.objectContaining({ heading: 0, pitch: -90, range: 3000000 }),
    );
  });

  test("falls back to metadata.json when tilejson returns non-ok", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({ ok: false } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(metadataData),
      } as Response);

    render(<Imagery url={testUrl} handleProperties={vi.fn()} />);

    await waitFor(() => {
      expect(capturedAutoCompleteProps?.value).toBe("layer1");
    });
  });

  test("renders without crash when both fetches fail", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({ ok: false } as Response)
      .mockResolvedValueOnce({ ok: false } as Response);

    render(<Imagery url={testUrl} handleProperties={vi.fn()} />);

    expect(capturedAutoCompleteProps).toBeDefined();
    expect(capturedAutoCompleteProps?.value).toBe("");
  });

  // ── CesiumMVTImageryProvider ──

  test("creates CesiumMVTImageryProvider with correct parameters", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(tilejsonData),
    } as Response);

    render(<Imagery url={testUrl} handleProperties={vi.fn()} />);

    await waitFor(() => {
      const lastArgs = vi.mocked(CesiumMVTImageryProvider).mock.calls.at(-1)?.[0] as
        | Record<string, unknown>
        | undefined;
      expect(lastArgs?.layerName).toBe("buildings");
    });

    const lastArgs = vi.mocked(CesiumMVTImageryProvider).mock.calls.at(-1)?.[0] as Record<
      string,
      unknown
    >;
    expect(lastArgs.urlTemplate).toBe("https://example.com/tiles/{z}/{x}/{y}.mvt");
    expect(lastArgs.maximumLevel).toBe(16);
    expect(typeof lastArgs.style).toBe("function");
    expect(typeof lastArgs.onSelectFeature).toBe("function");
  });

  test("passes empty headers for public assets", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(tilejsonData),
    } as Response);

    render(<Imagery isAssetPublic url={testUrl} handleProperties={vi.fn()} />);

    await waitFor(() => {
      const lastArgs = vi.mocked(CesiumMVTImageryProvider).mock.calls.at(-1)?.[0] as
        | Record<string, unknown>
        | undefined;
      expect(lastArgs?.headers).toEqual({});
    });
  });

  test("passes auth headers for private assets", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(tilejsonData),
    } as Response);

    render(<Imagery isAssetPublic={false} url={testUrl} handleProperties={vi.fn()} />);

    await waitFor(() => {
      const lastArgs = vi.mocked(CesiumMVTImageryProvider).mock.calls.at(-1)?.[0] as
        | Record<string, unknown>
        | undefined;
      expect(lastArgs?.headers).toEqual({ Authorization: "Bearer token" });
    });
  });

  test("sets imagery layer alpha to 0.5", async () => {
    const mockLayer = { alpha: 0 };
    mockAddImageryProvider.mockReturnValue(mockLayer);

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(tilejsonData),
    } as Response);

    render(<Imagery url={testUrl} handleProperties={vi.fn()} />);

    await waitFor(() => {
      expect(mockAddImageryProvider).toHaveBeenCalled();
    });
    expect(mockLayer.alpha).toBe(0.5);
  });

  test("removes imagery layer on unmount", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(tilejsonData),
    } as Response);

    const { unmount } = render(<Imagery url={testUrl} handleProperties={vi.fn()} />);

    await waitFor(() => {
      expect(mockAddImageryProvider).toHaveBeenCalled();
    });

    unmount();

    expect(mockRemove).toHaveBeenCalled();
  });

  // ── handleChange ──

  test("handleChange updates currentLayer for string values", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(tilejsonData),
    } as Response);

    render(<Imagery url={testUrl} handleProperties={vi.fn()} />);

    await waitFor(() => {
      expect(capturedAutoCompleteProps?.value).toBe("buildings");
    });

    const onChange = capturedAutoCompleteProps!.onChange as (value: unknown) => void;
    onChange("roads");

    await waitFor(() => {
      expect(capturedAutoCompleteProps?.value).toBe("roads");
    });
  });

  test("handleChange ignores non-string values", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(tilejsonData),
    } as Response);

    render(<Imagery url={testUrl} handleProperties={vi.fn()} />);

    await waitFor(() => {
      expect(capturedAutoCompleteProps?.value).toBe("buildings");
    });

    const onChange = capturedAutoCompleteProps!.onChange as (value: unknown) => void;
    onChange(123);

    expect(capturedAutoCompleteProps?.value).toBe("buildings");
  });

  // ── Callbacks ──

  test("onSelectFeature calls handleProperties with feature properties", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(tilejsonData),
    } as Response);

    const handleProperties = vi.fn();
    render(<Imagery url={testUrl} handleProperties={handleProperties} />);

    await waitFor(() => {
      expect(vi.mocked(CesiumMVTImageryProvider).mock.calls.length).toBeGreaterThanOrEqual(1);
    });

    const lastArgs = vi.mocked(CesiumMVTImageryProvider).mock.calls.at(-1)?.[0] as Record<
      string,
      unknown
    >;
    const onSelectFeature = lastArgs.onSelectFeature as (
      feature: {
        loadGeometry: () => { x: number; y: number }[][];
        properties: Record<string, unknown>;
      },
      tile: { x: number; y: number; level: number },
    ) => void;

    onSelectFeature(
      {
        loadGeometry: () => [[{ x: 10, y: 20 }]],
        properties: { name: "Building A", height: 50 },
      },
      { x: 1, y: 2, level: 3 },
    );

    expect(handleProperties).toHaveBeenCalledWith({ name: "Building A", height: 50 });
  });

  test("style returns red fill by default and lineWidth based on geometry type", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(tilejsonData),
    } as Response);

    render(<Imagery url={testUrl} handleProperties={vi.fn()} />);

    await waitFor(() => {
      expect(vi.mocked(CesiumMVTImageryProvider).mock.calls.length).toBeGreaterThanOrEqual(1);
    });

    const lastArgs = vi.mocked(CesiumMVTImageryProvider).mock.calls.at(-1)?.[0] as Record<
      string,
      unknown
    >;
    const styleFn = lastArgs.style as (
      feature: { type: number; loadGeometry: () => { x: number; y: number }[][] },
      tile: { x: number; y: number; level: number },
    ) => { strokeStyle: string; fillStyle: string; lineWidth: number };

    const tile = { x: 1, y: 2, level: 3 };

    // Polygon (type 3) → lineWidth 1
    const polygonResult = styleFn(
      { type: 3, loadGeometry: () => [[{ x: 10, y: 20 }]] },
      tile,
    );
    expect(polygonResult.fillStyle).toBe("red");
    expect(polygonResult.strokeStyle).toBe("white");
    expect(polygonResult.lineWidth).toBe(1);

    // Point (type 1) → lineWidth 5
    const pointResult = styleFn(
      { type: 1, loadGeometry: () => [[{ x: 30, y: 40 }]] },
      tile,
    );
    expect(pointResult.lineWidth).toBe(5);
  });

  test("skips imagery layer setup when viewer is undefined", async () => {
    mockUseCesium.mockReturnValue({ viewer: undefined });

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(tilejsonData),
    } as Response);

    render(<Imagery url={testUrl} handleProperties={vi.fn()} />);

    // fetchLayers still runs and updates state
    await waitFor(() => {
      expect(capturedAutoCompleteProps?.value).toBe("buildings");
    });

    // But imagery provider is not created
    expect(CesiumMVTImageryProvider).not.toHaveBeenCalled();
    expect(mockAddImageryProvider).not.toHaveBeenCalled();
  });
});
