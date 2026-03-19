import { describe, expect, test } from "vitest";

import { parseCsv } from "./Imagery";

describe("parseCsv", () => {
  test("standard CSV", () => {
    const text = "lng,lat,name\n139.7,35.6,Tokyo";
    expect(parseCsv(text)).toEqual([{ lng: "139.7", lat: "35.6", name: "Tokyo" }]);
  });

  test("Windows line endings", () => {
    const text = "lng,lat,name\r\n139.7,35.6,Tokyo\r\n140.0,36.0,Osaka";
    const result = parseCsv(text);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ lng: "139.7", lat: "35.6", name: "Tokyo" });
    expect(result[1]).toEqual({ lng: "140.0", lat: "36.0", name: "Osaka" });
  });

  test("old Mac line endings", () => {
    const text = "lng,lat,name\r139.7,35.6,Tokyo";
    const result = parseCsv(text);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ lng: "139.7", lat: "35.6", name: "Tokyo" });
  });

  test("header only returns empty array", () => {
    const text = "lng,lat,name";
    expect(parseCsv(text)).toEqual([]);
  });

  test("fewer columns than headers produces undefined values", () => {
    const text = "lng,lat,name\n139.7,35.6";
    const result = parseCsv(text);
    expect(result).toEqual([{ lng: "139.7", lat: "35.6", name: undefined }]);
  });

  test("multiple rows", () => {
    const text = "a,b\n1,2\n3,4\n5,6";
    expect(parseCsv(text)).toHaveLength(3);
  });

  test("empty values", () => {
    const text = "lng,lat,name\n,,";
    const result = parseCsv(text);
    expect(result).toEqual([{ lng: "", lat: "", name: "" }]);
  });
});
