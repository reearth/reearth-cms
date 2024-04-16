import styled from "@emotion/styled";
import { Cesium3DTileFeature, Viewer as CesiumViewer, JulianDate, Entity } from "cesium";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CesiumComponentRef, CesiumMovementEvent, RootEventTarget, Viewer } from "resium";

import InfoBox from "@reearth-cms/components/molecules/Asset/InfoBox";
import { Property } from "@reearth-cms/components/molecules/Asset/Viewers/MvtViewer/Imagery";
import { WorkspaceSettings } from "@reearth-cms/components/molecules/Workspace/types";

import { imageryGet, terrainGet } from "./provider";
import { sortProperties } from "./sortProperty";

type Props = {
  onGetViewer: (viewer?: CesiumViewer) => void;
  children: React.ReactNode;
  properties?: Property;
  showDescription?: boolean;
  onSelect?: (id?: string) => void;
  workspaceSettings: WorkspaceSettings;
};

const ResiumViewer: React.FC<Props> = ({
  onGetViewer,
  children,
  properties: passedProps,
  showDescription,
  onSelect,
  workspaceSettings,
}) => {
  const viewer = useRef<CesiumComponentRef<CesiumViewer>>(null);
  const [properties, setProperties] = useState<Property>();
  const [infoBoxVisibility, setInfoBoxVisibility] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const mvtClickedFlag = useRef(false);

  const setSortedProperties = useCallback((properties: any) => {
    setProperties(sortProperties(properties));
  }, []);

  const handleClick = useCallback(
    (_movement: CesiumMovementEvent, target: RootEventTarget) => {
      if (mvtClickedFlag.current) {
        mvtClickedFlag.current = false;
        return;
      } else if (!target) {
        setSortedProperties(undefined);
        onSelect?.(undefined);
        setInfoBoxVisibility(false);
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
      setSortedProperties(props);
    },
    [onSelect, setSortedProperties, showDescription],
  );

  const handleClose = useCallback(() => {
    setInfoBoxVisibility(false);
  }, []);

  useEffect(() => {
    if (viewer.current) {
      onGetViewer(viewer.current?.cesiumElement);
    }
  }, [onGetViewer]);

  useEffect(() => {
    if (passedProps) {
      setSortedProperties(passedProps);
      setInfoBoxVisibility(true);
      mvtClickedFlag.current = true;
    }
  }, [passedProps, setSortedProperties]);

  const imagery = useMemo(() => {
    return workspaceSettings.tiles ? imageryGet(workspaceSettings.tiles.resources) : [];
  }, [workspaceSettings.tiles]);

  const terrain = useMemo(() => {
    return workspaceSettings.terrains?.enabled
      ? terrainGet(workspaceSettings.terrains.resources)
      : [];
  }, [workspaceSettings.terrains]);

  return (
    <Container>
      <StyledViewer
        navigationHelpButton={false}
        homeButton={false}
        projectionPicker={false}
        sceneModePicker={false}
        baseLayerPicker={true}
        imageryProviderViewModels={imagery}
        selectedTerrainProviderViewModel={terrain[1]}
        terrainProviderViewModels={terrain}
        fullscreenButton={false}
        vrButton={false}
        selectionIndicator={false}
        timeline={false}
        animation={false}
        geocoder={false}
        shouldAnimate={true}
        onClick={handleClick}
        infoBox={false}
        ref={viewer}>
        {children}
      </StyledViewer>
      <InfoBox
        infoBoxProps={properties}
        infoBoxVisibility={infoBoxVisibility}
        title={title}
        description={description}
        onClose={handleClose}
      />
    </Container>
  );
};

export default ResiumViewer;

const Container = styled.div`
  position: relative;
`;

const StyledViewer = styled(Viewer)`
  .cesium-baseLayerPicker-dropDown {
    box-sizing: content-box;
  }
  .cesium-baseLayerPicker-choices {
    text-align: left;
  }
`;
