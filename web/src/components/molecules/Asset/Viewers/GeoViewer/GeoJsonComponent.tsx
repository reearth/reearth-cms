import { GeoJsonDataSource, Resource } from "cesium";
import { ComponentProps, useCallback, useEffect, useRef, useState } from "react";
import { GeoJsonDataSource as ResiumGeoJsonDataSource, useCesium } from "resium";

import { waitForViewer } from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/waitForViewer";
import { useAuthHeader } from "@reearth-cms/gql";

type Props = ComponentProps<typeof ResiumGeoJsonDataSource> & {
  isAssetPublic?: boolean;
  url: string;
};

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

const GeoJsonComponent: React.FC<Props> = ({ isAssetPublic, url, ...props }) => {
  const { viewer } = useCesium();
  const { getHeader } = useAuthHeader();
  const [resource, setResource] = useState<Resource>();
  const [loading, setLoading] = useState(true);
  const geoJsonDataSourceRef = useRef<GeoJsonDataSource | null>(null);
  const retries = useRef(0);

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
      if (!viewer || !geoJsonDataSourceRef.current) return;

      if (viewer.isDestroyed() && retries.current < MAX_RETRIES) {
        retries.current += 1;
        console.warn(`Viewer destroyed. Retrying zoom... (${retries.current}/${MAX_RETRIES})`);
        setTimeout(() => createResource(), RETRY_DELAY_MS);
        return;
      }

      try {
        const resolvedViewer = await waitForViewer(viewer);
        await resolvedViewer.zoomTo(geoJsonDataSourceRef.current);
        retries.current = 0; // Reset on success
      } catch (error) {
        console.error("Zoom retry failed:", error);
      }
    };

    tryZoom();
  }, [viewer, resource, createResource]);

  const handleLoad = useCallback(
    async (ds: GeoJsonDataSource) => {
      geoJsonDataSourceRef.current = ds;
      try {
        const resolvedViewer = await waitForViewer(viewer);
        await resolvedViewer.zoomTo(ds);
        ds.show = true;
        retries.current = 0;
      } catch (error) {
        console.error("Error in GeoJSON handleLoad:", error);
      }
    },
    [viewer],
  );

  const handleLoading = useCallback((_: GeoJsonDataSource, isLoading: boolean) => {
    setLoading(isLoading);
  }, []);

  useEffect(() => {
    if (loading) {
      console.log("CzmlDataSource loading");
    } else {
      console.log("CzmlDataSource loaded");
    }
  }, [loading]);

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
