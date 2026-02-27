import { describe, test, expect } from "vitest";

import { checkIfEmpty, requiredValidator, urlErrorIndexesGet } from "./utils";

describe("Content Form field utils", () => {
  describe("checkIfEmpty", () => {
    test("returns true for undefined", () => {
      expect(checkIfEmpty(undefined)).toBe(true);
    });

    test("returns true for null", () => {
      expect(checkIfEmpty(null)).toBe(true);
    });

    test("returns true for empty string", () => {
      expect(checkIfEmpty("")).toBe(true);
    });

    test("returns false for non-empty string", () => {
      expect(checkIfEmpty("hello")).toBe(false);
    });

    test("returns false for zero", () => {
      expect(checkIfEmpty(0)).toBe(false);
    });

    test("returns false for false", () => {
      expect(checkIfEmpty(false)).toBe(false);
    });
  });

  describe("requiredValidator", () => {
    test("rejects when required and value is empty", async () => {
      await expect(requiredValidator({ required: true }, "")).rejects.toBeUndefined();
    });

    test("rejects when required and value is null", async () => {
      await expect(requiredValidator({ required: true }, null)).rejects.toBeUndefined();
    });

    test("rejects when required and value is undefined", async () => {
      await expect(requiredValidator({ required: true }, undefined)).rejects.toBeUndefined();
    });

    test("rejects when required and array has all empty values", async () => {
      await expect(
        requiredValidator({ required: true }, ["", null, undefined]),
      ).rejects.toBeUndefined();
    });

    test("resolves when required and value is non-empty", async () => {
      await expect(requiredValidator({ required: true }, "hello")).resolves.toBeUndefined();
    });

    test("resolves when not required and value is empty", async () => {
      await expect(requiredValidator({ required: false }, "")).resolves.toBeUndefined();
    });

    test("resolves when required and array has at least one non-empty value", async () => {
      await expect(requiredValidator({ required: true }, ["", "value"])).resolves.toBeUndefined();
    });
  });

  describe("urlErrorIndexesGet", () => {
    test("returns empty array for valid URL string", () => {
      expect(urlErrorIndexesGet("https://example.com")).toEqual([]);
    });

    test("returns [0] for invalid URL string", () => {
      expect(urlErrorIndexesGet("not-a-url")).toEqual([0]);
    });

    test("returns empty array for empty string", () => {
      expect(urlErrorIndexesGet("")).toEqual([]);
    });

    test("returns indexes of invalid URLs in array", () => {
      expect(urlErrorIndexesGet(["https://example.com", "bad-url", "https://valid.org"])).toEqual([
        1,
      ]);
    });

    test("returns empty array when all URLs in array are valid", () => {
      expect(urlErrorIndexesGet(["https://example.com", "https://valid.org"])).toEqual([]);
    });

    test("skips empty strings in array", () => {
      expect(urlErrorIndexesGet(["", "https://example.com", ""])).toEqual([]);
    });
  });
});
