import { describe, expect, test } from "vitest";

import { fileName, filterConvert } from "./utils";

describe("ContentList utils", () => {
  test("fileName extracts filename from URL", () => {
    expect(fileName("https://example.com/aa/bb.zip")).toBe("bb.zip");
    expect(fileName("/bb.zip")).toBe("bb.zip");
    expect(fileName("")).toBe("");
  });

  test("fileName returns empty string for undefined", () => {
    expect(fileName(undefined)).toBe("");
  });

  describe("filterConvert", () => {
    test("returns undefined for empty conditions", () => {
      expect(filterConvert({ conditions: [] } as never)).toBeUndefined();
    });

    test("returns undefined for null filter", () => {
      expect(filterConvert(null as never)).toBeUndefined();
    });

    test("converts StringFieldCondition", () => {
      const filter = {
        conditions: [
          {
            __typename: "StringFieldCondition",
            fieldId: { id: "f1", type: "FIELD" },
            stringOperator: "CONTAINS",
            stringValue: "hello",
          },
        ],
      };
      const result = filterConvert(filter as never);
      expect(result).toEqual({
        conditions: [
          {
            string: {
              fieldId: { id: "f1", type: "FIELD" },
              operator: "CONTAINS",
              value: "hello",
            },
          },
        ],
      });
    });

    test("converts BoolFieldCondition", () => {
      const filter = {
        conditions: [
          {
            __typename: "BoolFieldCondition",
            fieldId: { id: "f2", type: "FIELD" },
            boolOperator: "EQUALS",
            boolValue: true,
          },
        ],
      };
      const result = filterConvert(filter as never);
      expect(result).toEqual({
        conditions: [
          {
            bool: {
              fieldId: { id: "f2", type: "FIELD" },
              operator: "EQUALS",
              value: true,
            },
          },
        ],
      });
    });

    test("converts NullableFieldCondition", () => {
      const filter = {
        conditions: [
          {
            __typename: "NullableFieldCondition",
            fieldId: { id: "f3", type: "FIELD" },
            nullableOperator: "EMPTY",
            nullableValue: undefined,
          },
        ],
      };
      const result = filterConvert(filter as never);
      expect(result).toEqual({
        conditions: [
          {
            nullable: {
              fieldId: { id: "f3", type: "FIELD" },
              operator: "EMPTY",
              value: undefined,
            },
          },
        ],
      });
    });

    test("converts NumberFieldCondition", () => {
      const filter = {
        conditions: [
          {
            __typename: "NumberFieldCondition",
            fieldId: { id: "f4", type: "FIELD" },
            numberOperator: "GREATER_THAN",
            numberValue: "10",
          },
        ],
      };
      const result = filterConvert(filter as never);
      expect(result).toEqual({
        conditions: [
          {
            number: {
              fieldId: { id: "f4", type: "FIELD" },
              operator: "GREATER_THAN",
              value: "10",
            },
          },
        ],
      });
    });

    test("converts TimeFieldCondition", () => {
      const filter = {
        conditions: [
          {
            __typename: "TimeFieldCondition",
            fieldId: { id: "f5", type: "FIELD" },
            timeOperator: "AFTER",
            timeValue: "2024-01-01",
          },
        ],
      };
      const result = filterConvert(filter as never);
      expect(result).toEqual({
        conditions: [
          {
            time: {
              fieldId: { id: "f5", type: "FIELD" },
              operator: "AFTER",
              value: "2024-01-01",
            },
          },
        ],
      });
    });

    test("converts MultipleFieldCondition", () => {
      const filter = {
        conditions: [
          {
            __typename: "MultipleFieldCondition",
            fieldId: { id: "f6", type: "FIELD" },
            multipleOperator: "INCLUDES_ANY",
            multipleValue: ["a", "b"],
          },
        ],
      };
      const result = filterConvert(filter as never);
      expect(result).toEqual({
        conditions: [
          {
            multiple: {
              fieldId: { id: "f6", type: "FIELD" },
              operator: "INCLUDES_ANY",
              value: ["a", "b"],
            },
          },
        ],
      });
    });

    test("defaults unknown __typename to basic", () => {
      const filter = {
        conditions: [
          {
            __typename: "UnknownCondition",
            fieldId: { id: "f7", type: "FIELD" },
            basicOperator: "EQUALS",
            basicValue: "val",
          },
        ],
      };
      const result = filterConvert(filter as never);
      expect(result).toEqual({
        conditions: [
          {
            basic: {
              fieldId: { id: "f7", type: "FIELD" },
              operator: "EQUALS",
              value: "val",
            },
          },
        ],
      });
    });
  });
});
