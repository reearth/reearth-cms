import { expect, test } from "vitest";

import type { ItemValue } from "@reearth-cms/components/molecules/Content/types";
import { Test } from "@reearth-cms/test/utils";

import { fileName, geometryCellValue } from "./utils";

test.each<[string, ItemValue | null, string | string[] | null]>([
  ["a geometry", Test.GEO_JSON_POINT, JSON.stringify(Test.GEO_JSON_POINT)],
  [
    "a list of geometries",
    [Test.GEO_JSON_POINT, Test.GEO_JSON_LINE_STRING],
    [JSON.stringify(Test.GEO_JSON_POINT), JSON.stringify(Test.GEO_JSON_LINE_STRING)],
  ],
  ["an empty list", [], null],
  ["null", null, null],
])("geometryCellValue shows %s as GeoJSON text", (_, value, expected) => {
  expect(geometryCellValue(value)).toEqual(expected);
});

test("fileName", () => {
  expect(fileName("https://example.com/aa/bb.zip")).toBe("bb.zip");
  expect(fileName("/bb.zip")).toBe("bb.zip");
  expect(fileName("")).toBe("");
});
