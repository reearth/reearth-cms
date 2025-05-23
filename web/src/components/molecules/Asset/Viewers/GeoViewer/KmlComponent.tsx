import { KmlDataSource, ConstantProperty, Resource } from "cesium";
import { ComponentProps, useCallback, useEffect, useState } from "react";
import { KmlDataSource as ResiumKmlDataSource, useCesium } from "resium";

import { waitForViewer } from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/waitForViewer";
import { useAuthHeader } from "@reearth-cms/gql";

type Props = ComponentProps<typeof ResiumKmlDataSource> & {
  isAssetPublic?: boolean;
  url: string;
};

const KmlComponent: React.FC<Props> = ({ isAssetPublic, url, ...props }) => {
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
        const resolvedViewer = await waitForViewer(viewer);
        await resolvedViewer.zoomTo(ds);
      } catch (error) {
        console.error(error);
      }
    },
    [viewer],
  );

  const handleLoading = useCallback((kmlDataSouce: KmlDataSource, isLoaded: boolean) => {
    if (isLoaded) kmlDataSouce.show = true;
  }, []);

  return (
    <ResiumKmlDataSource
      data={resource}
      clampToGround
      onLoad={handleLoad}
      onLoading={handleLoading}
      {...props}
    />
  );
};

export default KmlComponent;
