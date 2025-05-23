import { Cartesian3, Resource } from "cesium";
import { useEffect } from "react";

import { useAuthHeader } from "@reearth-cms/gql";

type Props = {
  viewerRef?: any;
  isAssetPublic?: boolean;
  url: string;
};

export const Imagery: React.FC<Props> = ({ viewerRef, isAssetPublic, url }) => {
  const { getHeader } = useAuthHeader();

  useEffect(() => {
    const loadModel = async () => {
      try {
        const headers = await getHeader();
        const resource = new Resource({
          url: url,
          headers: isAssetPublic ? {} : headers,
        });
        const viewer = viewerRef?.current?.cesiumElement;
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
  }, [getHeader, isAssetPublic, url, viewerRef]);

  return null;
};
