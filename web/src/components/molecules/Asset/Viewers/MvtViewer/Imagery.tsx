import { Viewer } from "cesium";
import { MVTImageryProvider } from "cesium-mvt-imagery-provider";
import { useEffect } from "react";

import { ImageryProviderOption } from "./imagery.type";

type Props = {
  imageryOption: ImageryProviderOption;
  viewer: Viewer | undefined;
};

export const Imagery: React.FC<Props> = ({ imageryOption, viewer }) => {
  useEffect(() => {
    const imageryProvider = new MVTImageryProvider(imageryOption);
    if (viewer) {
      const layers = viewer.scene.imageryLayers;
      const currentLayer = layers.addImageryProvider(imageryProvider);
      currentLayer.alpha = 0.5;

      return () => {
        layers.remove(currentLayer);
      };
    }
  }, [viewer, imageryOption.urlTemplate, imageryOption]);

  return <div />;
};
