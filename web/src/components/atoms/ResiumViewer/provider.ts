import {
  ProviderViewModel,
  OpenStreetMapImageryProvider,
  UrlTemplateImageryProvider,
  CesiumTerrainProvider,
  Credit,
  IonResource,
  EllipsoidTerrainProvider,
  buildModuleUrl,
} from "cesium";

import type {
  TileResource,
  TerrainResource,
  UrlResourceProps,
  CesiumResourceProps,
} from "@reearth-cms/components/molecules/Workspace/types";
import { t } from "@reearth-cms/i18n";

import NoImage from "./noImage.jpg";

const GOOGLE_MAP_CREDIT = new Credit("© Google", false);
const REEARTH_TERRAIN_CREDIT = new Credit(
  "Re:Earth Terrain, Mapterhorn, EGM2008 (NGA), Protomaps, OpenStreetMap",
  false,
);
const BLACK_MARBLE_CREDIT = new Credit("NASA Earth Observatory / Black Marble", false);

const getReearthLandConfig = () => {
  const tilesUrl = window.REEARTH_CONFIG?.tilesUrl ?? "https://tiles.reearth.land";
  const terrainUrl = window.REEARTH_CONFIG?.terrainUrl ?? "https://terrain.reearth.land";
  const tilesToken = window.REEARTH_CONFIG?.tilesToken ?? "";
  const tokenQuery = tilesToken ? `?${new URLSearchParams({ token: tilesToken }).toString()}` : "";
  return { tilesUrl, terrainUrl, tokenQuery };
};

const googleSatellite = new ProviderViewModel({
  name: "Google Satellite",
  iconUrl: buildModuleUrl("Widgets/Images/ImageryProviders/bingAerial.png"),
  tooltip: "",
  creationFunction: () => {
    const { tilesUrl, tokenQuery } = getReearthLandConfig();
    return new UrlTemplateImageryProvider({
      url: `${tilesUrl}/imagery/google-satellite/{z}/{x}/{y}.png${tokenQuery}`,
      maximumLevel: 22,
      credit: GOOGLE_MAP_CREDIT,
    });
  },
});

const googleRoadMap = new ProviderViewModel({
  name: "Google Road Map",
  iconUrl: buildModuleUrl("Widgets/Images/ImageryProviders/bingRoads.png"),
  tooltip: "",
  creationFunction: () => {
    const { tilesUrl, tokenQuery } = getReearthLandConfig();
    return new UrlTemplateImageryProvider({
      url: `${tilesUrl}/imagery/google-roadmap/{z}/{x}/{y}.png${tokenQuery}`,
      maximumLevel: 22,
      credit: GOOGLE_MAP_CREDIT,
    });
  },
});

const openStreetMap = new ProviderViewModel({
  name: "OpenStreetMap",
  iconUrl: buildModuleUrl("Widgets/Images/ImageryProviders/openStreetMap.png"),
  tooltip: "",
  creationFunction: () => {
    return new OpenStreetMapImageryProvider({
      url: "https://a.tile.openstreetmap.org/",
    });
  },
});

const nasaBlackMarble = new ProviderViewModel({
  name: "NASA Black Marble",
  iconUrl: buildModuleUrl("Widgets/Images/ImageryProviders/earthAtNight.png"),
  tooltip: "",
  creationFunction: () => {
    const { tilesUrl, tokenQuery } = getReearthLandConfig();
    return new UrlTemplateImageryProvider({
      url: `${tilesUrl}/imagery/blackmarble/{z}/{x}/{y}.png${tokenQuery}`,
      maximumLevel: 8,
      credit: BLACK_MARBLE_CREDIT,
    });
  },
});

const japanGsi = new ProviderViewModel({
  name: t("Japan GSI Standard Map"),
  iconUrl: "https://maps.gsi.go.jp/xyz/std/0/0/0.png",
  tooltip: "",
  creationFunction: () => {
    return new OpenStreetMapImageryProvider({
      url: "https://cyberjapandata.gsi.go.jp/xyz/std/",
    });
  },
});

const urlGet = ({ name, url, image }: UrlResourceProps) => {
  return new ProviderViewModel({
    name,
    iconUrl: image || NoImage,
    tooltip: "",
    creationFunction: () => {
      return new UrlTemplateImageryProvider({
        url,
      });
    },
  });
};

export const imageryGet = (tiles: TileResource[]) => {
  const result: ProviderViewModel[] = [];
  tiles.forEach(tile => {
    switch (tile.type) {
      case "ROAD_MAP":
        result.push(googleRoadMap);
        break;
      case "OPEN_STREET_MAP":
        result.push(openStreetMap);
        break;
      case "EARTH_AT_NIGHT":
        result.push(nasaBlackMarble);
        break;
      case "JAPAN_GSI_STANDARD_MAP":
        result.push(japanGsi);
        break;
      case "URL": {
        const url = tile.props.url;
        if (url) result.push(urlGet(tile.props));
        break;
      }
      case "DEFAULT":
        result.push(googleSatellite);
        break;
    }
  });
  if (result.length === 0) result.push(googleSatellite);
  return result;
};

const ellipsoid = new ProviderViewModel({
  name: "WGS84 Ellipsoid",
  iconUrl: buildModuleUrl("Widgets/Images/TerrainProviders/Ellipsoid.png"),
  tooltip: "",
  creationFunction: () => {
    return new EllipsoidTerrainProvider();
  },
});

const reearthTerrain = new ProviderViewModel({
  name: "Re:Earth Terrain",
  iconUrl: buildModuleUrl("Widgets/Images/TerrainProviders/CesiumWorldTerrain.png"),
  tooltip: "",
  creationFunction: () => {
    const { terrainUrl, tokenQuery } = getReearthLandConfig();
    return CesiumTerrainProvider.fromUrl(`${terrainUrl}/cesium-mesh/ellipsoid${tokenQuery}`, {
      requestVertexNormals: true,
      requestWaterMask: true,
      credit: REEARTH_TERRAIN_CREDIT,
    });
  },
});

const cesiumIonGet = ({
  name,
  url,
  image,
  cesiumIonAssetId,
  cesiumIonAccessToken,
}: CesiumResourceProps) => {
  return new ProviderViewModel({
    name,
    iconUrl: image || NoImage,
    tooltip: "",
    creationFunction: () => {
      return CesiumTerrainProvider.fromUrl(
        url ||
          IonResource.fromAssetId(parseInt(cesiumIonAssetId, 10), {
            accessToken: cesiumIonAccessToken,
          }),
      );
    },
  });
};

export const terrainGet = (terrains: TerrainResource[]) => {
  const result: ProviderViewModel[] = [];
  result.push(ellipsoid);
  terrains.forEach(terrain => {
    switch (terrain.type) {
      case "REEARTH_TERRAIN":
        result.push(reearthTerrain);
        break;
      case "CESIUM_ION": {
        result.push(cesiumIonGet(terrain.props));
        break;
      }
    }
  });
  return result;
};
