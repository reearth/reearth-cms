import { GeoJsonDataSource, JulianDate } from "cesium";
import { ComponentProps, useCallback, useState } from "react";
import { JSONTree } from "react-json-tree";
import {
  GeoJsonDataSource as ResiumGeoJsonDataSource,
  useCesium,
  CesiumMovementEvent,
} from "resium";

type Props = ComponentProps<typeof ResiumGeoJsonDataSource>;

const GeoJsonComponent: React.FC<Props> = () => {
  const { viewer } = useCesium();
  const [dataSource, setDataSource] = useState<GeoJsonDataSource>();
  const [infoBoxProps, setInfoBoxProps] = useState({});
  const [infoBoxVisibility, setInfoBoxVisibility] = useState<boolean>(false);

  const handleLoad = useCallback(
    async (ds: GeoJsonDataSource) => {
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

  const handleClick = (_movement: CesiumMovementEvent, target: any) => {
    const id = target?.id.id;
    const entity = dataSource?.entities.getById(id);
    const now = JulianDate.now();
    const props = entity?.properties?.getValue(now);
    setInfoBoxProps(props);
    setInfoBoxVisibility(true);
  };

  return (
    <div style={{ position: "absolute" }}>
      <ResiumGeoJsonDataSource
        data="http://localhost:8080/assets/29/242ad5-264a-4695-bddb-be558c68b7e6/sample.geojson"
        onLoad={handleLoad}
        onClick={handleClick}
      />
      {infoBoxVisibility && (
        <div style={{ position: "relative", top: 0, right: 0 }}>
          <JSONTree data={infoBoxProps} />
        </div>
      )}
    </div>
  );
};

export default GeoJsonComponent;
