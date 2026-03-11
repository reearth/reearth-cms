import { describe, test, expect } from "vitest";

import { AntdColor, CustomColor } from "./color";

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
  describe.each(COLOR_GROUPS)("%s", groupName => {
    const group = AntdColor[groupName];

    test("has exactly 10 color entries", () => {
      expect(Object.keys(group)).toHaveLength(10);
    });

    test("all values are valid hex colors", () => {
      Object.values(group).forEach(value => {
        expect(value).toMatch(HEX_COLOR_REGEX);
      });
    });

    test("keys follow naming convention", () => {
      for (let i = 0; i <= 9; i++) {
        expect(group).toHaveProperty(`${groupName}_${i}`);
      }
    });
  });

  describe("NEUTRAL", () => {
    const neutral = AntdColor.NEUTRAL;

    test("has all expected background tokens", () => {
      expect(neutral.BG_WHITE).toBe("#ffffff");
      expect(neutral.BG_ELEVATED).toBe("#fafafa");
      expect(neutral.BG_LAYOUT).toBe("#f5f5f5");
      expect(neutral.BG_LAYOUT_V4).toBe("#f0f2f5");
    });

    test("has all expected border tokens", () => {
      expect(neutral.BORDER).toBe("#d9d9d9");
      expect(neutral.BORDER_SECONDARY).toBe("#f0f0f0");
    });

    test("has all expected text tokens", () => {
      expect(neutral.TEXT).toBe("#000000d9");
      expect(neutral.TEXT_TERTIARY).toBe("#00000073");
      expect(neutral.TEXT_QUATERNARY).toBe("#00000040");
    });

    test("has all expected fill tokens", () => {
      expect(neutral.FILL).toBe("#00000026");
      expect(neutral.FILL_TERTIARY).toBe("rgba(0, 0, 0, 0.04)");
      expect(neutral.FILL_QUATERNARY).toBe("#00000008");
    });
  });
});

describe("CustomColor", () => {
  test("has all expected custom colors", () => {
    expect(CustomColor.AVATAR_BG).toBe("#ececec");
    expect(CustomColor.EDITOR_ERROR_GLYPH).toBe("#ecabbb");
    expect(CustomColor.FOCUS_RING_BLUE).toBe("rgba(5, 145, 255, 0.1)");
    expect(CustomColor.BORDER_SUBTLE).toBe("rgba(0, 0, 0, 0.03)");
  });
});
