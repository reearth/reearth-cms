import { GeoJsonDataSource } from "cesium";
import { ComponentProps, useCallback } from "react";
import { GeoJsonDataSource as ResiumGeoJsonDataSource, useCesium } from "resium";

type Props = { setIsViewerLoading: (loading: boolean) => void } & ComponentProps<
  typeof ResiumGeoJsonDataSource
>;

const GeoJsonComponent: React.FC<Props> = ({ data, setIsViewerLoading }) => {
  const { viewer } = useCesium();

  const handleLoad = useCallback(
    async (ds: GeoJsonDataSource) => {
      setIsViewerLoading(true);
      try {
        await viewer?.zoomTo(ds);
        ds.show = true;
      } catch (error) {
        console.error(error);
      } finally {
        setIsViewerLoading(false);
      }
    },
    [setIsViewerLoading, viewer],
  );

  return <ResiumGeoJsonDataSource data={data} onLoad={handleLoad} />;
};

export default GeoJsonComponent;
