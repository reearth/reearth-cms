import { CzmlDataSource, Resource } from "cesium";
import { ComponentProps, useCallback, useEffect, useState } from "react";
import { CzmlDataSource as ResiumCzmlDataSource, useCesium } from "resium";

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
        await viewer?.zoomTo(ds);
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
