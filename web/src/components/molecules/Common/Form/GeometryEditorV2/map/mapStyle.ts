import type { FeatureLike } from "ol/Feature";
import Geometry from "ol/geom/Geometry";
import MultiPoint from "ol/geom/MultiPoint";
import Point from "ol/geom/Point";
import CircleStyle from "ol/style/Circle";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";

import { GeoUtils, GeometryKind } from "@reearth-cms/utils/geoUtils";
import { AntdColor } from "@reearth-cms/utils/style";

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

/** A `#rrggbb` colour with an alpha channel. */
export const alpha = (hex: string, a: number) =>
  `${hex}${Math.round(a * 255)
    .toString(16)
    .padStart(2, "0")}`;

/** Points sit above lines, lines above areas, so small shapes stay clickable. */
const zIndexOf = (geometry: Geometry | undefined) => {
  const type = geometry?.getType();
  if (type === GeometryKind.POINT || type === GeometryKind.MULTI_POINT) return 3;
  if (type === GeometryKind.LINE_STRING || type === GeometryKind.MULTI_LINE_STRING) return 2;
  return 1;
};

export function featureStyle(
  feature: FeatureLike,
  selectedId: string | null,
  selectedVertex: number | null = null,
): Style[] {
  const olGeometry = feature.getGeometry();
  // A RenderFeature only appears with vector tiles, which this map does not use.
  const geometry = olGeometry instanceof Geometry ? olGeometry : undefined;
  const selected = selectedId !== null && String(feature.getId()) === selectedId;
  // Multi* and GeometryCollection are display-only.
  const locked = !GeoUtils.isEditableType(geometry?.getType());
  const color = locked
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
        color,
        width: selected ? 3 : 2,
        lineDash: locked ? ShapeStyle.READ_ONLY_DASH : undefined,
      }),
      fill: new Fill({ color: alpha(color, selected ? 0.25 : 0.12) }),
      // A read-only point is hollow: a dash pattern doesn't show on a small circle.
      image: new CircleStyle({
        radius: selected ? 8 : 6,
        fill: new Fill({ color: locked ? ShapeStyle.WHITE : color }),
        stroke: new Stroke({ color: locked ? color : ShapeStyle.WHITE, width: 2 }),
      }),
    }),
  ];

  // Editing handles only on the selected shape: white dots on vertices, small dots
  // halfway along each edge (see handles.ts).
  if (selected && !locked && geometry && geometry.getType() !== GeometryKind.POINT) {
    styles.push(
      new Style({
        zIndex: zIndex + 1,
        image: new CircleStyle({
          radius: 3.5,
          fill: new Fill({ color: alpha(ShapeStyle.WHITE, 0.9) }),
          stroke: new Stroke({ color: alpha(color, 0.8), width: 1.5 }),
        }),
        geometry: () => new MultiPoint(midpointHandles(geometry)),
      }),
      new Style({
        zIndex: zIndex + 2,
        image: new CircleStyle({
          radius: 5,
          fill: new Fill({ color: ShapeStyle.WHITE }),
          stroke: new Stroke({ color: color, width: 2 }),
        }),
        geometry: () => new MultiPoint(vertexHandles(geometry)),
      }),
    );
    const vertex = selectedVertex === null ? undefined : vertexHandles(geometry)[selectedVertex];
    if (vertex) {
      styles.push(
        new Style({
          zIndex: zIndex + 3,
          image: new CircleStyle({
            radius: 7,
            fill: new Fill({ color }),
            stroke: new Stroke({ color: ShapeStyle.WHITE, width: 2 }),
          }),
          geometry: () => new Point(vertex),
        }),
      );
    }
  }
  return styles;
}

const RIPPLE_START_RADIUS = 7;
const RIPPLE_GROWTH = 18;

/** One frame of the ring that grows and fades around a newly selected point or vertex. */
export function rippleStyle(progress: number): Style {
  return new Style({
    image: new CircleStyle({
      radius: RIPPLE_START_RADIUS + progress * RIPPLE_GROWTH,
      stroke: new Stroke({
        color: alpha(ShapeStyle.EDITABLE_SELECTED, 1 - progress),
        width: 1 + (1 - progress) * 2,
      }),
    }),
  });
}

/**
 * "You are here", in the blue that map apps use for it. It is told apart from the value's
 * points by size, a thick white ring and a wide halo, which no shape has.
 */
export const myLocationStyle = [
  new Style({
    zIndex: 100,
    image: new CircleStyle({
      radius: 28,
      fill: new Fill({ color: alpha(ShapeStyle.EDITABLE, 0.15) }),
    }),
  }),
  // OpenLayers has no shadow, so a faint dark disc just outside the ring stands in for one.
  new Style({
    zIndex: 101,
    image: new CircleStyle({
      radius: 13,
      fill: new Fill({ color: alpha(AntdColor.GREY.GREY_8, 0.2) }),
    }),
  }),
  new Style({
    zIndex: 102,
    image: new CircleStyle({
      radius: 10,
      fill: new Fill({ color: ShapeStyle.EDITABLE }),
      stroke: new Stroke({ color: ShapeStyle.WHITE, width: 3 }),
    }),
  }),
];

/**
 * A search result being previewed: not part of the value yet. A solid orange dot stands out
 * on both base maps and away from the shapes' blue; the dashed ring says "not saved".
 */
export const searchPinStyle = [
  new Style({
    zIndex: 100,
    image: new CircleStyle({
      radius: 14,
      stroke: new Stroke({ color: AntdColor.ORANGE.ORANGE_5, width: 2, lineDash: [4, 3] }),
    }),
  }),
  new Style({
    zIndex: 101,
    image: new CircleStyle({
      radius: 7,
      fill: new Fill({ color: AntdColor.ORANGE.ORANGE_5 }),
      stroke: new Stroke({ color: ShapeStyle.WHITE, width: 2 }),
    }),
  }),
];
