import { describe, expect, test } from "vitest";

import { getMvtBaseUrl, idFromGeometry, parseMetadata, parseTileJson } from "./Imagery";

describe("parseMetadata", () => {
  test("parses full metadata", () => {
    expect(parseMetadata(metadata)).toEqual({
      center: [138.1515732, 35.9939779, 0],
      layers: ["HighLevelUseDistrict"],
      maximumLevel: 15,
    });
  });
});

describe("parseTileJson", () => {
  test("parses full tilejson", () => {
    expect(parseTileJson(tilejson)).toEqual({
      center: [139.7, 35.68, 0],
      layers: ["buildings", "roads"],
      maximumLevel: 16,
    });
  });

  test("missing fields", () => {
    expect(parseTileJson({})).toEqual({});
    expect(parseTileJson({ maxzoom: 14 })).toEqual({ maximumLevel: 14 });
    expect(parseTileJson({ center: [140, 36] })).toEqual({ center: [140, 36, 0] });
    expect(parseTileJson({ vector_layers: [{ id: "layer1" }] })).toEqual({
      layers: ["layer1"],
    });
  });

  test("invalid fields", () => {
    expect(parseTileJson(null)).toBeUndefined();
    expect(parseTileJson(undefined)).toBeUndefined();
    expect(parseTileJson("string")).toBeUndefined();
    expect(parseTileJson({ center: "invalid" })).toEqual({});
    expect(parseTileJson({ center: [139.7] })).toEqual({});
    expect(parseTileJson({ vector_layers: "invalid" })).toEqual({});
    expect(parseTileJson({ vector_layers: [{ name: "no-id" }, null, { id: 123 }] })).toEqual({
      layers: [],
    });
  });
});

describe("getMvtBaseUrl", () => {
  test("tile template URL", () => {
    expect(getMvtBaseUrl("https://example.com/tiles/12/345/678.mvt")).toBe(
      "https://example.com/tiles",
    );
  });

  test(".zip URL", () => {
    expect(getMvtBaseUrl("https://example.com/tiles.zip")).toBe("https://example.com/tiles");
  });

  test(".7z URL", () => {
    expect(getMvtBaseUrl("https://example.com/tiles.7z")).toBe("https://example.com/tiles");
  });

  test("filename URL", () => {
    expect(getMvtBaseUrl("https://example.com/tiles/metadata.json")).toBe(
      "https://example.com/tiles",
    );
  });

  test("large z/x/y values", () => {
    expect(getMvtBaseUrl("https://example.com/15/29134/12950.pbf")).toBe("https://example.com");
  });
});

describe("idFromGeometry", () => {
  // idFromGeometry expects Point[][] where Point has { x, y } properties.
  // We use plain objects cast to the expected type since only x/y are accessed.
  const makeGeometry = (coords: [number, number][]) =>
    [coords.map(([x, y]) => ({ x, y }))] as unknown as Parameters<typeof idFromGeometry>[0];

  test("deterministic output", () => {
    const geom = makeGeometry([[10, 20]]);
    const tile = { x: 1, y: 2, level: 3 };
    expect(idFromGeometry(geom, tile)).toBe(idFromGeometry(geom, tile));
  });

  test("different coordinates produce different hashes", () => {
    const tile = { x: 1, y: 2, level: 3 };
    const a = idFromGeometry(makeGeometry([[10, 20]]), tile);
    const b = idFromGeometry(makeGeometry([[30, 40]]), tile);
    expect(a).not.toBe(b);
  });

  test("different tile produces different hash", () => {
    const geom = makeGeometry([[10, 20]]);
    const a = idFromGeometry(geom, { x: 1, y: 2, level: 3 });
    const b = idFromGeometry(geom, { x: 4, y: 5, level: 6 });
    expect(a).not.toBe(b);
  });

  test("multi-ring geometry", () => {
    const geom = [
      [
        { x: 1, y: 2 },
        { x: 3, y: 4 },
      ],
      [
        { x: 5, y: 6 },
        { x: 7, y: 8 },
      ],
    ] as unknown as Parameters<typeof idFromGeometry>[0];
    const tile = { x: 0, y: 0, level: 0 };
    const result = idFromGeometry(geom, tile);
    expect(result).toMatch(/^[0-9a-f]{32}$/);
  });

  test("result is 32-char hex string", () => {
    const geom = makeGeometry([[100, 200]]);
    const tile = { x: 10, y: 20, level: 5 };
    expect(idFromGeometry(geom, tile)).toMatch(/^[0-9a-f]{32}$/);
  });
});

const tilejson = {
  tilejson: "3.0.0",
  name: "sample",
  tiles: ["https://example.com/tiles/{z}/{x}/{y}.mvt"],
  minzoom: 10,
  maxzoom: 16,
  center: [139.7, 35.68, 14],
  bounds: [139.5, 35.5, 140.0, 36.0],
  vector_layers: [
    { id: "buildings", fields: { name: "String" } },
    { id: "roads", fields: { type: "String" } },
  ],
};

const metadata = {
  name: "HighLevelUseDistrict",
  description: "",
  version: 2,
  minzoom: 8,
  maxzoom: 15,
  center: "138.1515732,35.9939779,0",
  bounds: "138.1506734,35.9933392,138.1524729,35.9946166",
  type: "overlay",
  format: "pbf",
  json: '{\n  "vector_layers":[\n    {\n      "id":"HighLevelUseDistrict",\n      "description":"",\n      "minzoom":8,\n      "maxzoom":15,\n      "fields":{\n        "gml_id":"String",\n        "feature_type":"String",\n        "feature_type_jp":"String",\n        "function_code":"Number",\n        "function":"String",\n        "attributes":"String"\n      }\n    }\n  ],\n  "tilestats":{\n    "layerCount":1,\n    "layers":[\n      {\n        "layer":"HighLevelUseDistrict",\n        "count":1,\n        "geometry":"Polygon",\n        "attributeCount":6,\n        "attributes":[\n          {\n            "attribute":"gml_id",\n            "count":1,\n            "type":"string",\n            "values":[\n              "urf_e7b5048b-1fbd-4a2d-b0c1-449478094c28"\n            ]\n          },\n          {\n            "attribute":"feature_type",\n            "count":1,\n            "type":"string",\n            "values":[\n              "HighLevelUseDistrict"\n            ]\n          },\n          {\n            "attribute":"feature_type_jp",\n            "count":1,\n            "type":"string",\n            "values":[\n              "高度利用地区"\n            ]\n          },\n          {\n            "attribute":"function_code",\n            "count":1,\n            "type":"number",\n            "values":[\n              19\n            ],\n            "min":19,\n            "max":19\n          },\n          {\n            "attribute":"function",\n            "count":1,\n            "type":"string",\n            "values":[\n              "高度利用地区"\n            ]\n          },\n          {\n            "attribute":"attributes",\n            "count":1,\n            "type":"string",\n            "values":[\n            ]\n          }\n        ]\n      }\n    ]\n  }\n}',
};
