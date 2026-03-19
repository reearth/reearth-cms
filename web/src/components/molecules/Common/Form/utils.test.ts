import { describe, test, expect } from "vitest";

import { emptyConvert } from "./utils";

describe("Form utils", () => {
  describe("emptyConvert", () => {
    test("converts empty string to undefined", () => {
      expect(emptyConvert("")).toBeUndefined();
    });

    test("converts null to undefined", () => {
      expect(emptyConvert(null)).toBeUndefined();
    });

    test("converts empty array to undefined", () => {
      expect(emptyConvert([])).toBeUndefined();
    });

    test("passes through non-empty string", () => {
      expect(emptyConvert("hello")).toBe("hello");
    });

    test("passes through number", () => {
      expect(emptyConvert(42)).toBe(42);
    });

    test("passes through zero", () => {
      expect(emptyConvert(0)).toBe(0);
    });

    test("passes through false", () => {
      expect(emptyConvert(false)).toBe(false);
    });

    test("passes through non-empty array", () => {
      expect(emptyConvert([1, 2])).toEqual([1, 2]);
    });
  });
});
