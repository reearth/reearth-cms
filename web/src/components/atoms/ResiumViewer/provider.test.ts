import { Credit, CesiumTerrainProvider } from "cesium";
import { test, expect, describe, vi, afterEach } from "vitest";

import {
  imageryGet,
  isLabelsOverlayProvider,
  LABELS_OVERLAY_ALPHA,
  LABELS_OVERLAY_FLAG,
  terrainGet,
} from "./provider";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("isLabelsOverlayProvider", () => {
  test("returns true when the flag is set to true", () => {
    expect(isLabelsOverlayProvider({ [LABELS_OVERLAY_FLAG]: true })).toBe(true);
  });

  test("returns true for any truthy flag value (uses !! coercion)", () => {
    expect(isLabelsOverlayProvider({ [LABELS_OVERLAY_FLAG]: 1 })).toBe(true);
    expect(isLabelsOverlayProvider({ [LABELS_OVERLAY_FLAG]: "yes" })).toBe(true);
    expect(isLabelsOverlayProvider({ [LABELS_OVERLAY_FLAG]: {} })).toBe(true);
  });

  test("returns false when the flag is missing", () => {
    expect(isLabelsOverlayProvider({})).toBe(false);
    expect(isLabelsOverlayProvider({ someOtherKey: true })).toBe(false);
  });

  test("returns false when the flag is falsy", () => {
    expect(isLabelsOverlayProvider({ [LABELS_OVERLAY_FLAG]: false })).toBe(false);
    expect(isLabelsOverlayProvider({ [LABELS_OVERLAY_FLAG]: 0 })).toBe(false);
    expect(isLabelsOverlayProvider({ [LABELS_OVERLAY_FLAG]: "" })).toBe(false);
    expect(isLabelsOverlayProvider({ [LABELS_OVERLAY_FLAG]: null })).toBe(false);
    expect(isLabelsOverlayProvider({ [LABELS_OVERLAY_FLAG]: undefined })).toBe(false);
  });

  test("returns false for null and undefined", () => {
    expect(isLabelsOverlayProvider(null)).toBe(false);
    expect(isLabelsOverlayProvider(undefined)).toBe(false);
  });

  test("returns false for primitive inputs", () => {
    expect(isLabelsOverlayProvider("string")).toBe(false);
    expect(isLabelsOverlayProvider(42)).toBe(false);
    expect(isLabelsOverlayProvider(true)).toBe(false);
  });
});

describe("LABELS_OVERLAY_ALPHA", () => {
  test("is 0.7", () => {
    expect(LABELS_OVERLAY_ALPHA).toBe(0.7);
  });
});

describe("terrainGet", () => {
  test("uses Terravista credit for Cesium World Terrain", async () => {
    const fromUrl = vi
      .spyOn(CesiumTerrainProvider, "fromUrl")
      .mockResolvedValue({} as CesiumTerrainProvider);
    const terrainProvider = terrainGet([
      {
        id: "terrain-1",
        type: "CESIUM_WORLD_TERRAIN",
        props: {
          name: "",
          url: "",
          image: "",
          cesiumIonAssetId: "",
          cesiumIonAccessToken: "",
        },
      },
    ]).find(provider => provider.name === "Cesium World Terrain");

    await (terrainProvider?.creationCommand as unknown as () => Promise<CesiumTerrainProvider>)();

    const [, options] = fromUrl.mock.calls[0];

    expect(options?.credit).toBeInstanceOf(Credit);
    expect((options?.credit as Credit).html).toBe("Terravista");
  });
});

describe("imageryGet", () => {
  test("uses Black Marble credit for Earth at night", () => {
    const [provider] = imageryGet([
      {
        id: "earth-at-night",
        type: "EARTH_AT_NIGHT",
        props: { name: "", url: "", image: "" },
      },
    ]);

    const imageryProvider = provider.creationCommand as { credit?: { html?: string } };

    expect(imageryProvider.credit?.html).toContain("Black Marble");
    expect(imageryProvider.credit?.html).not.toContain("Google");
  });
});
