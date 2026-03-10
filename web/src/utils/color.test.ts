import { describe, test, expect } from "vitest";

import { AntdColor } from "./color";

const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

const COLOR_GROUPS = [
  "RED",
  "VOLCANO",
  "ORANGE",
  "GOLD",
  "YELLOW",
  "LIME",
  "GREEN",
  "CYAN",
  "BLUE",
  "GEEKBLUE",
  "PURPLE",
  "MAGENTA",
  "GREY",
] as const;

describe("AntdColor", () => {
  describe.each(COLOR_GROUPS)("%s", (groupName) => {
    const group = AntdColor[groupName];

    test("has exactly 10 color entries", () => {
      expect(Object.keys(group)).toHaveLength(10);
    });

    test("all values are valid hex colors", () => {
      Object.values(group).forEach((value) => {
        expect(value).toMatch(HEX_COLOR_REGEX);
      });
    });

    test("keys follow naming convention", () => {
      for (let i = 0; i <= 9; i++) {
        expect(group).toHaveProperty(`${groupName}_${i}`);
      }
    });
  });
});
