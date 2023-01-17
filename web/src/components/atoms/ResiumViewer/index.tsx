import { Cesium3DTileFeature, createWorldTerrain, Viewer, JulianDate, Entity } from "cesium";
import { ComponentProps, useCallback, useMemo, useState } from "react";
import { CesiumMovementEvent, RootEventTarget, Viewer as RViewer } from "resium";

import InfoBox from "@reearth-cms/components/molecules/Asset/InfoBox";

import { sortProperties } from "./sortProperty";

type Props = {
  onGetViewer: (viewer: Viewer | undefined) => void;
  children?: React.ReactNode;
  properties?: any;
  entitySelected?: boolean;
} & ComponentProps<typeof RViewer>;

const ResiumViewer: React.FC<Props> = ({
  onGetViewer,
  children,
  properties: passedProps,
  entitySelected,
  ...props
}) => {
  let viewer: Viewer | undefined;
  const [properties, setProperties] = useState<any>();
  const [infoBoxVisibility, setInfoBoxVisibility] = useState(false);
  const [title, setTitle] = useState("");

  const handleClick = useCallback((_movement: CesiumMovementEvent, target: RootEventTarget) => {
    if (!target) {
      setProperties(undefined);
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
      setTitle(props["name"]);
    } else if (target.id instanceof Entity) {
      const entity = target.id;
      setTitle(entity.id);
      props = entity.properties?.getValue(JulianDate.now());
    }

    setInfoBoxVisibility(true);
    setProperties(props);
  }, []);

  const handleClose = useCallback(() => {
    setInfoBoxVisibility(false);
  }, []);

  const sortedProperties: any = useMemo(() => {
    return sortProperties(passedProps ?? properties);
  }, [passedProps, properties]);

  return (
    <div style={{ position: "relative" }}>
      <RViewer
        terrainProvider={createWorldTerrain()}
        navigationHelpButton={false}
        homeButton={false}
        projectionPicker={false}
        sceneModePicker={false}
        baseLayerPicker={false}
        fullscreenButton={false}
        vrButton={false}
        selectionIndicator={false}
        timeline={false}
        animation={false}
        geocoder={false}
        shouldAnimate={true}
        onClick={handleClick}
        infoBox={false}
        ref={e => {
          viewer = e?.cesiumElement;
          onGetViewer(viewer);
        }}
        {...props}>
        {children}
      </RViewer>
      <InfoBox
        infoBoxProps={sortedProperties}
        infoBoxVisibility={infoBoxVisibility || !!entitySelected}
        title={title}
        onClose={handleClose}
      />
    </div>
  );
};

export default ResiumViewer;
