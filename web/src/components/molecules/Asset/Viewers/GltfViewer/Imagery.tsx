import { Cartesian3 } from "cesium";
import { useEffect } from "react";
import { useCesium } from "resium";

type Props = {
  url: string;
};

export const Imagery: React.FC<Props> = ({ url }) => {
  const { viewer } = useCesium();

  useEffect(() => {
    const loadModel = async () => {
      if (!viewer) return;
      try {
        viewer?.entities.removeAll();
        const entity = viewer.entities.add({
          position: Cartesian3.fromDegrees(
            Math.floor(Math.random() * 360 - 180),
            Math.floor(Math.random() * 180 - 90),
            0,
          ),
          model: {
            uri: url,
            minimumPixelSize: 128,
            maximumScale: 20000,
            show: true,
          },
        });
        viewer.trackedEntity = entity;
        await viewer?.zoomTo(entity);
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
  }, [url, viewer]);

  return null;
};
