import styled from "@emotion/styled";
import { VectorTileFeature } from "@mapbox/vector-tile";
import {
  Cartesian3,
  Math,
  BoundingSphere,
  HeadingPitchRange,
  ImageryLayerCollection,
  ImageryLayer,
  Viewer as CesiumViewer,
} from "cesium";
import { CesiumMVTImageryProvider } from "cesium-mvt-imagery-provider";
import { md5 } from "js-md5";
import { useCallback, useEffect, useMemo, useState, RefObject } from "react";
import { CesiumComponentRef } from "resium";

import AutoComplete from "@reearth-cms/components/atoms/AutoComplete";
import { useAuthHeader } from "@reearth-cms/gql";

const defaultCameraPosition: [number, number, number] = [139.767052, 35.681167, 100];
const defaultOffset = new HeadingPitchRange(0, Math.toRadians(-90.0), 3000000);
const normalOffset = new HeadingPitchRange(0, Math.toRadians(-90.0), 200000);

type Props = {
  viewerRef: RefObject<CesiumComponentRef<CesiumViewer>>;
  isAssetPublic?: boolean;
  url: string;
  handleProperties: (prop: Property) => void;
};

export type Property = Record<string, unknown>;

type URLTemplate = `http${"s" | ""}://${string}/{z}/{x}/{y}${string}`;

type TileCoordinates = {
  x: number;
  y: number;
  level: number;
};

type Metadata = {
  layers?: string[];
  center?: [lng: number, lat: number, height: number];
  maximumLevel?: number;
};

export const Imagery: React.FC<Props> = ({ viewerRef, isAssetPublic, url, handleProperties }) => {
  const { getHeader } = useAuthHeader();
  const [selectedFeature, setSelectedFeature] = useState<string>();
  const [urlTemplate, setUrlTemplate] = useState<URLTemplate>(url as URLTemplate);
  const [currentLayer, setCurrentLayer] = useState("");
  const [layers, setLayers] = useState<string[]>([]);
  const [maximumLevel, setMaximumLevel] = useState<number>();

  const zoomTo = useCallback(
    async ([lng, lat, height]: [number, number, number], useDefaultRange?: boolean) => {
      const viewer = viewerRef.current?.cesiumElement;
      viewer?.camera.flyToBoundingSphere(
        new BoundingSphere(Cartesian3.fromDegrees(lng, lat, height)),
        {
          duration: 0,
          offset: useDefaultRange ? defaultOffset : normalOffset,
        },
      );
    },
    [viewerRef],
  );

  const style = useCallback(
    (f: VectorTileFeature, tile: TileCoordinates) => {
      const fid = idFromGeometry(f.loadGeometry(), tile);
      return {
        strokeStyle: "white",
        fillStyle: selectedFeature === fid ? "orange" : "red",
        lineWidth: VectorTileFeature.types[f.type] === "Point" ? 5 : 1,
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
    const loadData = async (url: string) => {
      try {
        const data = await fetchLayers(url);
        if (!data) return;
        setUrlTemplate(`${data.base}/{z}/{x}/{y}.mvt` as URLTemplate);
        setLayers(data.layers ?? []);
        setCurrentLayer(data.layers?.[0] || "");
        setMaximumLevel(data.maximumLevel);
        await zoomTo(data.center || defaultCameraPosition, !data.center);
      } catch (err) {
        console.error(err);
      }
    };
    loadData(url);
  }, [url, zoomTo]);

  useEffect(() => {
    let layers: ImageryLayerCollection;
    let imageryLayer: ImageryLayer;

    const addLayer = async () => {
      if (!viewerRef.current?.cesiumElement) return;
      layers = viewerRef.current.cesiumElement.scene.imageryLayers;
      const imageryProvider = new CesiumMVTImageryProvider({
        urlTemplate,
        headers: isAssetPublic ? {} : await getHeader(),
        layerName: currentLayer,
        style,
        onSelectFeature,
        maximumLevel,
      });
      imageryLayer = layers.addImageryProvider(imageryProvider);
      imageryLayer.alpha = 0.5;
    };
    addLayer();

    return () => {
      if (layers && imageryLayer) {
        layers.remove(imageryLayer);
      }
    };
  }, [
    currentLayer,
    getHeader,
    isAssetPublic,
    maximumLevel,
    onSelectFeature,
    style,
    urlTemplate,
    viewerRef,
  ]);

  const handleChange = useCallback((value: unknown) => {
    if (typeof value === "string") {
      setCurrentLayer(value);
    }
  }, []);

  const options = useMemo(() => layers.map(l => ({ label: l, value: l })), [layers]);

  return (
    <StyledInput
      placeholder="Layer name"
      value={currentLayer}
      options={options}
      onChange={handleChange}
      onSelect={handleChange}
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

  if (templateRegex.test(url)) return url.replace(templateRegex, "");
  if (compressedExtRegex.test(url)) return url.replace(compressedExtRegex, "");
  return url.replace(nameRegex, "");
};

const fetchLayers = async (url: string) => {
  try {
    const base = getMvtBaseUrl(url);
    const res = await fetch(`${base}/metadata.json`);
    if (!res.ok) throw new Error("Error fetching MVT layers");
    return { ...parseMetadata(await res.json()), base };
  } catch (err) {
    console.error(err);
    return undefined;
  }
};

const idFromGeometry = (
  geometry: ReturnType<VectorTileFeature["loadGeometry"]>,
  tile: TileCoordinates,
): string => {
  const coords = geometry.flatMap(i => i.map(({ x, y }) => [x, y]));
  const hash = md5.create();
  hash.update([tile.x, tile.y, tile.level, ...coords].join(":"));
  return hash.hex();
};

export function parseMetadata(json: unknown): Metadata | undefined {
  if (!json || typeof json !== "object") return;

  const result: Metadata = {};
  const jsonObj = json as Record<string, unknown>;

  if (typeof jsonObj.json === "string") {
    try {
      result.layers = JSON.parse(jsonObj.json)?.vector_layers?.map(
        (layer: { id: string }): string => layer.id,
      );
    } catch {
      // ignore
    }
  }

  if (typeof jsonObj.center === "string") {
    try {
      const coords = jsonObj.center.split(",", 3).map(parseFloat);
      result.center = [coords[0], coords[1], coords[2]];
    } catch {
      // ignore
    }
  }

  if (typeof jsonObj.maxzoom === "number") {
    result.maximumLevel = jsonObj.maxzoom;
  }

  return result;
}
