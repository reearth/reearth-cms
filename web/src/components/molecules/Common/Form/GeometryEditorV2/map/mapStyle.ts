import type { FeatureLike } from "ol/Feature";
import type Geometry from "ol/geom/Geometry";
import MultiPoint from "ol/geom/MultiPoint";
import CircleStyle from "ol/style/Circle";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";

import { AntdColor } from "@reearth-cms/utils/style";

import { EDITABLE_KINDS } from "../core/types";
import type { GeometryKind } from "../core/types";

import { midpointHandles, vertexHandles } from "./handles";

/**
 * Editable shapes are primary blue and solid; read-only shapes are gray and dashed, so the
 * difference never relies on hue alone.
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class ShapeStyle {
  public static readonly EDITABLE = AntdColor.BLUE.BLUE_5;
  public static readonly EDITABLE_SELECTED = AntdColor.BLUE.BLUE_7;
  public static readonly READ_ONLY = AntdColor.GREY.GREY_4;
  public static readonly READ_ONLY_SELECTED = AntdColor.GREY.GREY_6;
  /** Colour of a handle being grabbed. */
  public static readonly HANDLE = AntdColor.BLUE.BLUE_7;
  public static readonly WHITE = AntdColor.NEUTRAL.BG_WHITE;
  public static readonly READ_ONLY_DASH = [6, 4];
}

const WHITE = ShapeStyle.WHITE;

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

export function featureStyle(feature: FeatureLike, selectedId: string | null): Style[] {
  const geometry = feature.getGeometry() as Geometry | undefined;
  const selected = selectedId !== null && String(feature.getId()) === selectedId;
  // Multi* and GeometryCollection are display-only.
  const locked = !EDITABLE_KINDS.includes(geometry?.getType() as GeometryKind);
  const colour = locked
    ? selected
      ? ShapeStyle.READ_ONLY_SELECTED
      : ShapeStyle.READ_ONLY
    : selected
      ? ShapeStyle.EDITABLE_SELECTED
      : ShapeStyle.EDITABLE;
  const zIndex = zIndexOf(geometry) + (selected ? 10 : 0);

  const styles = [
    new Style({
      zIndex,
      stroke: new Stroke({
        color: colour,
        width: selected ? 3 : 2,
        lineDash: locked ? ShapeStyle.READ_ONLY_DASH : undefined,
      }),
      fill: new Fill({ color: alpha(colour, selected ? 0.25 : 0.12) }),
      // A read-only point is hollow: a dash pattern doesn't show on a small circle.
      image: new CircleStyle({
        radius: selected ? 8 : 6,
        fill: new Fill({ color: locked ? WHITE : colour }),
        stroke: new Stroke({ color: locked ? colour : WHITE, width: 2 }),
      }),
    }),
  ];

  // Editing handles only on the selected shape: white dots on vertices, small dots
  // halfway along each edge (see handles.ts).
  if (selected && !locked && geometry && geometry.getType() !== "Point") {
    styles.push(
      new Style({
        zIndex: zIndex + 1,
        image: new CircleStyle({
          radius: 3.5,
          fill: new Fill({ color: alpha(WHITE, 0.9) }),
          stroke: new Stroke({ color: alpha(colour, 0.8), width: 1.5 }),
        }),
        geometry: () => new MultiPoint(midpointHandles(geometry)),
      }),
      new Style({
        zIndex: zIndex + 2,
        image: new CircleStyle({
          radius: 5,
          fill: new Fill({ color: WHITE }),
          stroke: new Stroke({ color: colour, width: 2 }),
        }),
        geometry: () => new MultiPoint(vertexHandles(geometry)),
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
