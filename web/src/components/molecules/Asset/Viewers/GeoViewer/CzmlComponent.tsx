import { CzmlDataSource, Entity, GeoJsonDataSource, Viewer } from "cesium";
import { ComponentProps, useCallback, useState } from "react";
import { CesiumMovementEvent, CzmlDataSource as ResiumCzmlDataSource, useCesium } from "resium";

import InfoBox from "./InfoBox";

type Props = ComponentProps<typeof ResiumCzmlDataSource>;

const CzmlComponent: React.FC<Props> = ({ data }) => {
  const { viewer }: { viewer: Viewer } = useCesium();
  const [dataSource, setDataSource] = useState<GeoJsonDataSource>();
  const [infoBoxProps, setInfoBoxProps] = useState({});
  const [infoBoxVisibility, setInfoBoxVisibility] = useState<boolean>(false);
  const [selectedEntity, setSelectedEntity] = useState<Entity>();

  const handleLoad = useCallback(
    async (ds: CzmlDataSource) => {
      setDataSource(ds);

      try {
        await viewer?.dataSources.removeAll();
        await viewer?.dataSources.add(ds);
        await viewer?.zoomTo(ds);
        ds.show = true;
      } catch (error) {
        console.error(error);
      }
    },
    [viewer],
  );

  const handleClick = useCallback(
    (_movement: CesiumMovementEvent, target: any) => {
      const id = target?.id.id;
      const entity = dataSource?.entities.getById(id);
      setSelectedEntity(entity);
      const props = entity?.properties?.getValue(viewer?.clock.currentTime);
      setInfoBoxProps(props);
      setInfoBoxVisibility(true);
    },
    [dataSource?.entities, viewer?.clock.currentTime],
  );

  const handleClose = () => {
    setInfoBoxVisibility(false);
  };

  return (
    <>
      <ResiumCzmlDataSource data={data} onLoad={handleLoad} onClick={handleClick} />
      {infoBoxVisibility && (
        <InfoBox
          infoBoxProps={infoBoxProps}
          infoBoxVisibility={infoBoxVisibility}
          title={selectedEntity?.id}
          onClose={handleClose}
        />
      )}
    </>
  );
};

export default CzmlComponent;
