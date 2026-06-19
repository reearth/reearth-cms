import { useMemo } from "react";

import { TerrainType, TileType } from "@reearth-cms/components/molecules/Workspace/types.ts";
import { useT } from "@reearth-cms/i18n";

export const TerrainTypeFormat: Record<TerrainType, string> = {
  REEARTH_TERRAIN: "Re:Earth Terrain",
  CESIUM_ION: "Cesium Ion",
};

export default function useSettings() {
  const t = useT();

  const TileTypeFormat = useMemo<Record<TileType, string>>(
    () => ({
      DEFAULT: "Google Satellite",
      ROAD_MAP: "Google Road Map",
      OPEN_STREET_MAP: "OpenStreetMap",
      EARTH_AT_NIGHT: "NASA Black Marble",
      JAPAN_GSI_STANDARD_MAP: t("Japan GSI Standard Map"),
      URL: "URL",
    }),
    [t],
  );

  return {
    TileTypeFormat,
    TerrainTypeFormat,
  };
}
