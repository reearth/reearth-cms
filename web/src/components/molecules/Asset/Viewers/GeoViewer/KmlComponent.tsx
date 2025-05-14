import { KmlDataSource, ConstantProperty } from "cesium";
import { ComponentProps, useCallback } from "react";
import { KmlDataSource as ResiumKmlDataSource, useCesium } from "resium";

import { waitForViewer } from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/waitForViewer";

type Props = ComponentProps<typeof ResiumKmlDataSource>;

const KmlComponent: React.FC<Props> = ({ data, ...props }) => {
  const { viewer } = useCesium();

  const handleLoad = useCallback(
    async (ds: KmlDataSource) => {
      for (const entity of ds.entities.values) {
        if (entity.billboard) {
          entity.billboard.disableDepthTestDistance = new ConstantProperty(
            Number.POSITIVE_INFINITY,
          );
        }
        if (entity.label) {
          entity.label.disableDepthTestDistance = new ConstantProperty(Number.POSITIVE_INFINITY);
        }
      }
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

  return <ResiumKmlDataSource data={data} onLoad={handleLoad} clampToGround {...props} />;
};

export default KmlComponent;
