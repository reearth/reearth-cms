import { KmlDataSource, ConstantProperty, Resource, Viewer as CesiumViewer } from "cesium";
import { ComponentProps, useCallback, useEffect, useState, RefObject } from "react";
import { KmlDataSource as ResiumKmlDataSource, CesiumComponentRef } from "resium";

import { waitForViewer } from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/waitForViewer";
import { useAuthHeader } from "@reearth-cms/gql";

type Props = ComponentProps<typeof ResiumKmlDataSource> & {
  viewerRef: RefObject<CesiumComponentRef<CesiumViewer>>;
  isAssetPublic?: boolean;
  url: string;
};

const KmlComponent: React.FC<Props> = ({ viewerRef, isAssetPublic, url, ...props }) => {
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
    async (ds: KmlDataSource) => {
      for (const entity of ds.entities.values) {
        if (entity.billboard) {
          entity.billboard.disableDepthTestDistance = new ConstantProperty(
            Number.POSITIVE_INFINITY,
          );
        }
        if (entity.label) {
          entity.label.disableDepthTestDistance = new ConstantProperty(Number.POSITIVE_INFINITY);
        }
      }
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
    <ResiumKmlDataSource
      data={isAssetPublic ? url : resource}
      clampToGround
      onLoad={handleLoad}
      {...props}
    />
  );
};

export default KmlComponent;
