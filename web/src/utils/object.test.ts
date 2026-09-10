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

  describe("parseJSON", () => {
    it("Pass case: simple object", async () => {
      const input = '{"x":1,"y":"hello"}';
      const expectedOutput = { x: 1, y: "hello" };
      const actualOutput = await ObjectUtils.parseJSON(input);

      expect(actualOutput.isValid).toBe(true);
      if (actualOutput.isValid) expect(actualOutput.data).toEqual(expectedOutput);
    });

    it("Pass case: nested object", async () => {
      const input = '{"x":1,"y":"hello","z":{"name":"john","age":20}}';
      const expectedOutput = { x: 1, y: "hello", z: { name: "john", age: 20 } };
      const actualOutput = await ObjectUtils.parseJSON(input);

      expect(actualOutput.isValid).toBe(true);
      if (actualOutput.isValid) expect(actualOutput.data).toEqual(expectedOutput);
    });

    it("Pass case: complex object", async () => {
      const input =
        '{"x":1,"y":"hello","z":{"name":"john","age":20},"w":["green","red","blue"],"a":false}';
      const expectedOutput = {
        x: 1,
        y: "hello",
        z: { name: "john", age: 20 },
        w: ["green", "red", "blue"],
        a: false,
      };
      const actualOutput = await ObjectUtils.parseJSON(input);

      expect(actualOutput.isValid).toBe(true);
      if (actualOutput.isValid) expect(actualOutput.data).toEqual(expectedOutput);
    });

    it("Pass case: leaves digit/boolean/array-looking leaf strings untouched (incident regression)", async () => {
      const input = JSON.stringify([
        { text_field: "1" },
        { text_field: "true" },
        { text_field: "false" },
        { text_field: "[1,2,3]" },
        { text_field: '{"a":1}' },
        { text_field: '"quoted"' },
      ]);
      const expectedOutput = [
        { text_field: "1" },
        { text_field: "true" },
        { text_field: "false" },
        { text_field: "[1,2,3]" },
        { text_field: '{"a":1}' },
        { text_field: '"quoted"' },
      ];

      const actualOutput = await ObjectUtils.parseJSON(input);

      expect(actualOutput.isValid).toBe(true);
      if (actualOutput.isValid) expect(actualOutput.data).toEqual(expectedOutput);
    });

    it("Fail case: empty string", async () => {
      const actualOutput = await ObjectUtils.parseJSON("");

      expect(actualOutput.isValid).toBe(false);
    });

    it("Fail case: bare unquoted string", async () => {
      const actualOutput = await ObjectUtils.parseJSON("hello");

      expect(actualOutput.isValid).toBe(false);
    });

    it("Fail case: malformed JSON", async () => {
      const actualOutput = await ObjectUtils.parseJSON("{invalid");

      expect(actualOutput.isValid).toBe(false);
    });
  });
});
