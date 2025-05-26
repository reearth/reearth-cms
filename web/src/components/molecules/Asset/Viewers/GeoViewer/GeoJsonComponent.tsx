import { GeoJsonDataSource, Resource, Viewer as CesiumViewer } from "cesium";
import { ComponentProps, useCallback, useEffect, useState, RefObject } from "react";
import { GeoJsonDataSource as ResiumGeoJsonDataSource, CesiumComponentRef } from "resium";

import { waitForViewer } from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/waitForViewer";
import { useAuthHeader } from "@reearth-cms/gql";

type Props = ComponentProps<typeof ResiumGeoJsonDataSource> & {
  isAssetPublic?: boolean;
  url: string;
  viewerRef: RefObject<CesiumComponentRef<CesiumViewer>>;
};

const GeoJsonComponent: React.FC<Props> = ({ isAssetPublic, url, viewerRef, ...props }) => {
  const { getHeader } = useAuthHeader();
  const [resource, setResource] = useState<Resource>();

  useEffect(() => {
    if (resource || isAssetPublic) return;

    const prepareResource = async () => {
      try {
        const headers = await getHeader();
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
        const resolvedViewer = await waitForViewer(viewerRef.current?.cesiumElement);
        await resolvedViewer.zoomTo(ds.entities);
        ds.show = true;
      } catch (error) {
        console.error(error);
      }
    },
    [viewerRef],
  );

  return (
    <ResiumGeoJsonDataSource
      data={isAssetPublic ? url : resource}
      clampToGround
      onLoad={handleLoad}
      {...props}
    />
  );
};

export default GeoJsonComponent;
