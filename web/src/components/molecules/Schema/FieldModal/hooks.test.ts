import { renderHook, act } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";

import { type SelectedSchemaType, type SchemaFieldType, type FormTypes } from "../types";

import useFieldModal, { getTypeProperty } from "./hooks";

const defaultArgs = {
  selectedSchemaType: "model" as SelectedSchemaType,
  selectedType: "Text" as SchemaFieldType,
  isMeta: false,
  selectedField: null,
  open: true,
  onClose: vi.fn(),
  onSubmit: vi.fn().mockResolvedValue(undefined),
  handleFieldKeyUnique: vi.fn().mockReturnValue(true),
};

function renderFieldModal(overrides: Partial<typeof defaultArgs> = {}) {
  const args = { ...defaultArgs, ...overrides };
  return renderHook(() =>
    useFieldModal(
      args.selectedSchemaType,
      args.selectedType,
      args.isMeta,
      args.selectedField,
      args.open,
      args.onClose,
      args.onSubmit,
      args.handleFieldKeyUnique,
    ),
  );
}

describe("FieldModal hooks", () => {
  describe("isRequiredDisabled", () => {
    test("disabled for Group type", () => {
      const { result } = renderFieldModal({ selectedType: "Group" });
      expect(result.current.isRequiredDisabled).toBe(true);
    });

    test("disabled for Bool type", () => {
      const { result } = renderFieldModal({ selectedType: "Bool" });
      expect(result.current.isRequiredDisabled).toBe(true);
    });

    test("disabled for Checkbox type", () => {
      const { result } = renderFieldModal({ selectedType: "Checkbox" });
      expect(result.current.isRequiredDisabled).toBe(true);
    });

    test("enabled for Text type", () => {
      const { result } = renderFieldModal({ selectedType: "Text" });
      expect(result.current.isRequiredDisabled).toBe(false);
    });
  });

  describe("isUniqueDisabled", () => {
    test("disabled for Group type", () => {
      const { result } = renderFieldModal({ selectedType: "Group" });
      expect(result.current.isUniqueDisabled).toBe(true);
    });

    test("enabled for Text type", () => {
      const { result } = renderFieldModal({ selectedType: "Text" });
      expect(result.current.isUniqueDisabled).toBe(false);
    });
  });

  describe("isTitleDisabled", () => {
    test("disabled for meta fields on model schema", () => {
      const { result } = renderFieldModal({
        selectedSchemaType: "model",
        isMeta: true,
        selectedType: "Text",
      });
      expect(result.current.isTitleDisabled).toBe(true);
    });

    test("enabled for non-meta Text fields on model schema", () => {
      const { result } = renderFieldModal({
        selectedSchemaType: "model",
        isMeta: false,
        selectedType: "Text",
      });
      expect(result.current.isTitleDisabled).toBe(false);
    });

    test("enabled for TextArea type", () => {
      const { result } = renderFieldModal({
        selectedSchemaType: "model",
        isMeta: false,
        selectedType: "TextArea",
      });
      expect(result.current.isTitleDisabled).toBe(false);
    });

    test("enabled for MarkdownText type", () => {
      const { result } = renderFieldModal({
        selectedSchemaType: "model",
        isMeta: false,
        selectedType: "MarkdownText",
      });
      expect(result.current.isTitleDisabled).toBe(false);
    });

    test("disabled for non-text types", () => {
      const { result } = renderFieldModal({
        selectedSchemaType: "model",
        isMeta: false,
        selectedType: "Integer",
      });
      expect(result.current.isTitleDisabled).toBe(true);
    });

    test("enabled for group schema type even with meta", () => {
      const { result } = renderFieldModal({
        selectedSchemaType: "group",
        isMeta: true,
        selectedType: "Text",
      });
      expect(result.current.isTitleDisabled).toBe(false);
    });
  });

  describe("handleTabChange", () => {
    test("changes activeTab", () => {
      const { result } = renderFieldModal();
      expect(result.current.activeTab).toBe("settings");

      act(() => {
        result.current.handleTabChange("validation");
      });
      expect(result.current.activeTab).toBe("validation");

      act(() => {
        result.current.handleTabChange("defaultValue");
      });
      expect(result.current.activeTab).toBe("defaultValue");
    });
  });

  describe("keyValidate", () => {
    test("resolves for valid unique key", async () => {
      const handleFieldKeyUnique = vi.fn().mockReturnValue(true);
      const { result } = renderFieldModal({ handleFieldKeyUnique });
      await expect(result.current.keyValidate("valid-key")).resolves.toBeUndefined();
      expect(handleFieldKeyUnique).toHaveBeenCalledWith("valid-key");
    });

    test("rejects for non-unique key", async () => {
      const handleFieldKeyUnique = vi.fn().mockReturnValue(false);
      const { result } = renderFieldModal({ handleFieldKeyUnique });
      await expect(result.current.keyValidate("duplicate-key")).rejects.toBeUndefined();
    });

    test("caches previous validation result", async () => {
      const handleFieldKeyUnique = vi.fn().mockReturnValue(true);
      const { result } = renderFieldModal({ handleFieldKeyUnique });

      await expect(result.current.keyValidate("cached-key")).resolves.toBeUndefined();
      await expect(result.current.keyValidate("cached-key")).resolves.toBeUndefined();
      expect(handleFieldKeyUnique).toHaveBeenCalledTimes(1);
    });

    test("rejects for invalid key format", async () => {
      const handleFieldKeyUnique = vi.fn().mockReturnValue(true);
      const { result } = renderFieldModal({ handleFieldKeyUnique });
      await expect(result.current.keyValidate("invalid key!")).rejects.toBeUndefined();
    });
  });

  describe("emptyValidator", () => {
    test("resolves for non-empty values", async () => {
      const { result } = renderFieldModal();
      await expect(result.current.emptyValidator(["a", "b"])).resolves.toBeUndefined();
    });

    test("rejects when array contains empty strings", async () => {
      const { result } = renderFieldModal();
      await expect(result.current.emptyValidator(["a", "", "b"])).rejects.toBeUndefined();
    });

    test("resolves for undefined", async () => {
      const { result } = renderFieldModal();
      await expect(result.current.emptyValidator(undefined)).resolves.toBeUndefined();
    });
  });

  describe("duplicatedValidator", () => {
    test("resolves for unique values", async () => {
      const { result } = renderFieldModal();
      await expect(result.current.duplicatedValidator(["a", "b", "c"])).resolves.toBeUndefined();
    });

    test("rejects when array contains duplicates", async () => {
      const { result } = renderFieldModal();
      await expect(result.current.duplicatedValidator(["a", "b", "a"])).rejects.toBeUndefined();
    });

    test("resolves for undefined", async () => {
      const { result } = renderFieldModal();
      await expect(result.current.duplicatedValidator(undefined)).resolves.toBeUndefined();
    });
  });

  describe("handleModalReset", () => {
    test("calls onClose callback", () => {
      const onClose = vi.fn();
      const { result } = renderFieldModal({ onClose });

      act(() => {
        result.current.handleModalReset();
      });
      expect(onClose).toHaveBeenCalledOnce();
    });

    test("resets activeTab to settings", () => {
      const { result } = renderFieldModal();

      act(() => {
        result.current.handleTabChange("validation");
      });
      expect(result.current.activeTab).toBe("validation");

      act(() => {
        result.current.handleModalReset();
      });
      expect(result.current.activeTab).toBe("settings");
    });
  });

  describe("ObjectSupportType and EditorSupportType", () => {
    test("ObjectSupportType contains all geometry types", () => {
      const { result } = renderFieldModal();
      const values = result.current.ObjectSupportType.map(t => t.value);
      expect(values).toContain("POINT");
      expect(values).toContain("LINESTRING");
      expect(values).toContain("POLYGON");
      expect(values).toContain("GEOMETRYCOLLECTION");
      expect(values).toContain("MULTIPOINT");
      expect(values).toContain("MULTILINESTRING");
      expect(values).toContain("MULTIPOLYGON");
    });

    test("EditorSupportType contains basic types plus ANY", () => {
      const { result } = renderFieldModal();
      const values = result.current.EditorSupportType.map(t => t.value);
      expect(values).toContain("POINT");
      expect(values).toContain("LINESTRING");
      expect(values).toContain("POLYGON");
      expect(values).toContain("ANY");
    });
  });

  describe("buttonDisabled", () => {
    test("initially disabled when no title/key set", () => {
      const { result } = renderFieldModal();
      expect(result.current.buttonDisabled).toBe(true);
    });
  });

  describe("getTypeProperty", () => {
    test("Text type (default) returns text property", () => {
      const result = getTypeProperty({
        type: "Text",
        defaultValue: "hello",
        maxLength: 100,
      } as FormTypes);
      expect(result).toEqual({ text: { defaultValue: "hello", maxLength: 100 } });
    });

    test("TextArea type returns textArea property", () => {
      const result = getTypeProperty({
        type: "TextArea",
        defaultValue: "content",
        maxLength: 500,
      } as FormTypes);
      expect(result).toEqual({ textArea: { defaultValue: "content", maxLength: 500 } });
    });

    test("MarkdownText type returns markdownText property", () => {
      const result = getTypeProperty({
        type: "MarkdownText",
        defaultValue: "# Title",
        maxLength: 1000,
      } as FormTypes);
      expect(result).toEqual({ markdownText: { defaultValue: "# Title", maxLength: 1000 } });
    });

    test("Asset type returns asset property", () => {
      const result = getTypeProperty({ type: "Asset", defaultValue: "asset-id" } as FormTypes);
      expect(result).toEqual({ asset: { defaultValue: "asset-id" } });
    });

    test("Select type filters empty strings from array defaultValue", () => {
      const result = getTypeProperty({
        type: "Select",
        defaultValue: ["a", "", "b"],
        values: ["a", "b"],
      } as FormTypes);
      expect(result).toEqual({ select: { defaultValue: ["a", "b"], values: ["a", "b"] } });
    });

    test("Select type with scalar defaultValue", () => {
      const result = getTypeProperty({
        type: "Select",
        defaultValue: "a",
        values: ["a", "b"],
      } as FormTypes);
      expect(result).toEqual({ select: { defaultValue: "a", values: ["a", "b"] } });
    });

    test("Select type with undefined defaultValue", () => {
      const result = getTypeProperty({
        type: "Select",
        values: ["a"],
      } as FormTypes);
      expect(result).toEqual({ select: { defaultValue: "", values: ["a"] } });
    });

    test("Integer type filters non-numbers from array and maps min/max", () => {
      const result = getTypeProperty({
        type: "Integer",
        defaultValue: [1, "invalid", 3],
        min: 0,
        max: 100,
      } as FormTypes);
      expect(result).toEqual({ integer: { defaultValue: [1, 3], min: 0, max: 100 } });
    });

    test("Number type with undefined min/max uses null", () => {
      const result = getTypeProperty({
        type: "Number",
        defaultValue: 3.14,
      } as FormTypes);
      expect(result).toEqual({ number: { defaultValue: 3.14, min: null, max: null } });
    });

    test("Bool type returns bool property", () => {
      const result = getTypeProperty({ type: "Bool", defaultValue: true } as FormTypes);
      expect(result).toEqual({ bool: { defaultValue: true } });
    });

    test("Date type with non-dayjs value passes through", () => {
      const result = getTypeProperty({ type: "Date", defaultValue: "plain-string" } as FormTypes);
      expect(result).toEqual({ date: { defaultValue: "plain-string" } });
    });

    test("Date type with undefined defaultValue returns empty string", () => {
      const result = getTypeProperty({ type: "Date" } as FormTypes);
      expect(result).toEqual({ date: { defaultValue: "" } });
    });

    test("Tag type cross-references tag names with defaultValue array", () => {
      const result = getTypeProperty({
        type: "Tag",
        defaultValue: ["Tag A", "Tag C"],
        tags: [
          { name: "Tag A", color: "red" },
          { name: "Tag B", color: "blue" },
          { name: "Tag C", color: "green" },
        ],
      } as FormTypes);
      expect(result).toEqual({
        tag: {
          defaultValue: ["Tag A", "Tag C"],
          tags: [
            { name: "Tag A", color: "red" },
            { name: "Tag B", color: "blue" },
            { name: "Tag C", color: "green" },
          ],
        },
      });
    });

    test("Tag type with non-array defaultValue", () => {
      const result = getTypeProperty({
        type: "Tag",
        defaultValue: "single",
        tags: [{ name: "single", color: "red" }],
      } as FormTypes);
      expect(result).toEqual({
        tag: { defaultValue: "single", tags: [{ name: "single", color: "red" }] },
      });
    });

    test("Checkbox type returns checkbox property", () => {
      const result = getTypeProperty({ type: "Checkbox", defaultValue: false } as FormTypes);
      expect(result).toEqual({ checkbox: { defaultValue: false } });
    });

    test("URL type returns url property", () => {
      const result = getTypeProperty({
        type: "URL",
        defaultValue: "https://example.com",
      } as FormTypes);
      expect(result).toEqual({ url: { defaultValue: "https://example.com" } });
    });

    test("Group type returns group property with groupId", () => {
      const result = getTypeProperty({ type: "Group", group: "group-123" } as FormTypes);
      expect(result).toEqual({ group: { groupId: "group-123" } });
    });

    test("GeometryObject type returns supportedTypes and defaultValue", () => {
      const result = getTypeProperty({
        type: "GeometryObject",
        defaultValue: "geo-data",
        supportedTypes: ["POINT", "POLYGON"],
      } as FormTypes);
      expect(result).toEqual({
        geometryObject: { defaultValue: "geo-data", supportedTypes: ["POINT", "POLYGON"] },
      });
    });

    test("GeometryEditor type wraps supportedTypes in array", () => {
      const result = getTypeProperty({
        type: "GeometryEditor",
        defaultValue: "geo-data",
        supportedTypes: "POINT",
      } as FormTypes);
      expect(result).toEqual({
        geometryEditor: { defaultValue: "geo-data", supportedTypes: ["POINT"] },
      });
    });

    test("unknown type falls through to Text default", () => {
      const result = getTypeProperty({
        type: "UnknownType" as SchemaFieldType,
        defaultValue: "val",
        maxLength: 50,
      } as FormTypes);
      expect(result).toEqual({ text: { defaultValue: "val", maxLength: 50 } });
    });
  });
});
