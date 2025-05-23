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
  const [dataSource, setDataSource] = useState<GeoJsonDataSource>();

  const createResource = useCallback(async () => {
    try {
      const headers = isAssetPublic ? {} : await getHeader();
      setResource(new Resource({ url, headers }));
    } catch (error) {
      console.error("Failed to create GeoJSON resource:", error);
    }
  }, [getHeader, isAssetPublic, url]);

  useEffect(() => {
    if (!url || resource) return;
    createResource();
  }, [url, resource, createResource]);

  useEffect(() => {
    const tryZoom = async () => {
      if (!viewer || !dataSource || dataSource.isLoading) {
        return;
      }

      try {
        const resolvedViewer = await waitForViewer(viewer);
        await resolvedViewer.zoomTo(dataSource);
        dataSource.show = true;
      } catch (error) {
        console.error("Zoom retry failed:", error);
      }
    };

    tryZoom();
  }, [viewer, resource, createResource, dataSource]);

  const handleLoad = useCallback(async (ds: GeoJsonDataSource) => {
    setDataSource(ds);
  }, []);

  return <ResiumGeoJsonDataSource data={resource} clampToGround onLoad={handleLoad} {...props} />;
};

export default GeoJsonComponent;
