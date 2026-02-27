import { describe, expect, test } from "vitest";

import { sortProperties, tryParseJson } from "./sortProperty";

describe("sort Properties", () => {
  test("sort depth1: simple", () => {
    const obj = {
      a: "a",
      b: "b",
      c: "c",
    };
    const expected = {
      a: "a",
      b: "b",
      c: "c",
    };
    expect(sortProperties(obj)).toEqual(expected);
  });
  test("sort depth1: other data types", () => {
    const obj = {
      a: ["hoge", "fuga"],
      b: 1000,
      c: "c",
    };
    const expected = {
      a: ["hoge", "fuga"],
      b: 1000,
      c: "c",
    };
    expect(sortProperties(obj)).toEqual(expected);
  });

  test("sort depth2: simple", () => {
    const obj = {
      a: {
        a: "a",
        b: "b",
        c: "c",
      },
      b: {
        a: "a",
        b: "b",
        c: "c",
      },
      c: ["1", "2", "3"],
      d: 100,
    };
    const expected = {
      a: {
        a: "a",
        b: "b",
        c: "c",
      },
      b: {
        a: "a",
        b: "b",
        c: "c",
      },
      c: ["1", "2", "3"],
      d: 100,
    };
    expect(sortProperties(obj)).toStrictEqual(expected);
  });

  test("parse JSON string properties", () => {
    const obj = {
      attributes: '{"key": "value", "nested": {"a": 1}}',
      name: "test",
      normalString: "hello",
    };
    const result = sortProperties(obj);
    expect(result).toEqual({
      attributes: { key: "value", nested: { a: 1 } },
      name: "test",
      normalString: "hello",
    });
  });

  test("parse JSON array string properties", () => {
    const obj = {
      items: "[1, 2, 3]",
      name: "test",
    };
    const result = sortProperties(obj);
    expect(result).toEqual({
      items: [1, 2, 3],
      name: "test",
    });
  });
});

describe("tryParseJson", () => {
  test("parse valid JSON object", () => {
    expect(tryParseJson('{"a": 1}')).toEqual({ a: 1 });
    expect(tryParseJson('  {"a": 1}  ')).toEqual({ a: 1 });
  });

  test("parse valid JSON array", () => {
    expect(tryParseJson("[1, 2, 3]")).toEqual([1, 2, 3]);
    expect(tryParseJson('["a", "b"]')).toEqual(["a", "b"]);
  });

  test("return null for non-JSON strings", () => {
    expect(tryParseJson("hello")).toBeNull();
    expect(tryParseJson("123")).toBeNull();
    expect(tryParseJson("")).toBeNull();
  });

  test("return null for invalid JSON", () => {
    expect(tryParseJson("{invalid}")).toBeNull();
    expect(tryParseJson("{a: 1}")).toBeNull();
    expect(tryParseJson("[1, 2,]")).toBeNull();
  });

  test("return null for primitive JSON values", () => {
    expect(tryParseJson("null")).toBeNull();
    expect(tryParseJson("true")).toBeNull();
  });
});
