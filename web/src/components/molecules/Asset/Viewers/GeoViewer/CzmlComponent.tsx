import { CzmlDataSource, Resource } from "cesium";
import { ComponentProps, useCallback, useEffect, useState } from "react";
import { CzmlDataSource as ResiumCzmlDataSource, useCesium } from "resium";

import { useAuthHeader } from "@reearth-cms/gql";

type Props = {
  isAssetPublic?: boolean;
  url: string;
} & ComponentProps<typeof ResiumCzmlDataSource>;

const CzmlComponent: React.FC<Props> = ({ isAssetPublic, url, ...props }) => {
  const { viewer } = useCesium();
  const { getHeader } = useAuthHeader();
  const [resource, setResource] = useState<Resource>();

  useEffect(() => {
    if (resource || isAssetPublic) return;

    const prepareResource = async () => {
      try {
        const headers = await getHeader();
        setResource(new Resource({ headers, url }));
      } catch (error) {
        console.error(error);
      }
    };
    prepareResource();
  }, [url, isAssetPublic, getHeader, resource]);

  const handleLoad = useCallback(
    async (ds: CzmlDataSource) => {
      try {
        await viewer?.zoomTo(ds.entities);
        ds.show = true;
      } catch (error) {
        console.error(error);
      }
    },
    [viewer],
  );

  return (
    <ResiumCzmlDataSource data={isAssetPublic ? url : resource} onLoad={handleLoad} {...props} />
  );
};

export default CzmlComponent;
