import {
  Cesium3DTileFeature,
  Viewer as CesiumViewer,
  JulianDate,
  Entity,
  ProviderViewModel,
  OpenStreetMapImageryProvider,
  createDefaultImageryProviderViewModels,
  createDefaultTerrainProviderViewModels,
  ArcGISTiledElevationTerrainProvider,
  ArcGisMapServerImageryProvider,
  EllipsoidTerrainProvider,
} from "cesium";
import { ComponentProps, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CesiumComponentRef, CesiumMovementEvent, RootEventTarget, Viewer } from "resium";

import InfoBox from "@reearth-cms/components/molecules/Asset/InfoBox";

import { sortProperties } from "./sortProperty";

type Props = {
  onGetViewer: (viewer: CesiumViewer | undefined) => void;
  children?: React.ReactNode;
  properties?: any;
  showDescription?: boolean;
  onSelect?: (id: string | undefined) => void;
} & ComponentProps<typeof Viewer>;

const ResiumViewer: React.FC<Props> = ({
  onGetViewer,
  children,
  properties: passedProps,
  showDescription,
  onSelect,
  ...props
}) => {
  const viewer = useRef<CesiumComponentRef<CesiumViewer>>(null);
  const [properties, setProperties] = useState<any>();
  const [infoBoxVisibility, setInfoBoxVisibility] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selected, select] = useState(false);

  const handleClick = useCallback(
    (_movement: CesiumMovementEvent, target: RootEventTarget) => {
      if (!target) {
        setProperties(undefined);
        onSelect?.(undefined);
        return;
      }

      let props: any = {};
      if (target instanceof Cesium3DTileFeature) {
        const propertyIds = target.getPropertyIds();
        const length = propertyIds.length;
        for (let i = 0; i < length; ++i) {
          const propertyId = propertyIds[i];
          props[propertyId] = target.getProperty(propertyId);
        }
        onSelect?.(String(target.featureId));
        setTitle(props["name"]);
      } else if (target.id instanceof Entity) {
        const entity = target.id;
        setTitle(entity.id);
        onSelect?.(entity.id);
        setDescription(showDescription ? entity.description?.getValue(JulianDate.now()) : "");
        props = entity.properties?.getValue(JulianDate.now());
      }

      setInfoBoxVisibility(true);
      setProperties(props);
    },
    [onSelect, showDescription],
  );

  const handleClose = useCallback(() => {
    setInfoBoxVisibility(false);
  }, []);

  const sortedProperties: any = useMemo(() => {
    return sortProperties(passedProps ?? properties);
  }, [passedProps, properties]);

  const terrainProvider = useMemo(() => new EllipsoidTerrainProvider(), []);

  useEffect(() => {
    if (viewer.current) {
      onGetViewer(viewer.current?.cesiumElement);
    }
  }, [onGetViewer]);

  const handleSelect = useCallback(() => {
    select(!!viewer.current?.cesiumElement?.selectedEntity);
    setInfoBoxVisibility(true);
  }, []);

  const imagery = useMemo(() => {
    const result = [];
    const defaultImagery = createDefaultImageryProviderViewModels();
    const defaultTile = defaultImagery[0];
    result.push(
      new ProviderViewModel({
        name: "Default",
        iconUrl: defaultTile.iconUrl,
        tooltip: "",
        creationFunction: defaultTile.creationCommand,
      }),
    );

    const labelledTile = defaultImagery[1];
    result.push(
      new ProviderViewModel({
        name: "Labelled",
        iconUrl: labelledTile.iconUrl,
        tooltip: "",
        creationFunction: labelledTile.creationCommand,
      }),
    );

    const roadMapTile = defaultImagery[2];
    result.push(
      new ProviderViewModel({
        name: "RoadMap",
        iconUrl: roadMapTile.iconUrl,
        tooltip: "",
        creationFunction: roadMapTile.creationCommand,
      }),
    );

    const openStreetMapTile = defaultImagery[6];
    result.push(
      new ProviderViewModel({
        name: "OpenStreetMap",
        iconUrl: openStreetMapTile.iconUrl,
        tooltip: "",
        creationFunction: openStreetMapTile.creationCommand,
      }),
    );

    const earthAtNightTile = defaultImagery[11];
    result.push(
      new ProviderViewModel({
        name: "Earth at night",
        iconUrl: earthAtNightTile.iconUrl,
        tooltip: "",
        creationFunction: earthAtNightTile.creationCommand,
      }),
    );

    result.push(
      new ProviderViewModel({
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
      }),
    );
    result.push(
      new ProviderViewModel({
        name: "Japan GSI Standard Map",
        iconUrl: "https://maps.gsi.go.jp/xyz/std/0/0/0.png",
        tooltip: "",
        creationFunction: () => {
          return new OpenStreetMapImageryProvider({
            url: "https://cyberjapandata.gsi.go.jp/xyz/std/",
          });
        },
      }),
    );
    return result;
  }, []);

  const terrain = useMemo(() => {
    const result = [];
    const defaultTerrain = createDefaultTerrainProviderViewModels();
    const cesiumWorld = defaultTerrain[1];
    result.push(
      new ProviderViewModel({
        name: "",
        iconUrl: cesiumWorld.iconUrl,
        tooltip: "",
        creationFunction: cesiumWorld.creationCommand,
      }),
    );
    result.push(
      new ProviderViewModel({
        name: "ArcGIS Terrain",
        iconUrl: "",
        tooltip: "",
        creationFunction: () => {
          return new ArcGISTiledElevationTerrainProvider({
            url: "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer",
          });
        },
      }),
    );
    return result;
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <Viewer
        terrainProvider={terrainProvider}
        navigationHelpButton={false}
        homeButton={false}
        projectionPicker={false}
        sceneModePicker={false}
        baseLayerPicker={true}
        imageryProviderViewModels={imagery}
        terrainProviderViewModels={terrain}
        fullscreenButton={false}
        vrButton={false}
        selectionIndicator={false}
        timeline={false}
        animation={false}
        geocoder={false}
        shouldAnimate={true}
        onClick={handleClick}
        onSelectedEntityChange={handleSelect}
        infoBox={false}
        ref={viewer}
        {...props}>
        {children}
      </Viewer>
      <InfoBox
        infoBoxProps={sortedProperties}
        infoBoxVisibility={infoBoxVisibility && !!selected}
        title={title}
        description={description}
        onClose={handleClose}
      />
    </div>
  );
};

export default ResiumViewer;
