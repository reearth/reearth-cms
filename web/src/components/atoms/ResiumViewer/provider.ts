import {
  ProviderViewModel,
  ArcGisMapServerImageryProvider,
  OpenStreetMapImageryProvider,
  ArcGISTiledElevationTerrainProvider,
  UrlTemplateImageryProvider,
  CesiumTerrainProvider,
  Credit,
  IonResource,
  EllipsoidTerrainProvider,
  buildModuleUrl,
} from "cesium";

import {
  TileResource,
  TerrainResource,
  UrlResourceProps,
  CesiumResourceProps,
} from "@reearth-cms/components/molecules/Workspace/types";

import ArcgisThumbnail from "./arcgisThumbnail.png";
import NoImage from "./noImage.jpg";

const GOOGLE_MAP_CREDIT = new Credit("© Google", true);

const getTilesConfig = () => {
  const tilesUrl = window.REEARTH_CONFIG?.tilesUrl ?? "https://tiles.reearth.land";
  const tilesToken = window.REEARTH_CONFIG?.tilesToken ?? "";
  const tokenQuery = tilesToken ? `?${new URLSearchParams({ token: tilesToken }).toString()}` : "";
  return { tilesUrl, tokenQuery };
};

export const LABELS_OVERLAY_FLAG = "__terravistaLabelsOverlay" as const;
export const LABELS_OVERLAY_ALPHA = 0.7;
export const isLabelsOverlayProvider = (provider: unknown): boolean => {
  return !!(provider as Record<string, unknown> | null | undefined)?.[LABELS_OVERLAY_FLAG];
};

const defaultTile = new ProviderViewModel({
  name: "Default",
  iconUrl: buildModuleUrl("Widgets/Images/ImageryProviders/bingAerial.png"),
  tooltip: "",
  creationFunction: () => {
    const { tilesUrl, tokenQuery } = getTilesConfig();
    return new UrlTemplateImageryProvider({
      url: `${tilesUrl}/imagery/google-satellite/{z}/{x}/{y}.png${tokenQuery}`,
      maximumLevel: 22,
      credit: GOOGLE_MAP_CREDIT,
    });
  },
});

const labelled = new ProviderViewModel({
  name: "Labelled",
  iconUrl: buildModuleUrl("Widgets/Images/ImageryProviders/bingAerialLabels.png"),
  tooltip: "",
  creationFunction: () => {
    const { tilesUrl, tokenQuery } = getTilesConfig();

    const satellite = new UrlTemplateImageryProvider({
      url: `${tilesUrl}/imagery/google-satellite/{z}/{x}/{y}.png${tokenQuery}`,
      maximumLevel: 22,
      credit: GOOGLE_MAP_CREDIT,
    });

    const labels = new UrlTemplateImageryProvider({
      url: `${tilesUrl}/imagery/google-roadmap/{z}/{x}/{y}.png${tokenQuery}`,
      maximumLevel: 22,
      credit: GOOGLE_MAP_CREDIT,
    });

    (labels as unknown as Record<string, boolean>)[LABELS_OVERLAY_FLAG] = true;
    return [satellite, labels];
  },
});

const roadMap = new ProviderViewModel({
  name: "RoadMap",
  iconUrl: buildModuleUrl("Widgets/Images/ImageryProviders/bingRoads.png"),
  tooltip: "",
  creationFunction: () => {
    const { tilesUrl, tokenQuery } = getTilesConfig();
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

const esriTopography = new ProviderViewModel({
  name: "ESRI Topography",
  iconUrl:
    "https://services.arcgisonline.com/arcgis/rest/services/World_Topo_Map/MapServer/tile/0/0/0",
  tooltip: "",
  creationFunction: () => {
    return ArcGisMapServerImageryProvider.fromUrl(
      "https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer",
      {
        credit:
          "Copyright: Tiles © Esri — Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Communit",
        enablePickFeatures: false,
      },
    );
  },
});

const earthAtNight = new ProviderViewModel({
  name: "Earth at night",
  iconUrl: buildModuleUrl("Widgets/Images/ImageryProviders/earthAtNight.png"),
  tooltip: "",
  creationFunction: () => {
    const { tilesUrl, tokenQuery } = getTilesConfig();
    return new UrlTemplateImageryProvider({
      url: `${tilesUrl}/imagery/blackmarble/{z}/{x}/{y}.png${tokenQuery}`,
      maximumLevel: 8,
      credit: GOOGLE_MAP_CREDIT,
    });
  },
});

const japanGsi = new ProviderViewModel({
  name: "Japan GSI Standard Map",
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
      case "LABELLED":
        result.push(labelled);
        break;
      case "ROAD_MAP":
        result.push(roadMap);
        break;
      case "OPEN_STREET_MAP":
        result.push(openStreetMap);
        break;
      case "ESRI_TOPOGRAPHY":
        result.push(esriTopography);
        break;
      case "EARTH_AT_NIGHT":
        result.push(earthAtNight);
        break;
      case "JAPAN_GSI_STANDARD_MAP":
        result.push(japanGsi);
        break;
      case "URL": {
        const url = tile.props.url;
        if (url) result.push(urlGet(tile.props));
        break;
      }
      default:
        result.push(defaultTile);
        break;
    }
  });
  if (result.length === 0) result.push(defaultTile);
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

const cesiumWorld = new ProviderViewModel({
  name: "Cesium World Terrain",
  iconUrl: buildModuleUrl("Widgets/Images/TerrainProviders/CesiumWorldTerrain.png"),
  tooltip: "",
  creationFunction: () => {
    const { tilesUrl, tokenQuery } = getTilesConfig();
    return CesiumTerrainProvider.fromUrl(`${tilesUrl}/cesium-mesh/ellipsoid${tokenQuery}`, {
      requestVertexNormals: true,
      requestWaterMask: true,
      credit: GOOGLE_MAP_CREDIT,
    });
  },
});

const arcGis = new ProviderViewModel({
  name: "ArcGIS Terrain",
  iconUrl: ArcgisThumbnail,
  tooltip: "",
  creationFunction: () => {
    return ArcGISTiledElevationTerrainProvider.fromUrl(
      "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer",
    );
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
      case "ARC_GIS_TERRAIN":
        result.push(arcGis);
        break;
      case "CESIUM_ION": {
        result.push(cesiumIonGet(terrain.props));
        break;
      }
      default:
        result.push(cesiumWorld);
        break;
    }
  });
  return result;
};
