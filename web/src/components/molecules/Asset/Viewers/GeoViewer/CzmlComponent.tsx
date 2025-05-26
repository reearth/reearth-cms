import { CzmlDataSource, Resource, Viewer as CesiumViewer } from "cesium";
import { ComponentProps, useCallback, useEffect, useState, RefObject } from "react";
import { CzmlDataSource as ResiumCzmlDataSource, CesiumComponentRef } from "resium";

import { waitForViewer } from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/waitForViewer";
import { useAuthHeader } from "@reearth-cms/gql";

type Props = ComponentProps<typeof ResiumCzmlDataSource> & {
  viewerRef: RefObject<CesiumComponentRef<CesiumViewer>>;
  isAssetPublic?: boolean;
  url: string;
};

const CzmlComponent: React.FC<Props> = ({ viewerRef, isAssetPublic, url, ...props }) => {
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
    async (ds: CzmlDataSource) => {
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
    <ResiumCzmlDataSource data={isAssetPublic ? url : resource} onLoad={handleLoad} {...props} />
  );
};

export default CzmlComponent;
