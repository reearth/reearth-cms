import type { Type as OlGeometryType } from "ol/geom/Geometry";
import type Draw from "ol/interaction/Draw";
import { unByKey } from "ol/Observable";

import { GeometryKind } from "@reearth-cms/utils/geoUtils";

export enum MapTool {
  SELECT = "SELECT",
  POINT = "POINT",
  LINE = "LINE",
  POLYGON = "POLYGON",
}

export const TOOL_KIND: Record<Exclude<MapTool, MapTool.SELECT>, GeometryKind> = {
  [MapTool.POINT]: GeometryKind.POINT,
  [MapTool.LINE]: GeometryKind.LINE_STRING,
  [MapTool.POLYGON]: GeometryKind.POLYGON,
};

const DRAW_TYPE: Record<Exclude<MapTool, MapTool.SELECT>, OlGeometryType> = {
  [MapTool.POINT]: "Point",
  [MapTool.LINE]: "LineString",
  [MapTool.POLYGON]: "Polygon",
};

export const drawType = (tool: MapTool): OlGeometryType | null =>
  tool === MapTool.SELECT ? null : DRAW_TYPE[tool];

/** Drops the shape being drawn, if any. OpenLayers fires `drawabort` only when one existed. */
export const abortSketch = (draw: Draw | null): boolean => {
  if (!draw) return false;
  let aborted = false;
  const key = draw.once("drawabort", () => {
    aborted = true;
  });
  draw.abortDrawing();
  unByKey(key);
  return aborted;
};
