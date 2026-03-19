import { describe, test, expect } from "vitest";

import { moveItemInArray } from "./moveItemArray";

describe("moveItemInArray", () => {
  test("moves item forward in array", () => {
    expect(moveItemInArray([1, 2, 3, 4], 0, 2)).toEqual([2, 3, 1, 4]);
  });

  test("moves item backward in array", () => {
    expect(moveItemInArray([1, 2, 3, 4], 3, 1)).toEqual([1, 4, 2, 3]);
  });

  test("returns copy when fromIndex equals toIndex", () => {
    const original = [1, 2, 3];
    const result = moveItemInArray(original, 1, 1);
    expect(result).toEqual([1, 2, 3]);
    expect(result).not.toBe(original);
  });

  test("moves first to last", () => {
    expect(moveItemInArray(["a", "b", "c"], 0, 2)).toEqual(["b", "c", "a"]);
  });

  test("moves last to first", () => {
    expect(moveItemInArray(["a", "b", "c"], 2, 0)).toEqual(["c", "a", "b"]);
  });

  test("does not mutate original array", () => {
    const original = [1, 2, 3];
    moveItemInArray(original, 0, 2);
    expect(original).toEqual([1, 2, 3]);
  });

  test("works with single-element array", () => {
    expect(moveItemInArray([1], 0, 0)).toEqual([1]);
  });
});
