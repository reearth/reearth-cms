import { describe, expect, test } from "vitest";

import type { Field, SchemaFieldType, TypeProperty } from "@reearth-cms/components/molecules/Schema/types";

import { buildFieldPlaceholder, buildPostItemCurl } from "./curl";

const field = (
  type: SchemaFieldType,
  overrides: Partial<Field> = {},
  typeProperty?: TypeProperty,
): Field => ({
  id: `id-${type}`,
  type,
  title: type,
  key: type.toLowerCase(),
  description: "",
  required: false,
  unique: false,
  multiple: false,
  isTitle: false,
  typeProperty,
  ...overrides,
});

describe("buildFieldPlaceholder", () => {
  test("includes the type and the required flag", () => {
    expect(buildFieldPlaceholder(field("Text", { required: true }))).toBe("<Text, required>");
    expect(buildFieldPlaceholder(field("Text"))).toBe("<Text>");
  });

  test("surfaces maxLength for text-like fields", () => {
    expect(buildFieldPlaceholder(field("Text", {}, { maxLength: 100 }))).toBe(
      "<Text, maxLength: 100>",
    );
  });

  test("defaults URL maxLength to the server cap of 2048", () => {
    expect(buildFieldPlaceholder(field("URL"))).toBe("<URL, maxLength: 2048>");
    expect(buildFieldPlaceholder(field("URL", {}, { maxLength: 500 }))).toBe(
      "<URL, maxLength: 500>",
    );
  });

  test("lists Select options", () => {
    expect(
      buildFieldPlaceholder(field("Select", { required: true }, { values: ["news", "blog", "event"] })),
    ).toBe("<Select, required, options: news | blog | event>");
  });

  test("surfaces Integer min/max", () => {
    expect(buildFieldPlaceholder(field("Integer", {}, { min: 1, max: 5 }))).toBe(
      "<Integer, min: 1, max: 5>",
    );
  });

  test("surfaces Number min/max from the number-specific properties", () => {
    expect(buildFieldPlaceholder(field("Number", {}, { numberMin: 0.5, numberMax: 9.9 }))).toBe(
      "<Number, min: 0.5, max: 9.9>",
    );
  });

  test("wraps multiple fields in an array", () => {
    expect(buildFieldPlaceholder(field("Text", { multiple: true }))).toEqual(["<Text>"]);
  });
});

describe("buildPostItemCurl", () => {
  const endpoint = "https://test.com/api/p/ws/proj/blog/items";

  test("builds a multi-line curl with only supported fields", () => {
    const fields = [
      field("Text", { key: "title", required: true }, { maxLength: 100 }),
      field("Integer", { key: "rating" }, { min: 1, max: 5 }),
      field("Text", { key: "aliases", multiple: true }),
    ];

    expect(buildPostItemCurl(endpoint, fields)).toBe(
      `curl -X POST '${endpoint}' \\
  -H 'Content-Type: application/json' \\
  -d '{
  "fields": {
    "title": "<Text, required, maxLength: 100>",
    "rating": "<Integer, min: 1, max: 5>",
    "aliases": [
      "<Text>"
    ]
  }
}'`,
    );
  });

  test("excludes unsupported field types", () => {
    const fields = [
      field("Text", { key: "title" }),
      field("Asset", { key: "cover" }),
      field("Reference", { key: "author" }),
      field("Tag", { key: "labels" }),
      field("Group", { key: "meta" }),
      field("GeometryObject", { key: "shape" }),
      field("GeometryEditor", { key: "geo" }),
    ];

    const curl = buildPostItemCurl(endpoint, fields);
    expect(curl).toContain('"title": "<Text>"');
    for (const key of ["cover", "author", "labels", "meta", "shape", "geo"]) {
      expect(curl).not.toContain(`"${key}"`);
    }
  });

  test("yields an empty fields object when no field is supported", () => {
    const curl = buildPostItemCurl(endpoint, [field("Asset", { key: "cover" })]);
    expect(curl).toContain(`-d '{
  "fields": {}
}'`);
  });
});
