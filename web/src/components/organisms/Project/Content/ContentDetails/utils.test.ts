import dayjs from "dayjs";
import { describe, test, expect } from "vitest";

import { dateConvert } from "./utils";

describe("dateConvert", () => {
  test("converts a single date string to dayjs object", () => {
    const result = dateConvert("2024-01-15T10:30:00Z");
    expect(dayjs.isDayjs(result)).toBe(true);
  });

  test("returns empty string for null input", () => {
    expect(dateConvert(null)).toBe("");
  });

  test("returns empty string for undefined input", () => {
    expect(dateConvert(undefined)).toBe("");
  });

  test("returns empty string for empty string input", () => {
    expect(dateConvert("")).toBe("");
  });

  test("converts an array of date strings to dayjs objects", () => {
    const result = dateConvert(["2024-01-15T10:30:00Z", "2024-06-20T15:00:00Z"]);
    expect(Array.isArray(result)).toBe(true);
    const arr = result as (dayjs.Dayjs | string)[];
    expect(dayjs.isDayjs(arr[0])).toBe(true);
    expect(dayjs.isDayjs(arr[1])).toBe(true);
  });

  test("handles array with empty strings", () => {
    const result = dateConvert(["2024-01-15T10:30:00Z", ""]);
    expect(Array.isArray(result)).toBe(true);
    const arr = result as (dayjs.Dayjs | string)[];
    expect(dayjs.isDayjs(arr[0])).toBe(true);
    expect(arr[1]).toBe("");
  });
});
