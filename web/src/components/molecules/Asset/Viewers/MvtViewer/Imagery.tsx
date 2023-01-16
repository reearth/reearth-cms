import { VectorTileFeature } from "@mapbox/vector-tile";
import { ImageryLayer, ImageryLayerCollection, Viewer, Math } from "cesium";
import { MVTImageryProvider, ImageryProviderOption } from "cesium-mvt-imagery-provider";
import { useEffect, useState } from "react";
import { useCesium } from "resium";

type Props = {
  url: string;
};

// TODO: these two types should be imported from cesium-mvt-imagery-provider library instead
type URLTemplate = `http${"s" | ""}://${string}/{z}/{x}/{y}${string}`;
type TileCoordinates = {
  x: number;
  y: number;
  level: number;
};

export const Imagery: React.FC<Props> = ({ url }) => {
  const { viewer }: { viewer: Viewer } = useCesium();
  const [isFeatureSelected, setIsFeatureSelected] = useState<boolean>(false);
  const [urlTemplate, setUrlTemplate] = useState<URLTemplate>(url as URLTemplate);
  const [layerName, setLayerName] = useState<string>("");

  useEffect(() => {
    const initOptions = async (url: string) => {
      const templateRegex = /\/\d{1,5}\/\d{1,5}\/\d{1,5}\.\w+$/;
      const nameRegex = /\.\w+$/;
      const base = url.match(templateRegex)
        ? url.replace(templateRegex, "")
        : url.replace(nameRegex, "");

      setUrlTemplate(`${base}/{z}/{x}/{y}.mvt` as URLTemplate);
      try {
        const res = await fetch(`${base}/metadata.json`);
        const data = await res.json();
        setLayerName(data.name);
      } catch (error) {
        console.error(error);
      }
    };
    initOptions(url);

    const imageryOption: ImageryProviderOption = {
      urlTemplate: urlTemplate,
      layerName: layerName,
      style: (_feature: VectorTileFeature, _tileCoords: TileCoordinates) => {
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
      onSelectFeature: (_feature: VectorTileFeature, _tileCoords: TileCoordinates) => {
        setIsFeatureSelected(v => !v);
      },
    };

    const imageryProvider = new MVTImageryProvider(imageryOption);
    if (viewer) {
      const layers: ImageryLayerCollection = viewer.scene.imageryLayers;
      const currentLayer: ImageryLayer = layers.addImageryProvider(imageryProvider);
      currentLayer.alpha = 0.5;

      // Move the camera to Japan as a default location
      const entity = viewer.entities.getById("default-location");
      if (entity) {
        viewer.zoomTo(entity, {
          heading: Math.toRadians(90.0),
          pitch: Math.toRadians(-90.0),
          range: 20000000,
        });
      }

      return () => {
        layers.remove(currentLayer);
      };
    }
  }, [viewer, isFeatureSelected, url, urlTemplate, layerName]);

  return <div />;
};
