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

  const fetchMvtMetaData = useCallback(async (url: string) => {
    const templateRegex = /\/\d{1,5}\/\d{1,5}\/\d{1,5}\.\w+$/;
    const nameRegex = /\.\w+$/;
    const base = url.match(templateRegex)
      ? url.replace(templateRegex, "")
      : url.replace(nameRegex, "");
    setUrlTemplate(`${base}/{z}/{x}/{y}.mvt` as URLTemplate);
    const res = await fetch(`${base}/metadata.json`);
    return res.ok ? await res?.json() : undefined;
  }, []);

  const setCameraPosition = useCallback(
    (position: string) => {
      const regex =
        /[-]?[0-9]+[,.]?[0-9]*([/][0-9]+[,.]?[0-9]*)*,[-]?[0-9]+[,.]?[0-9]*([/][0-9]+[,.]?[0-9]*)*,[-]?[0-9]+[,.]?[0-9]*([/][0-9]+[,.]?[0-9]*)*/;
      if (position?.match(regex)) {
        const [x, y, z]: number[] = position.split(",").map((s: string) => Number(s));
        viewer.camera.lookAt(Cartesian3.fromDegrees(x, y, z), {
          heading: Math.toRadians(90.0),
          pitch: Math.toRadians(-90.0),
          range: 200000,
        });
      } else {
        // default position
        viewer.camera.lookAt(Cartesian3.fromDegrees(139.767052, 35.681167, 100), {
          heading: Math.toRadians(90.0),
          pitch: Math.toRadians(-90.0),
          range: 3000000,
        });
      }
    },
    [viewer.camera],
  );

  useEffect(() => {
    const initViewer = async (url: string) => {
      try {
        const data = await fetchMvtMetaData(url);
        if (data?.name) setLayerName(data.name);
        setCameraPosition(data?.center);
      } catch (error) {
        console.error(error);
      }
    };
    initViewer(url);
  }, [fetchMvtMetaData, setCameraPosition, url, viewer, viewer.camera]);

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
