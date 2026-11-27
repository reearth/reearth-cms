import type { Geometry, Position } from "geojson";
import { describe, expect, test } from "vitest";

import { Test } from "@reearth-cms/test/utils";
import type { VertexRef } from "@reearth-cms/utils/geoUtils";
import { GeoUtils } from "@reearth-cms/utils/geoUtils";

import { formatLatLng, kindIcon, kindName, shapeDetail, summarize, vertexLabel } from "./labels";

describe("kindIcon", () => {
  test.each([
    ["Point", "mapPin"],
    ["MultiPoint", "mapPin"],
    ["LineString", "lineString"],
    ["MultiLineString", "lineString"],
    ["Polygon", "polygon"],
    ["MultiPolygon", "polygon"],
    ["GeometryCollection", "block"],
  ])("%s → %s", (kind, icon) => {
    expect(kindIcon(kind)).toBe(icon);
  });
});

describe("kindName", () => {
  // Plain words for the shapes the map draws; GeoJSON names for the rest.
  test.each([
    ["Point", "Point"],
    ["LineString", "Line"],
    ["Polygon", "Polygon"],
    ["MultiPolygon", "MultiPolygon"],
    ["GeometryCollection", "GeometryCollection"],
  ])("%s → %s", (kind, name) => {
    expect(kindName(kind)).toBe(name);
  });
});

describe("formatLatLng", () => {
  test.each<[string, Position, number | undefined, string]>([
    [
      "latitude first, to 5 decimals by default",
      [139.6917, 35.6895],
      undefined,
      "35.68950, 139.69170",
    ],
    ["to the given number of decimals", [139.6917, 35.6895], 2, "35.69, 139.69"],
  ])("reads %s", (_, position, digits, text) => {
    expect(formatLatLng(position, digits)).toBe(text);
  });
});

describe("shapeDetail", () => {
  test.each<[string, Geometry, string]>([
    ["a point shows where it is", Test.GEO_JSON_POINT, "35.68950, 139.69170"],
    ["a line counts its vertices", Test.GEO_JSON_LINE_STRING, "4 vertices"],
    ["a polygon leaves out its ring's closing position", Test.GEO_JSON_POLYGON, "4 vertices"],
    ["a polygon with a hole counts both rings", Test.GEO_JSON_POLYGON_WITH_HOLE, "8 vertices"],
    ["a MultiPolygon counts its parts", Test.GEO_JSON_MULTI_POLYGON, "2 parts"],
    ["a GeometryCollection counts its parts", Test.GEO_JSON_GEO_COLLECTION, "2 parts"],
  ])("%s", (_, geometry, detail) => {
    expect(shapeDetail(geometry)).toBe(detail);
  });
});

describe("vertexLabel", () => {
  // The ring is named only for polygons with holes.
  test.each<[string, VertexRef, string]>([
    ["a vertex without a ring", { index: 2, position: [0, 0], number: 3 }, "Vertex 3"],
    ["a vertex in a ring", { index: 4, position: [0, 0], number: 1, ring: 2 }, "Ring 2 · Vertex 1"],
  ])("%s", (_, vertex, label) => {
    expect(vertexLabel(vertex)).toBe(label);
  });
});

describe("summarize", () => {
  test.each<[string, Geometry[], string]>([
    ["an empty value", [], "No geometry"],
    ["one geometry shows its kind and detail", [Test.GEO_JSON_LINE_STRING], "Line · 4 vertices"],
    [
      "several geometries are counted by kind",
      [Test.GEO_JSON_POINT, Test.GEO_JSON_LINE_STRING, Test.GEO_JSON_POINT],
      "3 geometries · 2 points, 1 line",
    ],
    [
      "kinds without a plain name keep their GeoJSON name",
      [Test.GEO_JSON_POINT, Test.GEO_JSON_MULTI_POINT],
      "2 geometries · 1 point, 1 MultiPoint",
    ],
  ])("%s", (_, geometries, summary) => {
    expect(summarize(GeoUtils.toCollection(geometries))).toBe(summary);
  });
});
