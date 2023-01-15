import { Entity, KmlDataSource, Viewer } from "cesium";
import { ComponentProps, useCallback, useState } from "react";
import { KmlDataSource as ResiumKmlDataSource, useCesium, CesiumMovementEvent } from "resium";

import InfoBox from "./InfoBox";

type Props = ComponentProps<typeof ResiumKmlDataSource>;

const KmlComponent: React.FC<Props> = ({ data }) => {
  const { viewer }: { viewer: Viewer } = useCesium();
  const [dataSource, setDataSource] = useState<KmlDataSource>();
  const [infoBoxProps, setInfoBoxProps] = useState({});
  const [infoBoxVisibility, setInfoBoxVisibility] = useState<boolean>(false);
  const [selectedEntity, setSelectedEntity] = useState<Entity>();

  const handleLoad = useCallback(
    async (ds: KmlDataSource) => {
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
      const props = entity?.properties?.getValue(viewer.clock.currentTime);
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
      <ResiumKmlDataSource data={data} onLoad={handleLoad} onClick={handleClick} />
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

export default KmlComponent;
