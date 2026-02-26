import { describe, expect, test } from "vitest";

import { parseMetadata, parseTileJson } from "./Imagery";

describe("Imagery", () => {
  test("parseMetadata", () => {
    expect(parseMetadata(metadata)).toEqual({
      center: [138.1515732, 35.9939779, 0],
      layers: ["HighLevelUseDistrict"],
      maximumLevel: 15,
    });
  });

  test("parseTileJson", () => {
    expect(parseTileJson(tilejson)).toEqual({
      center: [139.7, 35.68, 0],
      layers: ["buildings", "roads"],
      maximumLevel: 16,
    });
  });

  test("parseTileJson with missing fields", () => {
    expect(parseTileJson({})).toEqual({});
    expect(parseTileJson({ maxzoom: 14 })).toEqual({ maximumLevel: 14 });
    expect(parseTileJson({ center: [140, 36] })).toEqual({ center: [140, 36, 0] });
    expect(parseTileJson({ vector_layers: [{ id: "layer1" }] })).toEqual({
      layers: ["layer1"],
    });
  });

  test("parseTileJson with invalid fields", () => {
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
