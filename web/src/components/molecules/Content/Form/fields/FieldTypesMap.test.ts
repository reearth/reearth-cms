import { describe, test, expect, vi } from "vitest";

import { FIELD_TYPE_COMPONENT_MAP } from "./FieldTypesMap";

// GeometryField transitively imports monaco-editor which is incompatible with jsdom.
vi.mock("monaco-editor", () => ({}));
vi.mock("@monaco-editor/react", () => ({ default: () => null }));

describe("FIELD_TYPE_COMPONENT_MAP", () => {
  test("contains all 13 expected field type keys", () => {
    const expectedKeys = [
      "Text",
      "Tag",
      "Date",
      "Bool",
      "Checkbox",
      "URL",
      "TextArea",
      "MarkdownText",
      "Integer",
      "Number",
      "Select",
      "GeometryObject",
      "GeometryEditor",
    ];
    expect(Object.keys(FIELD_TYPE_COMPONENT_MAP).sort()).toEqual(expectedKeys.sort());
  });

  test("Integer and Number share the same component", () => {
    expect(FIELD_TYPE_COMPONENT_MAP.Integer).toBe(FIELD_TYPE_COMPONENT_MAP.Number);
  });

  test("GeometryObject and GeometryEditor share the same component", () => {
    expect(FIELD_TYPE_COMPONENT_MAP.GeometryObject).toBe(FIELD_TYPE_COMPONENT_MAP.GeometryEditor);
  });

  test("all values are functions (React components)", () => {
    for (const [, component] of Object.entries(FIELD_TYPE_COMPONENT_MAP)) {
      expect(typeof component).toBe("function");
    }
  });
});
