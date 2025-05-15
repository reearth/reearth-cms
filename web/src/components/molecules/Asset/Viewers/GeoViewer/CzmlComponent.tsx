import { CzmlDataSource } from "cesium";
import { ComponentProps, useCallback } from "react";
import { CzmlDataSource as ResiumCzmlDataSource, useCesium } from "resium";

import { waitForViewer } from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/waitForViewer";

type Props = ComponentProps<typeof ResiumCzmlDataSource>;

const CzmlComponent: React.FC<Props> = ({ data, ...props }) => {
  const { viewer } = useCesium();

  const handleLoad = useCallback(
    async (ds: CzmlDataSource) => {
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

  return <ResiumCzmlDataSource data={data} onLoad={handleLoad} {...props} />;
};

export default CzmlComponent;
