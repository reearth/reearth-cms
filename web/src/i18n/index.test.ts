import { test, expect } from "vitest";

import { isJapanese } from "./index";

test("isJapanese matches bare and regional Japanese locale tags", () => {
  expect(isJapanese("ja")).toBe(true);
  expect(isJapanese("ja-JP")).toBe(true);
  expect(isJapanese("ja-JP-u-ca-japanese")).toBe(true);
});

test("isJapanese rejects non-Japanese locale tags", () => {
  expect(isJapanese("en")).toBe(false);
  expect(isJapanese("en-US")).toBe(false);
  expect(isJapanese("jaX")).toBe(false);
  expect(isJapanese("")).toBe(false);
});
