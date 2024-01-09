import {
  ArcGisMapServerImageryProvider,
  ArcGISTiledElevationTerrainProvider,
  EllipsoidTerrainProvider,
  IonImageryProvider,
  IonWorldImageryStyle,
  OpenStreetMapImageryProvider,
  IonResource,
  CesiumTerrainProvider,
} from "cesium";
import { useCallback } from "react";
import { ImageryLayer, Globe } from "resium";

import { WorkspaceSettings } from "@reearth-cms/components/molecules/Workspace/types";

type Props = {
  workspaceSettings?: WorkspaceSettings;
};

const accessToken = window.REEARTH_CONFIG?.cesiumIonAccessToken;

const Settings: React.FC<Props> = ({ workspaceSettings }) => {
  console.log(workspaceSettings);

  const imageryProviderGet = useCallback(() => {
    if (workspaceSettings) {
      switch (workspaceSettings.tiles?.resources[0].type) {
        case "LABELLED":
          return new IonImageryProvider({
            assetId: IonWorldImageryStyle.AERIAL_WITH_LABELS,
            accessToken,
          });
        case "ROAD_MAP":
          return new IonImageryProvider({
            assetId: IonWorldImageryStyle.ROAD,
            accessToken,
          });
        case "STAMEN_WATERCOLOR":
          return new OpenStreetMapImageryProvider({
            url: "https://stamen-tiles.a.ssl.fastly.net/watercolor/",
            credit:
              "Map tiles by Stamen Design, under CC BY 3.0. Data by OpenStreetMap, under CC BY SA.",
            fileExtension: "jpg",
          });
        case "STAMEN_TONER":
          return new OpenStreetMapImageryProvider({
            url: "https://stamen-tiles.a.ssl.fastly.net/toner/",
            credit:
              "Map tiles by Stamen Design, under CC BY 3.0. Data by OpenStreetMap, under CC BY SA.",
          });
        case "OPEN_STREET_MAP":
          return new OpenStreetMapImageryProvider({
            url: "https://a.tile.openstreetmap.org/",
            credit:
              "Copyright: Tiles © Esri — Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012",
          });
        case "ESRI_TOPOGRAPHY":
          return new ArcGisMapServerImageryProvider({
            url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer",
            credit:
              "Copyright: Tiles © Esri — Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Communit",
            enablePickFeatures: false,
          });
        case "EARTH_AT_NIGHT":
          return new IonImageryProvider({ assetId: 3812, accessToken });
        case "JAPAN_GSI_STANDARD_MAP":
          return new OpenStreetMapImageryProvider({
            url: "https://cyberjapandata.gsi.go.jp/xyz/std/",
          });
      }
    }
    return new IonImageryProvider({
      assetId: IonWorldImageryStyle.AERIAL,
      accessToken,
    });
  }, [workspaceSettings]);

  const terrainProviderGet = useCallback(() => {
    if (workspaceSettings) {
      switch (workspaceSettings.terrains?.resources[0].type) {
        case "CESIUM_WORLD_TERRAIN":
          return new CesiumTerrainProvider({
            url: IonResource.fromAssetId(1, {
              accessToken,
            }),
            requestWaterMask: false,
          });
        case "ARC_GIS_TERRAIN":
          return new ArcGISTiledElevationTerrainProvider({
            url: "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer",
          });
        case "CESIUM_ION":
          if (workspaceSettings.terrains?.resources[0].props) {
            const { url, cesiumIonAssetId, cesiumIonAccessToken } =
              workspaceSettings.terrains.resources[0].props;
            return new CesiumTerrainProvider({
              url:
                url ||
                IonResource.fromAssetId(parseInt(cesiumIonAssetId, 10), {
                  accessToken: cesiumIonAccessToken || accessToken,
                }),
            });
          }
      }
    }
    return new EllipsoidTerrainProvider();
  }, [workspaceSettings]);

  return (
    <>
      <ImageryLayer imageryProvider={imageryProviderGet()} />
      <Globe terrainProvider={terrainProviderGet()} />
    </>
  );
};

export default Settings;
