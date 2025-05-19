import { CzmlDataSource, Resource } from "cesium";
import { ComponentProps, useCallback, useEffect, useState } from "react";
import { CzmlDataSource as ResiumCzmlDataSource, useCesium } from "resium";

import { waitForViewer } from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/waitForViewer";
import { useAuthHeader } from "@reearth-cms/gql";

type Props = ComponentProps<typeof ResiumCzmlDataSource> & {
  isAssetPublic?: boolean;
  url: string;
};

const CzmlComponent: React.FC<Props> = ({ isAssetPublic, url, ...props }) => {
  const { viewer } = useCesium();
  const { getHeader } = useAuthHeader();
  const [resource, setResource] = useState<Resource>();

  useEffect(() => {
    if (resource) return;
    const prepareResource = async () => {
      if (!url) return;

      if (isAssetPublic) {
        setResource(new Resource({ url }));
      } else {
        const headers = await getHeader();
        setResource(new Resource({ url, headers }));
      }
    };
    prepareResource();
  }, [url, isAssetPublic, getHeader, resource]);

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

  return <ResiumCzmlDataSource data={resource} onLoad={handleLoad} {...props} />;
};

export default CzmlComponent;
