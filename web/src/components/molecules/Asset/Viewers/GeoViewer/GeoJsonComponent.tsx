import { GeoJsonDataSource } from "cesium";
import { ComponentProps, useCallback } from "react";
import { GeoJsonDataSource as ResiumGeoJsonDataSource, useCesium } from "resium";

import { waitForViewer } from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/waitForViewer";

type Props = ComponentProps<typeof ResiumGeoJsonDataSource>;

const GeoJsonComponent: React.FC<Props> = ({ data, ...props }) => {
  const { viewer } = useCesium();

  const handleLoad = useCallback(
    async (ds: GeoJsonDataSource) => {
      try {
        const resolvedViewer = await waitForViewer(viewer);
        await resolvedViewer.zoomTo(ds);
        ds.show = true;
      } catch (error) {
        console.error(error);
      }
    },
    [viewer],
  );

  return <ResiumGeoJsonDataSource data={data} clampToGround onLoad={handleLoad} {...props} />;
};

export default GeoJsonComponent;
