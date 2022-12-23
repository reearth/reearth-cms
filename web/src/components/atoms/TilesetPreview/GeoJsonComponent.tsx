import { Viewer, GeoJsonDataSource } from "cesium";
import { ComponentProps } from "react";
import { GeoJsonDataSource as ResiumGeoJsonDataSource } from "resium";

type Props = {
  viewer?: Viewer | undefined;
} & ComponentProps<typeof ResiumGeoJsonDataSource>;

const GeoJsonComponent: React.FC<Props> = ({ viewer, data }) => {
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
