import { GeoJsonDataSource, Resource } from "cesium";
import { ComponentProps, useCallback, useEffect, useState } from "react";
import { GeoJsonDataSource as ResiumGeoJsonDataSource, useCesium } from "resium";

import { useAuthHeader } from "@reearth-cms/gql";

type Props = {
  isAssetPublic?: boolean;
  url: string;
} & ComponentProps<typeof ResiumGeoJsonDataSource>;

const GeoJsonComponent: React.FC<Props> = ({ isAssetPublic, url, ...props }) => {
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
    async (ds: GeoJsonDataSource) => {
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
    <ResiumGeoJsonDataSource
      clampToGround
      data={isAssetPublic ? url : resource}
      onLoad={handleLoad}
      {...props}
    />
  );
};

export default GeoJsonComponent;
