import {
  createDefaultImageryProviderViewModels,
  createDefaultTerrainProviderViewModels,
  ProviderViewModel,
  ArcGisMapServerImageryProvider,
  OpenStreetMapImageryProvider,
  ArcGISTiledElevationTerrainProvider,
  UrlTemplateImageryProvider,
  CesiumTerrainProvider,
  IonResource,
} from "cesium";

import {
  TileResource,
  TerrainResource,
  UrlResourceProps,
  CesiumResourceProps,
} from "@reearth-cms/components/molecules/Workspace/types";

import ArcgisThumbnail from "./arcgisThumbnail.png";

const accessToken = window.REEARTH_CONFIG?.cesiumIonAccessToken;

const defaultImagery = createDefaultImageryProviderViewModels();

export const defaultTile = new ProviderViewModel({
  name: "Default",
  iconUrl: defaultImagery[0].iconUrl,
  tooltip: "",
  creationFunction: defaultImagery[0].creationCommand,
});

const labelled = new ProviderViewModel({
  name: "Labelled",
  iconUrl: defaultImagery[1].iconUrl,
  tooltip: "",
  creationFunction: defaultImagery[1].creationCommand,
});

const roadMap = new ProviderViewModel({
  name: "RoadMap",
  iconUrl: defaultImagery[2].iconUrl,
  tooltip: "",
  creationFunction: defaultImagery[2].creationCommand,
});

const openStreetMap = new ProviderViewModel({
  name: "OpenStreetMap",
  iconUrl: defaultImagery[6].iconUrl,
  tooltip: "",
  creationFunction: defaultImagery[6].creationCommand,
});

const esriTopography = new ProviderViewModel({
  name: "ESRI Topography",
  iconUrl:
    "https://services.arcgisonline.com/arcgis/rest/services/World_Topo_Map/MapServer/tile/0/0/0",
  tooltip: "",
  creationFunction: () => {
    return new ArcGisMapServerImageryProvider({
      url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer",
      credit:
        "Copyright: Tiles © Esri — Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Communit",
      enablePickFeatures: false,
    });
  },
});

const earthAtNight = new ProviderViewModel({
  name: "Earth at night",
  iconUrl: defaultImagery[11].iconUrl,
  tooltip: "",
  creationFunction: defaultImagery[11].creationCommand,
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
    iconUrl: image,
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

const defaultTerrain = createDefaultTerrainProviderViewModels();

const ellipsoid = new ProviderViewModel({
  name: defaultTerrain[0].name,
  iconUrl: defaultTerrain[0].iconUrl,
  tooltip: "",
  creationFunction: defaultTerrain[0].creationCommand,
});

const cesiumWorld = new ProviderViewModel({
  name: defaultTerrain[1].name,
  iconUrl: defaultTerrain[1].iconUrl,
  tooltip: "",
  creationFunction: defaultTerrain[1].creationCommand,
});

const arcGis = new ProviderViewModel({
  name: "ArcGIS Terrain",
  iconUrl: ArcgisThumbnail,
  tooltip: "",
  creationFunction: () => {
    return new ArcGISTiledElevationTerrainProvider({
      url: "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer",
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
    iconUrl: image,
    tooltip: "",
    creationFunction: () => {
      return new CesiumTerrainProvider({
        url:
          url ||
          IonResource.fromAssetId(parseInt(cesiumIonAssetId, 10), {
            accessToken: cesiumIonAccessToken || accessToken,
          }),
      });
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
