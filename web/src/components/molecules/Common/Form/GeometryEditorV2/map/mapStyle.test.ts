import Feature from "ol/Feature";
import type Geometry from "ol/geom/Geometry";
import LineString from "ol/geom/LineString";
import MultiLineString from "ol/geom/MultiLineString";
import MultiPoint from "ol/geom/MultiPoint";
import Point from "ol/geom/Point";
import type CircleStyle from "ol/style/Circle";
import { describe, expect, test } from "vitest";

import { featureStyle, ShapeStyle } from "./mapStyle";

const featureOf = (geometry: Geometry) => {
  const feature = new Feature(geometry);
  feature.setId("s1");
  return feature;
};

const line = new LineString([
  [0, 0],
  [1, 1],
]);
const multiLine = new MultiLineString([
  [
    [0, 0],
    [1, 1],
  ],
]);

describe("featureStyle", () => {
  test("editable shapes are solid primary blue", () => {
    const stroke = featureStyle(featureOf(line), null)[0].getStroke();
    expect(stroke?.getColor()).toBe(ShapeStyle.EDITABLE);
    expect(stroke?.getLineDash()).toBeNull();
  });

  test("read-only shapes are dashed gray", () => {
    const stroke = featureStyle(featureOf(multiLine), null)[0].getStroke();
    expect(stroke?.getColor()).toBe(ShapeStyle.READ_ONLY);
    expect(stroke?.getLineDash()).toEqual(ShapeStyle.READ_ONLY_DASH);
  });

  test("selection darkens a shape without changing its editable look", () => {
    expect(featureStyle(featureOf(line), "s1")[0].getStroke()?.getColor()).toBe(
      ShapeStyle.EDITABLE_SELECTED,
    );
    const readOnly = featureStyle(featureOf(multiLine), "s1");
    expect(readOnly[0].getStroke()?.getColor()).toBe(ShapeStyle.READ_ONLY_SELECTED);
    // No editing handles on a read-only shape.
    expect(readOnly).toHaveLength(1);
  });

  test("a read-only point is hollow, an editable one is filled", () => {
    const fillOf = (geometry: Geometry) =>
      (featureStyle(featureOf(geometry), null)[0].getImage() as CircleStyle)
        .getFill()
        ?.getColor();
    expect(fillOf(new Point([0, 0]))).toBe(ShapeStyle.EDITABLE);
    expect(fillOf(new MultiPoint([[0, 0]]))).toBe(ShapeStyle.WHITE);
  });
});
