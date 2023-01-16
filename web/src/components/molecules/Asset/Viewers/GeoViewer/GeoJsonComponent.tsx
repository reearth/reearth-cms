import { GeoJsonDataSource } from "cesium";
import { ComponentProps, useCallback } from "react";
import { GeoJsonDataSource as ResiumGeoJsonDataSource, useCesium } from "resium";

type Props = ComponentProps<typeof ResiumGeoJsonDataSource>;

const GeoJsonComponent: React.FC<Props> = () => {
  const { viewer } = useCesium();

  const handleLoad = useCallback(
    async (ds: GeoJsonDataSource) => {
      try {
        await viewer?.zoomTo(ds);
        ds.show = true;
      } catch (error) {
        console.error(error);
      }
    },
    [viewer],
  );

  return (
    <ResiumGeoJsonDataSource
      data="http://localhost:8080/assets/29/242ad5-264a-4695-bddb-be558c68b7e6/sample.geojson"
      onLoad={handleLoad}
    />
  );
};

export default GeoJsonComponent;
