import type { Type as OlGeometryType } from "ol/geom/Geometry";
import type Draw from "ol/interaction/Draw";
import { unByKey } from "ol/Observable";

import { GeometryKind } from "../core/types";

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

export const drawType = (tool: MapTool): OlGeometryType | null =>
  tool === MapTool.SELECT ? null : (TOOL_KIND[tool] as OlGeometryType);

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
