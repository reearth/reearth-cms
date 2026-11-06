import type { Type as OlGeometryType } from "ol/geom/Geometry";

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
