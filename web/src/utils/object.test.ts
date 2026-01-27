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
    it("Pass case: simple object", async () => {
      const input = '{"x":1,"y":"hello"}';
      const expectedOutput = { x: 1, y: "hello" };
      const actualOutput = await ObjectUtils.safeJSONParse(input);

      expect(actualOutput.isValid).toBe(true);
      if (actualOutput.isValid) expect(actualOutput.data).toEqual(expectedOutput);
    });

    it("Pass case: nested object", async () => {
      const input = '{"x":1,"y":"hello","z":{"name":"john","age":20}}';
      const expectedOutput = { x: 1, y: "hello", z: { name: "john", age: 20 } };
      const actualOutput = await ObjectUtils.safeJSONParse(input);

      expect(actualOutput.isValid).toBe(true);
      if (actualOutput.isValid) expect(actualOutput.data).toEqual(expectedOutput);
    });

    it("Pass case: string boolean (true)", async () => {
      const input = "true";
      const expectedOutput = true;
      const actualOutput = await ObjectUtils.safeJSONParse(input);

      expect(actualOutput.isValid).toBe(true);
      if (actualOutput.isValid) expect(actualOutput.data).toEqual(expectedOutput);
    });

    it("Pass case: string boolean (false)", async () => {
      const input = "false";
      const expectedOutput = false;
      const actualOutput = await ObjectUtils.safeJSONParse(input);

      expect(actualOutput.isValid).toBe(true);
      if (actualOutput.isValid) expect(actualOutput.data).toEqual(expectedOutput);
    });

    it("Pass case: string number", async () => {
      const input = "123";
      const expectedOutput = 123;
      const actualOutput = await ObjectUtils.safeJSONParse(input);

      expect(actualOutput.isValid).toBe(true);
      if (actualOutput.isValid) expect(actualOutput.data).toEqual(expectedOutput);
    });

    it("Pass case: string array", async () => {
      const input = "[1,2,3]";
      const expectedOutput = [1, 2, 3];
      const actualOutput = await ObjectUtils.safeJSONParse(input);

      expect(actualOutput.isValid).toBe(true);
      if (actualOutput.isValid) expect(actualOutput.data).toEqual(expectedOutput);
    });

    it("Pass case: string null", async () => {
      const input = "null";
      const expectedOutput = null;
      const actualOutput = await ObjectUtils.safeJSONParse(input);

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
      const actualOutput = await ObjectUtils.safeJSONParse(input);

      expect(actualOutput.isValid).toBe(true);
      if (actualOutput.isValid) expect(actualOutput.data).toEqual(expectedOutput);
    });

    it("Fail case: empty string", async () => {
      const input = "";
      const expectedOutput = "Unexpected end of JSON input";
      const actualOutput = await ObjectUtils.safeJSONParse(input);

      expect(actualOutput.isValid).toBe(false);
      if (!actualOutput.isValid) expect(actualOutput.error).toBe(expectedOutput);
    });

    it("Fail case: string", async () => {
      const input = "hello";
      const expectedOutput = `Unexpected token 'h', "hello" is not valid JSON`;

      const actualOutput = await ObjectUtils.safeJSONParse(input);

      expect(actualOutput.isValid).toBe(false);
      if (!actualOutput.isValid) expect(actualOutput.error).toBe(expectedOutput);
    });

    it("Fail case: string undefined", async () => {
      const input = "undefined";
      const expectedOutput = '"undefined" is not valid JSON';

      const actualOutput = await ObjectUtils.safeJSONParse(input);

      expect(actualOutput.isValid).toBe(false);
      if (!actualOutput.isValid) expect(actualOutput.error).toBe(expectedOutput);
    });
  });

  describe.only("deepJsonParse", () => {
    it("test", () => {
      const raw =
        '{\n  "geo-object-key": {\n    "title": "geo-object-key",\n    "description": "this is geo obj field",\n    "type": "object",\n    "x-defaultValue": "{\\n   \\"coordinates\\": [\\n          139.6917,\\n          35.6895\\n        ],\\n        \\"type\\": \\"Point\\"\\n}",\n    "x-fieldType": "geometryObject",\n    "x-unique": true,\n    "x-required": true,\n    "x-geoSupportedTypes": [\n      "POINT"\n    ]\n  }\n}';
      const expectResult = {
        "geo-object-key": {
          title: "geo-object-key",
          description: "this is geo obj field",
          type: "object",
          "x-defaultValue": {
            coordinates: [139.6917, 35.6895],
            type: "Point",
          },
          "x-fieldType": "geometryObject",
          "x-unique": true,
          "x-required": true,
          "x-geoSupportedTypes": ["POINT"],
        },
      };

      expect(expectResult).toEqual(ObjectUtils.deepJsonParse(raw));
    });
  });
});
