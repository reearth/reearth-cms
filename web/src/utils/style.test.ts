import { describe, test, expect } from "vitest";

import { AntdColor, AntdToken, CustomColor } from "./style";

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

describe("AntdToken", () => {
  describe("FONT", () => {
    test("SIZE_SM matches antd v5 fontSizeSM (12px)", () => {
      expect(AntdToken.FONT.SIZE_SM).toBe(12);
    });

    test("SIZE matches antd v5 fontSize (14px)", () => {
      expect(AntdToken.FONT.SIZE).toBe(14);
    });

    test("SIZE_LG matches antd v5 fontSizeLG (16px)", () => {
      expect(AntdToken.FONT.SIZE_LG).toBe(16);
    });

    test("SIZE_XL matches antd v5 fontSizeXL (20px)", () => {
      expect(AntdToken.FONT.SIZE_XL).toBe(20);
    });

    test("SIZE_HEADING_3 matches antd v5 fontSizeHeading3 (24px)", () => {
      expect(AntdToken.FONT.SIZE_HEADING_3).toBe(24);
    });
  });

  describe("RADIUS", () => {
    test("XS matches antd v5 borderRadiusXS (2px)", () => {
      expect(AntdToken.RADIUS.XS).toBe(2);
    });

    test("SM matches antd v5 borderRadiusSM (4px)", () => {
      expect(AntdToken.RADIUS.SM).toBe(4);
    });

    test("BASE matches antd v5 borderRadius (6px)", () => {
      expect(AntdToken.RADIUS.BASE).toBe(6);
    });

    test("LG matches antd v5 borderRadiusLG (8px)", () => {
      expect(AntdToken.RADIUS.LG).toBe(8);
    });
  });

  describe("LINE_HEIGHT", () => {
    test("SM matches 12px font line-height (20px)", () => {
      expect(AntdToken.LINE_HEIGHT.SM).toBe(20);
    });

    test("BASE matches 14px font line-height (22px)", () => {
      expect(AntdToken.LINE_HEIGHT.BASE).toBe(22);
    });

    test("LG matches 16px font line-height (24px)", () => {
      expect(AntdToken.LINE_HEIGHT.LG).toBe(24);
    });
  });
});
