import { describe, expect, test } from "vitest";

import { RegexUtils } from "./regex";

describe("RegexUtils", () => {
  test.each([
    ["valid_key", true],
    ["anotherKey123", true],
    ["123_456", true],
    ["", false],
    ["too_long_key_to_validate_whether_it_is_valid_or_not", false],
    ["with spaces", false],
    ["special!char", false],
  ])("validateKey returns %s for %s", (key, expected) => {
    expect(RegexUtils.validateKey(key)).toBe(expected);
  });

  test.each([
    ["http://example.com", true],
    ["https://www.example.com", true],
    ["ftp://ftp.example.com", true],
    ["example.com", false],
    ["htp://example.com", false],
    ["http://example", false],
    ["http://localhost:3000", false],
  ])("validateURL returns %s for %s", (url, expected) => {
    expect(RegexUtils.validateURL(url)).toBe(expected);
  });

  test.each([
    "https://example.com",
    "http://example.com",
    "https://example.com:3000",
    "https://app.example.com",
    "https://example.com/",
  ])("validateOrigin returns true for valid origin %s", origin => {
    expect(RegexUtils.validateOrigin(origin)).toBe(true);
  });

  test.each([
    "yahoo.com",
    "ftp://example.com",
    "https://*.example.com",
    "*",
    "https://example.com/path",
    "https://example.com?foo=bar",
    "https://example.com#x",
    "not-a-url",
  ])("validateOrigin returns false for invalid origin %s", origin => {
    expect(RegexUtils.validateOrigin(origin)).toBe(false);
  });

  test.each([
    ["test_project_123", true],
    ["test-project-123", true],
    ["test.project.123", false],
    ["test project 123", false],
    ["testProject123", false],
    ["testProject123@#$%^&*()+=", false],
  ])("ALIAS_REGEX matches %s -> %s", (value, expected) => {
    expect(RegexUtils.ALIAS_REGEX.test(value)).toBe(expected);
  });
});
