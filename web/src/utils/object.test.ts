import { describe, it, expect } from "vitest";

import { ObjectUtils } from "./object";

describe("ObjectUtils", () => {
  describe("shallowEqual", () => {
    it("returns true for shallow equal objects", () => {
      const a = { x: 1, y: "hello" };
      const b = { x: 1, y: "hello" };
      expect(ObjectUtils.shallowEqual(a, b)).toBe(true);
    });

    it("returns false for objects with different keys", () => {
      const a = { x: 1, y: "hello" };
      const b = { x: 1, z: "hello" };
      expect(ObjectUtils.shallowEqual(a, b)).toBe(false);
    });

    it("returns false for objects with different values", () => {
      const a = { x: 1, y: "hello" };
      const b = { x: 1, y: "world" };
      expect(ObjectUtils.shallowEqual(a, b)).toBe(false);
    });

    it("returns false if one object has extra keys", () => {
      const a = { x: 1 };
      const b = { x: 1, y: 2 };
      expect(ObjectUtils.shallowEqual(a, b)).toBe(false);
    });

    it("returns true for two empty objects", () => {
      expect(ObjectUtils.shallowEqual({}, {})).toBe(true);
    });

    it("returns false for different types of values", () => {
      const a = { x: "1" };
      const b = { x: 1 };
      expect(ObjectUtils.shallowEqual(a, b)).toBe(false);
    });

    it("does not compare deeply nested objects", () => {
      const a = { nested: { x: 1 } };
      const b = { nested: { x: 1 } }; // different reference
      expect(ObjectUtils.shallowEqual(a, b)).toBe(false);
    });

    it("returns true for same reference objects", () => {
      const a = { x: 1 };
      expect(ObjectUtils.shallowEqual(a, a)).toBe(true);
    });
  });

  describe("safeJSONParse", () => {
    it("Pass case: simple object", () => {
      const input = '{"x":1,"y":"hello"}';
      const expectedOutput = { isValid: true, data: { x: 1, y: "hello" } };

      expect(ObjectUtils.safeJSONParse(input)).toEqual(expectedOutput);
    });

    it("Pass case: nested object", () => {
      const input = '{"x":1,"y":"hello","z":{"name":"john","age":20}}';
      const expectedOutput = {
        isValid: true,
        data: { x: 1, y: "hello", z: { name: "john", age: 20 } },
      };

      expect(ObjectUtils.safeJSONParse(input)).toEqual(expectedOutput);
    });

    it("Pass case: string boolean (true)", () => {
      const input = "true";
      const expectedOutput = { isValid: true, data: true };

      expect(ObjectUtils.safeJSONParse(input)).toEqual(expectedOutput);
    });

    it("Pass case: string boolean (false)", () => {
      const input = "false";
      const expectedOutput = { isValid: true, data: false };

      expect(ObjectUtils.safeJSONParse(input)).toEqual(expectedOutput);
    });

    it("Pass case: string number", () => {
      const input = "123";
      const expectedOutput = { isValid: true, data: 123 };

      expect(ObjectUtils.safeJSONParse(input)).toEqual(expectedOutput);
    });

    it("Pass case: string array", () => {
      const input = "[1,2,3]";
      const expectedOutput = { isValid: true, data: [1, 2, 3] };

      expect(ObjectUtils.safeJSONParse(input)).toEqual(expectedOutput);
    });

    it("Pass case: string null", () => {
      const input = "null";
      const expectedOutput = { isValid: true, data: null };

      expect(ObjectUtils.safeJSONParse(input)).toEqual(expectedOutput);
    });

    it("Pass case: complex object", () => {
      const input =
        '{"x":1,"y":"hello","z":{"name":"john","age":20},"w":["green","red","blue"],"a":false}';
      const expectedOutput = {
        isValid: true,
        data: {
          x: 1,
          y: "hello",
          z: { name: "john", age: 20 },
          w: ["green", "red", "blue"],
          a: false,
        },
      };

      expect(ObjectUtils.safeJSONParse(input)).toEqual(expectedOutput);
    });

    it("Fail case: empty string", () => {
      const input = "";
      const expectedOutput = { isValid: false, error: "Unexpected end of JSON input" };

      expect(ObjectUtils.safeJSONParse(input)).toEqual(expectedOutput);
    });

    it("Fail case: string", () => {
      const input = "hello";
      const expectedOutput = {
        isValid: false,
        error: `Unexpected token 'h', "hello" is not valid JSON`,
      };

      expect(ObjectUtils.safeJSONParse(input)).toEqual(expectedOutput);
    });

    it("Fail case: string undefined", () => {
      const input = "undefined";
      const expectedOutput = {
        isValid: false,
        error: '"undefined" is not valid JSON',
      };

      expect(ObjectUtils.safeJSONParse(input)).toEqual(expectedOutput);
    });
  });
});
