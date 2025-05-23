import { CzmlDataSource, Resource } from "cesium";
import { ComponentProps, useCallback, useEffect, useState } from "react";
import { CzmlDataSource as ResiumCzmlDataSource } from "resium";

import { useAuthHeader } from "@reearth-cms/gql";

type Props = ComponentProps<typeof ResiumCzmlDataSource> & {
  viewerRef?: any;
  isAssetPublic?: boolean;
  url: string;
};

const CzmlComponent: React.FC<Props> = ({ viewerRef, isAssetPublic, url, ...props }) => {
  const { getHeader } = useAuthHeader();
  const [resource, setResource] = useState<Resource>();

  useEffect(() => {
    if (resource || !url) return;

    const prepareResource = async () => {
      try {
        const headers = isAssetPublic ? {} : await getHeader();
        setResource(new Resource({ url, headers }));
      } catch (error) {
        console.error(error);
      }
    };
    prepareResource();
  }, [url, isAssetPublic, getHeader, resource]);

  const handleLoad = useCallback(
    async (ds: CzmlDataSource) => {
      try {
        await viewerRef.current?.cesiumElement?.zoomTo(ds.entities);
        ds.show = true;
      } catch (error) {
        console.error(error);
      }
    },
    [viewerRef],
  );

  return <ResiumCzmlDataSource data={resource} onLoad={handleLoad} {...props} />;
};

export default CzmlComponent;
