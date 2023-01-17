import { VectorTileFeature } from "@mapbox/vector-tile";
import { Cartesian3, ImageryLayer, ImageryLayerCollection, Math } from "cesium";
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

  const setBaseUrl = (url: string) => {
    const templateRegex = /\/\d{1,5}\/\d{1,5}\/\d{1,5}\.\w+$/;
    const nameRegex = /\.\w+$/;
    return url.match(templateRegex) ? url.replace(templateRegex, "") : url.replace(nameRegex, "");
  };

  useEffect(() => {
    const initViewer = async (url: string) => {
      const base = setBaseUrl(url);
      setUrlTemplate(`${base}/{z}/{x}/{y}.mvt` as URLTemplate);
      let position = Cartesian3.fromDegrees(139.767052, 35.681167, 100); // initial position
      let range = 3000000; // initial range

      try {
        const res = await fetch(`${base}/metadata.json`);
        const data = await res?.json();
        if (data?.name) setLayerName(data.name);
        if (data?.center) {
          const [x, y, z]: number[] = data.center.split(",").map((s: string) => Number(s));
          if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
            position = Cartesian3.fromDegrees(x, y, z);
            range = 200000;
          }
        }
      } catch (error) {
        console.error(error);
      }

      viewer.camera.lookAt(position, {
        heading: Math.toRadians(90.0),
        pitch: Math.toRadians(-90.0),
        range: range,
      });
    };
    initViewer(url);
  }, [url, viewer, viewer.camera]);

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
