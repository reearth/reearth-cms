import {
  ArcGisMapServerImageryProvider,
  ArcGISTiledElevationTerrainProvider,
  buildModuleUrl,
  CesiumTerrainProvider,
  createWorldImageryAsync,
  createWorldTerrainAsync,
  EllipsoidTerrainProvider,
  IonImageryProvider,
  IonResource,
  IonWorldImageryStyle,
  OpenStreetMapImageryProvider,
  ProviderViewModel,
  UrlTemplateImageryProvider,
} from "cesium";

import {
  CesiumResourceProps,
  TerrainResource,
  TileResource,
  UrlResourceProps,
} from "@reearth-cms/components/molecules/Workspace/types";

import ArcgisThumbnail from "./arcgisThumbnail.png";
import NoImage from "./noImage.jpg";

const accessToken = window.REEARTH_CONFIG?.cesiumIonAccessToken;

const defaultTile = new ProviderViewModel({
  creationFunction: () => {
    return createWorldImageryAsync({
      style: IonWorldImageryStyle.AERIAL,
    });
  },
  iconUrl: buildModuleUrl("Widgets/Images/ImageryProviders/bingAerial.png"),
  name: "Default",
  tooltip: "",
});

const labelled = new ProviderViewModel({
  creationFunction: () => {
    return createWorldImageryAsync({
      style: IonWorldImageryStyle.AERIAL_WITH_LABELS,
    });
  },
  iconUrl: buildModuleUrl("Widgets/Images/ImageryProviders/bingAerialLabels.png"),
  name: "Labelled",
  tooltip: "",
});

const roadMap = new ProviderViewModel({
  creationFunction: () => {
    return createWorldImageryAsync({
      style: IonWorldImageryStyle.ROAD,
    });
  },
  iconUrl: buildModuleUrl("Widgets/Images/ImageryProviders/bingRoads.png"),
  name: "RoadMap",
  tooltip: "",
});

const openStreetMap = new ProviderViewModel({
  creationFunction: () => {
    return new OpenStreetMapImageryProvider({
      url: "https://a.tile.openstreetmap.org/",
    });
  },
  iconUrl: buildModuleUrl("Widgets/Images/ImageryProviders/openStreetMap.png"),
  name: "OpenStreetMap",
  tooltip: "",
});

const esriTopography = new ProviderViewModel({
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
  iconUrl:
    "https://services.arcgisonline.com/arcgis/rest/services/World_Topo_Map/MapServer/tile/0/0/0",
  name: "ESRI Topography",
  tooltip: "",
});

const earthAtNight = new ProviderViewModel({
  creationFunction: () => {
    return IonImageryProvider.fromAssetId(3812, { accessToken });
  },
  iconUrl: buildModuleUrl("Widgets/Images/ImageryProviders/earthAtNight.png"),
  name: "Earth at night",
  tooltip: "",
});

const japanGsi = new ProviderViewModel({
  creationFunction: () => {
    return new OpenStreetMapImageryProvider({
      url: "https://cyberjapandata.gsi.go.jp/xyz/std/",
    });
  },
  iconUrl: "https://maps.gsi.go.jp/xyz/std/0/0/0.png",
  name: "Japan GSI Standard Map",
  tooltip: "",
});

const urlGet = ({ image, name, url }: UrlResourceProps) => {
  return new ProviderViewModel({
    creationFunction: () => {
      return new UrlTemplateImageryProvider({
        url,
      });
    },
    iconUrl: image || NoImage,
    name,
    tooltip: "",
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
  creationFunction: () => {
    return new EllipsoidTerrainProvider();
  },
  iconUrl: buildModuleUrl("Widgets/Images/TerrainProviders/Ellipsoid.png"),
  name: "WGS84 Ellipsoid",
  tooltip: "",
});

const cesiumWorld = new ProviderViewModel({
  creationFunction: () => {
    return createWorldTerrainAsync({
      requestVertexNormals: true,
      requestWaterMask: true,
    });
  },
  iconUrl: buildModuleUrl("Widgets/Images/TerrainProviders/CesiumWorldTerrain.png"),
  name: "Cesium World Terrain",
  tooltip: "",
});

const arcGis = new ProviderViewModel({
  creationFunction: () => {
    return ArcGISTiledElevationTerrainProvider.fromUrl(
      "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer",
    );
  },
  iconUrl: ArcgisThumbnail,
  name: "ArcGIS Terrain",
  tooltip: "",
});

const cesiumIonGet = ({
  cesiumIonAccessToken,
  cesiumIonAssetId,
  image,
  name,
  url,
}: CesiumResourceProps) => {
  return new ProviderViewModel({
    creationFunction: () => {
      return CesiumTerrainProvider.fromUrl(
        url ||
          IonResource.fromAssetId(parseInt(cesiumIonAssetId, 10), {
            accessToken: cesiumIonAccessToken || accessToken,
          }),
      );
    },
    iconUrl: image || NoImage,
    name,
    tooltip: "",
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
