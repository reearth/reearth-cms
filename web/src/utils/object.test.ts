import { describe, it, expect } from "vitest";

import { shallowEqual } from "./object";

describe("shallowEqual", () => {
  it("returns true for shallow equal objects", () => {
    const a = { x: 1, y: "hello" };
    const b = { x: 1, y: "hello" };
    expect(shallowEqual(a, b)).toBe(true);
  });

  it("returns false for objects with different keys", () => {
    const a = { x: 1, y: "hello" };
    const b = { x: 1, z: "hello" };
    expect(shallowEqual(a, b)).toBe(false);
  });

  it("returns false for objects with different values", () => {
    const a = { x: 1, y: "hello" };
    const b = { x: 1, y: "world" };
    expect(shallowEqual(a, b)).toBe(false);
  });

  it("returns false if one object has extra keys", () => {
    const a = { x: 1 };
    const b = { x: 1, y: 2 };
    expect(shallowEqual(a, b)).toBe(false);
  });

  it("returns true for two empty objects", () => {
    expect(shallowEqual({}, {})).toBe(true);
  });

  it("returns false for different types of values", () => {
    const a = { x: "1" };
    const b = { x: 1 };
    expect(shallowEqual(a, b)).toBe(false);
  });

  it("does not compare deeply nested objects", () => {
    const a = { nested: { x: 1 } };
    const b = { nested: { x: 1 } }; // different reference
    expect(shallowEqual(a, b)).toBe(false);
  });

  it("returns true for same reference objects", () => {
    const a = { x: 1 };
    expect(shallowEqual(a, a)).toBe(true);
  });
});
