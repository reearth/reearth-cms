import { describe, expect, test } from "vitest";

import type { Field } from "./types";
import { ALL_GEOMETRY_TYPES, displayFieldType, isUnifiedGeometryField } from "./unifiedGeometry";

type FieldShape = Pick<Field, "type" | "typeProperty">;

const geometryObject = (objectSupportedTypes?: Field["typeProperty"]): FieldShape => ({
  type: "GeometryObject",
  typeProperty: objectSupportedTypes,
});

describe("isUnifiedGeometryField", () => {
  test("is a Geometry Object accepting every geometry type", () => {
    expect(
      isUnifiedGeometryField(geometryObject({ objectSupportedTypes: ALL_GEOMETRY_TYPES })),
    ).toBe(true);
  });

  test("order doesn't matter", () => {
    expect(
      isUnifiedGeometryField(
        geometryObject({ objectSupportedTypes: [...ALL_GEOMETRY_TYPES].reverse() }),
      ),
    ).toBe(true);
  });

  test.each<[string, FieldShape]>([
    [
      "a Geometry Object restricted to some types",
      geometryObject({ objectSupportedTypes: ["POINT"] }),
    ],
    ["a Geometry Object without supported types", geometryObject({})],
    ["a Geometry Object without a type property", geometryObject()],
    [
      "a Geometry Editor field",
      { type: "GeometryEditor", typeProperty: { objectSupportedTypes: ALL_GEOMETRY_TYPES } },
    ],
  ])("is not %s", (_, field) => {
    expect(isUnifiedGeometryField(field)).toBe(false);
  });
});

describe("displayFieldType", () => {
  test("shows the unified field as Geometry", () => {
    expect(displayFieldType(geometryObject({ objectSupportedTypes: ALL_GEOMETRY_TYPES }))).toBe(
      "Geometry",
    );
  });

  test("keeps every other field's own type", () => {
    expect(displayFieldType(geometryObject({ objectSupportedTypes: ["POINT"] }))).toBe(
      "GeometryObject",
    );
    expect(displayFieldType({ type: "Text" })).toBe("Text");
  });
});
