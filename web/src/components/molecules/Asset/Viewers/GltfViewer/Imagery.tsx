import { Cartesian3, Resource } from "cesium";
import { useEffect } from "react";
import { useCesium } from "resium";

import { useAuthHeader } from "@reearth-cms/gql";

type Props = {
  isAssetPublic?: boolean;
  url: string;
};

export const Imagery: React.FC<Props> = ({ isAssetPublic, url }) => {
  const { viewer } = useCesium();
  const { getHeader } = useAuthHeader();

  useEffect(() => {
    if (!viewer) return;

    const loadModel = async () => {
      try {
        const headers = await getHeader();
        const resource = new Resource({
          url: url,
          headers: isAssetPublic ? {} : headers,
        });
        viewer.entities.removeAll();
        const entity = viewer.entities.add({
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
        viewer.trackedEntity = entity;
        await viewer.zoomTo(entity);
      } catch (err) {
        console.error(err);
      }
    };
    loadModel();
  }, [getHeader, isAssetPublic, url, viewer]);

  return null;
};
