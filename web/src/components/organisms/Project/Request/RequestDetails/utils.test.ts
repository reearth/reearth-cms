import { describe, test, expect } from "vitest";

import { initialValuesGet } from "./utils";

describe("initialValuesGet", () => {
  test("returns empty object for undefined input", () => {
    expect(initialValuesGet(undefined)).toEqual({});
  });

  test("returns empty object for empty array", () => {
    expect(initialValuesGet([])).toEqual({});
  });

  test("maps fields by schemaFieldId", () => {
    const fields = [
      { schemaFieldId: "field1", type: "Text", value: "hello", itemGroupId: null },
      { schemaFieldId: "field2", type: "Integer", value: 42, itemGroupId: null },
    ];
    const result = initialValuesGet(fields as never);
    expect(result).toEqual({
      field1: "hello",
      field2: 42,
    });
  });

  test("converts Date type fields using dateConvert", () => {
    const fields = [
      {
        schemaFieldId: "dateField",
        type: "Date",
        value: "2024-01-15T10:30:00Z",
        itemGroupId: null,
      },
    ];
    const result = initialValuesGet(fields as never);
    expect(result.dateField).toBeTruthy();
    expect(result.dateField).not.toBe("2024-01-15T10:30:00Z");
  });

  test("groups fields by itemGroupId", () => {
    const fields = [
      { schemaFieldId: "groupField", type: "Text", value: "v1", itemGroupId: "g1" },
      { schemaFieldId: "groupField", type: "Text", value: "v2", itemGroupId: "g2" },
    ];
    const result = initialValuesGet(fields as never);
    expect(result.groupField).toEqual({
      g1: "v1",
      g2: "v2",
    });
  });
});
