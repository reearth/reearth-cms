import type { FeatureLike } from "ol/Feature";
import type Geometry from "ol/geom/Geometry";
import GeometryCollection from "ol/geom/GeometryCollection";
import MultiPoint from "ol/geom/MultiPoint";
import SimpleGeometry from "ol/geom/SimpleGeometry";
import CircleStyle from "ol/style/Circle";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";

import { AntdColor } from "@reearth-cms/utils/style";

import { EDITABLE_KINDS } from "../core/types";
import type { GeometryKind } from "../core/types";

const BASE = AntdColor.BLUE.BLUE_6;
const SELECTED = AntdColor.VOLCANO.VOLCANO_5;
const WHITE = "#ffffff";

const alpha = (hex: string, a: number) =>
  `${hex}${Math.round(a * 255)
    .toString(16)
    .padStart(2, "0")}`;

/** Points sit above lines, lines above areas, so small shapes stay clickable. */
const zIndexOf = (geometry: Geometry | undefined) => {
  const type = geometry?.getType();
  if (type === "Point" || type === "MultiPoint") return 3;
  if (type === "LineString" || type === "MultiLineString") return 2;
  return 1;
};

const flatten = (value: unknown): number[][] => {
  if (!Array.isArray(value) || value.length === 0) return [];
  if (typeof value[0] === "number") return [value as number[]];
  return (value as unknown[]).flatMap(flatten);
};

const vertices = (geometry: Geometry): number[][] => {
  if (geometry instanceof GeometryCollection) return geometry.getGeometries().flatMap(vertices);
  if (geometry instanceof SimpleGeometry) return flatten(geometry.getCoordinates());
  return [];
};

export function featureStyle(feature: FeatureLike, selectedId: string | null): Style[] {
  const geometry = feature.getGeometry() as Geometry | undefined;
  const selected = selectedId !== null && String(feature.getId()) === selectedId;
  // Multi* and GeometryCollection are display-only: drawn dashed so they read as locked.
  const locked = !EDITABLE_KINDS.includes(geometry?.getType() as GeometryKind);
  const colour = selected ? SELECTED : BASE;
  const zIndex = zIndexOf(geometry) + (selected ? 10 : 0);

  const styles = [
    new Style({
      zIndex,
      stroke: new Stroke({
        color: colour,
        width: selected ? 3 : 2,
        lineDash: locked ? [6, 4] : undefined,
      }),
      fill: new Fill({ color: alpha(colour, selected ? 0.18 : 0.12) }),
      image: new CircleStyle({
        radius: selected ? 8 : 6,
        fill: new Fill({ color: locked ? WHITE : colour }),
        stroke: new Stroke({ color: locked ? colour : WHITE, width: 2 }),
      }),
    }),
  ];

  // Vertex handles only on the selected, editable shape — the ones you can drag.
  if (selected && !locked && geometry && geometry.getType() !== "Point") {
    styles.push(
      new Style({
        zIndex: zIndex + 1,
        image: new CircleStyle({
          radius: 4,
          fill: new Fill({ color: WHITE }),
          stroke: new Stroke({ color: colour, width: 2 }),
        }),
        geometry: () => new MultiPoint(vertices(geometry)),
      }),
    );
  }
  return styles;
}

/** A search result being previewed: not part of the value yet. */
export const searchPinStyle = new Style({
  zIndex: 100,
  image: new CircleStyle({
    radius: 9,
    fill: new Fill({ color: alpha(AntdColor.GOLD.GOLD_6, 0.35) }),
    stroke: new Stroke({ color: AntdColor.GOLD.GOLD_7, width: 2, lineDash: [3, 3] }),
  }),
});
