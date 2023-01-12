import { MVTImageryProvider, ImageryProviderOption } from "cesium-mvt-imagery-provider";
import { useEffect, useState } from "react";
import { useCesium } from "resium";

type Props = {
  url: string;
};

export const Imagery: React.FC<Props> = () => {
  const { viewer } = useCesium();
  const [isFeatureSelected, setIsFeatureSelected] = useState<boolean>(false);

  useEffect(() => {
    const imageryOption: ImageryProviderOption = {
      // TODO: url template and layer name are hard codded, should be replaced.
      urlTemplate:
        "https://d2jfi34fqvxlsc.cloudfront.net/main/data/mvt/tran/13100_tokyo/{z}/{x}/{y}.mvt",
      layerName: "road",
      style: (_feature: any, _tileCoords: any) => {
        if (isFeatureSelected) {
          return {
            strokeStyle: "orange",
            fillStyle: "orange",
            lineWidth: 1,
          };
        }
        return {
          strokeStyle: "red",
          fillStyle: "red",
          lineWidth: 1,
        };
      },
      onSelectFeature: (_feature: any) => {
        setIsFeatureSelected(v => !v);
      },
    };

    const imageryProvider = new MVTImageryProvider(imageryOption);
    if (viewer) {
      const layers = viewer.scene.imageryLayers;
      const currentLayer = layers.addImageryProvider(imageryProvider);
      currentLayer.alpha = 0.5;

      return () => {
        layers.remove(currentLayer);
      };
    }
  }, [viewer, isFeatureSelected]);

  return <div />;
};
