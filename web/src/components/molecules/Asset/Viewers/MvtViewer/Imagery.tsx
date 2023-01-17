import { VectorTileFeature } from "@mapbox/vector-tile";
import { ImageryLayer, ImageryLayerCollection, Math } from "cesium";
import { MVTImageryProvider } from "cesium-mvt-imagery-provider";
import { useCallback, useEffect, useState } from "react";
import { useCesium } from "resium";

type Props = {
  url: string;
  handleProperties: (prop: Property) => void;
  selectFeature: (selected: boolean) => void;
};

export type Property = { [k: string]: string | number | boolean };

// TODO: these two types should be imported from cesium-mvt-imagery-provider library instead
type URLTemplate = `http${"s" | ""}://${string}/{z}/{x}/{y}${string}`;
type TileCoordinates = {
  x: number;
  y: number;
  level: number;
};

export const Imagery: React.FC<Props> = ({ url, handleProperties, selectFeature }) => {
  const { viewer } = useCesium();
  const [isFeatureSelected, setIsFeatureSelected] = useState<boolean>(false);
  const [urlTemplate, setUrlTemplate] = useState<URLTemplate>(url as URLTemplate);
  const [layerName, setLayerName] = useState<string>("");

  useEffect(() => {
    // Move the camera to Japan as a default location
    const entity = viewer.entities.getById("default-location");
    if (entity) {
      viewer.zoomTo(entity, {
        heading: Math.toRadians(90.0),
        pitch: Math.toRadians(-90.0),
        range: 3000000,
      });
    }
  }, [viewer]);

  useEffect(() => {
    // init url template and layer name
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
  }, [url]);

  const style = useCallback(
    (_feature: VectorTileFeature, _tileCoords: TileCoordinates) => {
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
    [isFeatureSelected],
  );

  const onSelectFeature = useCallback(
    (feature: VectorTileFeature, _tileCoords: TileCoordinates) => {
      handleProperties(feature.properties);
      selectFeature(true);
      setIsFeatureSelected(v => !v);
    },
    [handleProperties, selectFeature],
  );

  useEffect(() => {
    const imageryProvider = new MVTImageryProvider({
      urlTemplate,
      layerName,
      style,
      onSelectFeature,
    });

    if (viewer) {
      const layers: ImageryLayerCollection = viewer.scene.imageryLayers;
      const currentLayer: ImageryLayer = layers.addImageryProvider(imageryProvider);
      currentLayer.alpha = 0.5;

      return () => {
        layers.remove(currentLayer);
      };
    }
  }, [
    viewer,
    isFeatureSelected,
    url,
    urlTemplate,
    layerName,
    handleProperties,
    selectFeature,
    onSelectFeature,
    style,
  ]);

  return <div />;
};
