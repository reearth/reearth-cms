import { GeoJsonDataSource } from "cesium";
import { ComponentProps } from "react";
import { GeoJsonDataSource as ResiumGeoJsonDataSource, useCesium } from "resium";

type Props = ComponentProps<typeof ResiumGeoJsonDataSource>;

const GeoJsonComponent: React.FC<Props> = ({ data }) => {
  const { viewer } = useCesium();

  const onLoad = async (ds: GeoJsonDataSource) => {
    try {
      await viewer?.zoomTo(ds);
      ds.show = true;
    } catch (error) {
      console.error(error);
    }
  };

  return <ResiumGeoJsonDataSource data={data} onLoad={onLoad} />;
};

export default GeoJsonComponent;
