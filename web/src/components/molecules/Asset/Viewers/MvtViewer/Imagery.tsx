import styled from "@emotion/styled";
import { VectorTileFeature } from "@mapbox/vector-tile";
import { Cartesian3, Math, BoundingSphere, HeadingPitchRange } from "cesium";
import { CesiumMVTImageryProvider } from "cesium-mvt-imagery-provider";
import { md5 } from "js-md5";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useCesium } from "resium";

import AutoComplete from "@reearth-cms/components/atoms/AutoComplete";

const defaultCameraPosition: [number, number, number] = [139.767052, 35.681167, 100];
const defaultOffset = new HeadingPitchRange(0, Math.toRadians(-90.0), 3000000);
const normalOffset = new HeadingPitchRange(0, Math.toRadians(-90.0), 200000);

type Props = {
  url: string;
  handleProperties: (prop: Property) => void;
};

export type Property = Record<string, unknown> & {
  attributes?: unknown;
};

type URLTemplate = `http${"s" | ""}://${string}/{z}/{x}/{y}${string}`;
type TileCoordinates = {
  x: number;
  y: number;
  level: number;
};

export const Imagery: React.FC<Props> = ({ url, handleProperties }) => {
  const { viewer } = useCesium();
  const [selectedFeature, setSelectedFeature] = useState<string>();
  const [urlTemplate, setUrlTemplate] = useState<URLTemplate>(url as URLTemplate);
  const [currentLayer, setCurrentLayer] = useState("");
  const [layers, setLayers] = useState<string[]>([]);
  const [maximumLevel, setMaximumLevel] = useState<number>();

  const zoomTo = useCallback(
    (coords: [number, number, number], useDefaultRange = false) => {
      if (!viewer) return;

      viewer.camera.flyToBoundingSphere(new BoundingSphere(Cartesian3.fromDegrees(...coords)), {
        duration: 0,
        offset: useDefaultRange ? defaultOffset : normalOffset,
      });
    },
    [viewer],
  );

  const loadData = useCallback(
    async (url: string) => {
      try {
        const data = await fetchLayers(url);
        if (!data) return;

        setUrlTemplate(`${data.base}/{z}/{x}/{y}.mvt` as URLTemplate);
        setLayers(data.layers ?? []);
        setCurrentLayer(data.layers?.[0] || "");
        setMaximumLevel(data.maximumLevel);
        zoomTo(data.center || defaultCameraPosition, !data.center);
      } catch (error) {
        console.error("Failed to load MVT data:", error);
      }
    },
    [zoomTo],
  );

  const style = useCallback(
    (f: VectorTileFeature, tile: TileCoordinates) => {
      const fid = idFromGeometry(f.loadGeometry(), tile);
      const isPoint = VectorTileFeature.types[f.type] === "Point";
      return {
        strokeStyle: "white",
        fillStyle: selectedFeature === fid ? "orange" : "red",
        lineWidth: isPoint ? 5 : 1,
      };
    },
    [selectedFeature],
  );

  const onSelectFeature = useCallback(
    (feature: VectorTileFeature, tileCoords: TileCoordinates) => {
      const id = idFromGeometry(feature.loadGeometry(), tileCoords);
      setSelectedFeature(id);
      handleProperties(feature.properties);
    },
    [handleProperties],
  );

  useEffect(() => {
    loadData(url);
  }, [loadData, url]);

  useEffect(() => {
    if (!viewer) return;

    const imageryProvider = new CesiumMVTImageryProvider({
      urlTemplate,
      layerName: currentLayer,
      style,
      onSelectFeature,
      maximumLevel,
    });

    const imageryLayer = viewer.scene.imageryLayers.addImageryProvider(imageryProvider);
    imageryLayer.alpha = 0.5;

    return () => {
      viewer.scene.imageryLayers.remove(imageryLayer);
    };
  }, [currentLayer, maximumLevel, onSelectFeature, style, urlTemplate, viewer]);

  const handleLayerChange = useCallback((value: unknown) => {
    if (typeof value === "string") {
      setCurrentLayer(value);
    }
  }, []);

  const layerOptions = useMemo(
    () => layers.map(layer => ({ label: layer, value: layer })),
    [layers],
  );

  return (
    <StyledInput
      placeholder="Layer name"
      value={currentLayer}
      options={layerOptions}
      onChange={handleLayerChange}
      onSelect={handleLayerChange}
    />
  );
};

const StyledInput = styled(AutoComplete)`
  position: absolute;
  top: 10px;
  left: 10px;
  width: 147px;
`;

const getMvtBaseUrl = (url: string): string => {
  const templateRegex = /\/\d{1,5}\/\d{1,5}\/\d{1,5}\.\w+$/;
  const compressedExtRegex = /\.(zip|7z)$/;
  const nameRegex = /\/\w+\.\w+$/;

  if (templateRegex.test(url)) {
    return url.replace(templateRegex, "");
  }
  if (compressedExtRegex.test(url)) {
    return url.replace(compressedExtRegex, "");
  }
  return url.replace(nameRegex, "");
};

const fetchLayers = async (url: string) => {
  try {
    const base = getMvtBaseUrl(url);
    const response = await fetch(`${base}/metadata.json`);
    if (!response.ok) return undefined;
    return { ...parseMetadata(await response.json()), base };
  } catch (error) {
    console.error("Failed to fetch layers:", error);
    return undefined;
  }
};

const idFromGeometry = (
  geometry: ReturnType<VectorTileFeature["loadGeometry"]>,
  tile: TileCoordinates,
): string => {
  const coords = geometry.flatMap(point => point.map(({ x, y }) => [x, y]));
  const hash = md5.create();
  hash.update([tile.x, tile.y, tile.level, ...coords].join(":"));
  return hash.hex();
};

type Metadata = {
  layers?: string[];
  center?: [number, number, number];
  maximumLevel?: number;
};

export function parseMetadata(json: unknown): Metadata {
  if (!json || typeof json !== "object") return {};

  const result: Metadata = {};
  const jsonObj = json as Record<string, unknown>;

  if (typeof jsonObj.maxzoom === "number") {
    result.maximumLevel = jsonObj.maxzoom;
  }

  if (typeof jsonObj.center === "string") {
    const coords = jsonObj.center.split(",").map(Number);
    if (coords.length >= 2 && coords.every(coord => !isNaN(coord))) {
      result.center = [coords[0], coords[1], coords[2] || 0];
    }
  }

  if (typeof jsonObj.json === "string") {
    try {
      const parsedJson = JSON.parse(jsonObj.json);
      if (parsedJson?.vector_layers?.length) {
        result.layers = parsedJson.vector_layers
          .map((layer: { id?: string }) => layer.id)
          .filter((id: string | undefined): id is string => !!id);
      }
    } catch (error) {
      console.error("Failed to parse metadata JSON:", error);
    }
  }

  return result;
}
