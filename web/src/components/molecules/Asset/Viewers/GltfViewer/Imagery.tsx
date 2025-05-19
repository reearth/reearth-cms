import { Cartesian3, Entity, Resource } from "cesium";
import { useEffect } from "react";
import { useCesium } from "resium";

import { waitForViewer } from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/waitForViewer";
import { useAuthHeader } from "@reearth-cms/gql";

type Props = {
  isAssetPublic?: boolean;
  url: string;
};

export const Imagery: React.FC<Props> = ({ isAssetPublic, url }) => {
  const { viewer } = useCesium();
  const { getHeader } = useAuthHeader();

  useEffect(() => {
    const loadModel = async () => {
      try {
        const headers = await getHeader();
        const resource = new Resource({
          url: url,
          headers: isAssetPublic ? {} : headers,
        });
        const resolvedViewer = await waitForViewer(viewer);
        resolvedViewer.entities.removeAll();
        const entity: Entity = resolvedViewer.entities.add({
          position: Cartesian3.fromDegrees(
            Math.floor(Math.random() * 360 - 180),
            Math.floor(Math.random() * 180 - 90),
            0,
          ),
          model: {
            uri: resource,
            minimumPixelSize: 128,
            maximumScale: 20000,
            show: true,
          },
        });
        resolvedViewer.trackedEntity = entity;
        await resolvedViewer.zoomTo(entity);
      } catch (err) {
        console.error(err);
      }
    };
    loadModel();

    return () => {
      if (viewer) {
        viewer.entities.removeAll();
        viewer.trackedEntity = undefined;
      }
    };
  }, [getHeader, isAssetPublic, url, viewer]);

  return null;
};
