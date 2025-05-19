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
    if (resource) return;
    const prepareResource = async () => {
      if (!url) return;

      if (isAssetPublic) {
        setResource(new Resource({ url }));
      } else {
        const headers = await getHeader();
        setResource(new Resource({ url, headers }));
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
        ds.show = true;
      } catch (error) {
        console.error(error);
      }
    },
    [viewer],
  );

  return <ResiumKmlDataSource data={resource} onLoad={handleLoad} clampToGround {...props} />;
};

export default KmlComponent;
