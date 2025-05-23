import { GeoJsonDataSource, Resource } from "cesium";
import { ComponentProps, useCallback, useEffect, useState } from "react";
import { GeoJsonDataSource as ResiumGeoJsonDataSource, useCesium } from "resium";

import { waitForViewer } from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/waitForViewer";
import { useAuthHeader } from "@reearth-cms/gql";

type Props = ComponentProps<typeof ResiumGeoJsonDataSource> & {
  isAssetPublic?: boolean;
  url: string;
};

const GeoJsonComponent: React.FC<Props> = ({ isAssetPublic, url, ...props }) => {
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
    async (ds: GeoJsonDataSource) => {
      try {
        const resolvedViewer = await waitForViewer(viewer);
        await resolvedViewer.zoomTo(ds);
      } catch (error) {
        console.error(error);
      }
    },
    [viewer],
  );

  const handleLoading = useCallback((GeoJsonDataSource: GeoJsonDataSource, isLoaded: boolean) => {
    if (isLoaded) GeoJsonDataSource.show = true;
  }, []);

  return (
    <ResiumGeoJsonDataSource
      data={resource}
      clampToGround
      onLoad={handleLoad}
      onLoading={handleLoading}
      {...props}
    />
  );
};

export default GeoJsonComponent;
