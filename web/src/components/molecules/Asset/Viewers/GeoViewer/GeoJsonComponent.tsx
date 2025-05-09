import { GeoJsonDataSource } from "cesium";
import { ComponentProps, useCallback } from "react";
import { GeoJsonDataSource as ResiumGeoJsonDataSource, useCesium } from "resium";

type Props = ComponentProps<typeof ResiumGeoJsonDataSource>;

const GeoJsonComponent: React.FC<Props> = ({ data, ...props }) => {
  const { viewer } = useCesium();

  const handleLoad = useCallback(async (ds: GeoJsonDataSource) => {
    if (!viewer) return;

    try {
      await viewer.zoomTo(ds);
      ds.show = true;
    } catch (error) {
      console.error("Failed to load GeoJSON data:", error);
    }
  }, [viewer]);

  return (
    <ResiumGeoJsonDataSource 
      data={data} 
      clampToGround 
      onLoad={handleLoad} 
      {...props} 
    />
  );
};

export default GeoJsonComponent;
