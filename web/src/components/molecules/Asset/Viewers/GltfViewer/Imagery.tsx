import { Cartesian3, Resource, Viewer as CesiumViewer } from "cesium";
import { useEffect, RefObject } from "react";
import { CesiumComponentRef } from "resium";

import { waitForViewer } from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/waitForViewer";
import { useAuthHeader } from "@reearth-cms/gql";

type Props = {
  isAssetPublic?: boolean;
  url: string;
  viewerRef: RefObject<CesiumComponentRef<CesiumViewer>>;
};

export const Imagery: React.FC<Props> = ({ isAssetPublic, url, viewerRef }) => {
  const { getHeader } = useAuthHeader();

  useEffect(() => {
    let resolvedViewer: CesiumViewer | undefined;
    const loadModel = async () => {
      try {
        const headers = await getHeader();
        const resource = new Resource({
          url: url,
          headers: isAssetPublic ? {} : headers,
        });
        resolvedViewer = await waitForViewer(viewerRef.current?.cesiumElement);
        resolvedViewer.entities.removeAll();
        const entity = resolvedViewer.entities.add({
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
      if (resolvedViewer) {
        resolvedViewer.entities.removeAll();
        resolvedViewer.trackedEntity = undefined;
      }
    };
  }, [getHeader, isAssetPublic, url, viewerRef]);

  return null;
};
