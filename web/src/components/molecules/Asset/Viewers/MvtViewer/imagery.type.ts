import { VectorTile, VectorTileFeature } from "@mapbox/vector-tile";
import { ImageryLayerFeatureInfo } from "cesium";

type Style = {
  fillStyle?: string;
  strokeStyle?: string;
  lineWidth?: number;
  lineJoin?: CanvasLineJoin;
};

export type URLTemplate = `http${"s" | ""}://${string}/{z}/{x}/{y}${string}`;

export type ImageryProviderOption = {
  urlTemplate: URLTemplate;
  layerName: string;
  minimumLevel?: number;
  maximumLevel?: number;
  maximumNativeZoom?: number;
  credit?: string;
  style?: (feature: VectorTileFeature) => Style;
  onSelectFeature?: (feature: VectorTileFeature) => ImageryLayerFeatureInfo | void;
  parseTile?: (url?: string) => Promise<VectorTile | undefined>;
};
