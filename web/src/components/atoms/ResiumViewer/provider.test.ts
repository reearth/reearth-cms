import { Credit, CesiumTerrainProvider } from "cesium";
import { test, expect, describe, vi, afterEach } from "vitest";

import { imageryGet, terrainGet } from "./provider";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("terrainGet", () => {
  test("uses Re:Earth terrain credit for Cesium World Terrain", async () => {
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
    expect((options?.credit as Credit).html).toBe(
      "Re:Earth Terrain, Mapterhorn, EGM2008 (NGA), Protomaps, OpenStreetMap",
    );
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

    const imageryProvider = (
      provider.creationCommand as unknown as () => { credit?: { html?: string } }
    )();

    expect(imageryProvider.credit?.html).toContain("Black Marble");
    expect(imageryProvider.credit?.html).not.toContain("Google");
  });
});
