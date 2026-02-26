import { renderHook, act } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";

import { type SelectedSchemaType, type SchemaFieldType } from "../types";

import useFieldModal from "./hooks";

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
});
